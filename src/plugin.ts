import {
  default as JavascriptObfuscator,
  type ObfuscatorOptions,
} from "javascript-obfuscator";
import {
  type Compilation,
  type Compiler,
  default as webpack,
} from "webpack";

import {
  type Assumptions,
  prepareAssumptions,
} from "./assumptions";
import type {
  CompilationItemCacheFacade,
  ObfuscationCacheData,
} from "./cache";
import type { CompilationContext } from "./compilation";
import { resolveObfuscatorOptions } from "./obfuscator-options";
import {
  type CompilationToPluginHooksWeakMap,
  createCompilationToPluginHooksWeakMap,
  getOrCreatePluginHooksForCompilation,
  type PluginHookSetupCallbackFunction,
} from "./plugin-hooks";
import {
  DEFAULT_TEST_REGEXP,
  type ObfuscatorPluginOptions,
} from "./plugin-options";
import {
  createIdentifierNamesCache,
  diffIdentifierNamesCaches,
  type IdentifierNamesCache,
  mergeIdentifierNamesCaches,
  mergeIdentifierNamesCachesByReference,
} from "./registry";
import type {
  NormalizedStats,
  StatsPrinter,
} from "./stats";

export const PLUGIN_NAME = "ObfuscatorPlugin";

export class ObfuscatorPlugin
{
  compilationToPluginHooksWeakMap: CompilationToPluginHooksWeakMap;

  options: ObfuscatorPluginOptions;

  sharedIdentifierNamesCache: IdentifierNamesCache;

  constructor(
    options?: null | ObfuscatorPluginOptions,
  )
  {
    this.options = options ?? {};

    this.sharedIdentifierNamesCache = createIdentifierNamesCache();

    this.compilationToPluginHooksWeakMap = createCompilationToPluginHooksWeakMap();
  }

  apply(
    compiler: Compiler,
  ): void
  {
    compiler.hooks.compilation.tap(
      PLUGIN_NAME,
      this.handleCompilation.bind(
        this,
        compiler,
      ),
    );
  }

  checkIfCacheIsEnabled(
    assumptions: Assumptions,
  ): boolean
  {
    return (
      this.options.cache
      ?? assumptions.hmr
      ?? false
    );
  }

  handleCompilation(
    compiler: Compiler,
    compilation: Compilation,
  ): void
  {
    compilation.hooks.statsPrinter.tap(
      PLUGIN_NAME,
      this.setupStatsPrinter.bind(this),
    );

    this.sharedIdentifierNamesCache = mergeIdentifierNamesCaches(
      createIdentifierNamesCache(),
      this.options.options?.identifierNamesCache,
    );

    const hooks = getOrCreatePluginHooksForCompilation(
      this.compilationToPluginHooksWeakMap,
      compilation,
    );

    this.options.setupHooks?.(
      compilation,
      hooks,
    );

    const assumptions = prepareAssumptions(
      compilation,
      {
        options: this.options.options,
        overrides: this.options.assumptions,
      },
    );

    const cache = (
      this.checkIfCacheIsEnabled(assumptions)
        ? compilation.getCache(PLUGIN_NAME)
        : null
    );

    const context: CompilationContext = {
      assumptions,
      cache,
      hooks,
    };

    compilation.hooks.processAssets.tapAsync(
      {
        additionalAssets: true,
        name: PLUGIN_NAME,
        stage: (
          this.options.stage
          ?? webpack.Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING
        ),
      },
      this.handleProcessedAssets.bind(
        this,
        compiler,
        compilation,
        context,
      ),
    );
  }

  handleProcessedAssets(
    compiler: Compiler,
    compilation: Compilation,
    context: CompilationContext,
    assets: Compilation["assets"],
    callback: () => void,
  ): void
  {
    void this.obfuscateAssets(
      compiler,
      compilation,
      context,
      assets,
    ).then(
      async () =>
      {
        await context.hooks.done.promise(
          this.sharedIdentifierNamesCache,
        ).finally(
          callback,
        );
      },
    );
  }

  async obfuscateAsset(
    compilation: Compilation,
    context: CompilationContext,
    assetName: string,
  ): Promise<void>
  {
    let asset = null;
    try
    {
      asset = compilation.getAsset(assetName);
    }
    catch (err)
    {
      console.error(err);
    }

    if (asset == null)
    {
      return;
    }

    const {
      assumptions,
      cache,
      hooks,
    } = context;

    let itemCache: CompilationItemCacheFacade | null = null;

    if (cache != null)
    {
      const etag = cache.getLazyHashedEtag(asset.source);
      itemCache = cache.getItemCache(assetName, etag);
      const cachedObfuscationData: null | ObfuscationCacheData | undefined = await itemCache.getPromise();

      if (cachedObfuscationData != null)
      {
        compilation.updateAsset(
          assetName,
          cachedObfuscationData.source,
        );

        mergeIdentifierNamesCachesByReference(
          this.sharedIdentifierNamesCache,
          cachedObfuscationData.addedIdentifierNamesCache,
        );

        return;
      }
    }

    const inputSource = asset.source.source();

    const inputSourceString = (
      Buffer.isBuffer(inputSource)
        ? inputSource.toString()
        : inputSource
    );

    const inputSourceMap = asset.source.map();

    const obfuscatorOptions = resolveObfuscatorOptions({
      assumptions,
      overrides: this.prepareObfuscatorOptionOverrides(assetName),
    });

    await hooks.preObfuscation.promise(
      assetName,
      obfuscatorOptions,
    );

    const isIdentifierNamesCacheSetToNull = obfuscatorOptions.identifierNamesCache == null;

    if (isIdentifierNamesCacheSetToNull)
    {
      const logger = compilation.getLogger(PLUGIN_NAME);

      if (obfuscatorOptions.identifierNamesCache == null)
      {
        logger.warn(
          "The \`identifierNamesCache\` option is required for consistent obfuscation.",
        );
      }
    }

    mergeIdentifierNamesCachesByReference(
      this.sharedIdentifierNamesCache,
      obfuscatorOptions.identifierNamesCache,
    );

    const obfuscationResult = JavascriptObfuscator.obfuscate(
      inputSourceString,
      obfuscatorOptions,
    );

    const outputSourceString = obfuscationResult.getObfuscatedCode();
    const outputSourceMap = obfuscationResult.getSourceMap();

    const obfuscatedSource = new webpack.sources.SourceMapSource(
      outputSourceString,
      assetName,
      outputSourceMap,
      inputSource,
      // @ts-expect-error - Mismatched types.
      inputSourceMap,
      true,
    );

    const newIdentifierNamesCache = obfuscationResult.getIdentifierNamesCache();

    const addedIdentifierNamesCache = (
      itemCache == null
        ? null
        : diffIdentifierNamesCaches(
            this.sharedIdentifierNamesCache,
            newIdentifierNamesCache,
          )
    );

    mergeIdentifierNamesCachesByReference(
      this.sharedIdentifierNamesCache,
      newIdentifierNamesCache,
    );

    await hooks.postObfuscation.promise(
      assetName,
      obfuscatedSource,
      this.sharedIdentifierNamesCache,
    );

    if (itemCache != null)
    {
      await itemCache.storePromise(
        {
          addedIdentifierNamesCache: addedIdentifierNamesCache as IdentifierNamesCache,
          source: obfuscatedSource,
        } satisfies ObfuscationCacheData,
      );
    }

    const newInfo = {
      obfuscated: true,
    };

    compilation.updateAsset(
      assetName,
      obfuscatedSource,
      newInfo,
    );
  }

  async obfuscateAssets(
    compiler: Compiler,
    compilation: Compilation,
    context: CompilationContext,
    assets: Compilation["assets"],
  ): Promise<void>
  {
    for (const assetName of Object.keys(assets))
    {
      const shouldProceed = this.shouldObfuscateAsset(
        compiler,
        compilation,
        context,
        assetName,
      );

      if (!shouldProceed)
      {
        continue;
      }

      await this.obfuscateAsset(
        compilation,
        context,
        assetName,
      );
    }
  }

  prepareObfuscatorOptionOverrides(
    assetName: string,
  ): ObfuscatorOptions
  {
    return {
      ...(this.options.options ?? {}),
      identifierNamesCache: this.sharedIdentifierNamesCache,
      inputFileName: assetName,
      sourceMapFileName: assetName + ".map",
      sourceMapMode: "separate",
    };
  }

  public setupHooks(
    compilation: Compilation,
    callback: PluginHookSetupCallbackFunction,
  )
  {
    callback(
      getOrCreatePluginHooksForCompilation(
        this.compilationToPluginHooksWeakMap,
        compilation,
      ),
    );
  }

  setupStatsPrinter(
    statsPrinter: StatsPrinter,
    normalizedStats: NormalizedStats,
  ): void
  {
    statsPrinter.hooks.print.for(
      "asset.info.obfuscated",
    ).tap(
      PLUGIN_NAME,
      (
        obfuscated: boolean,
        {
          cyan,
          formatFlag,
        },
      ) =>
      {
        return (
          obfuscated
            ? cyan?.(formatFlag?.("obfuscated") ?? "obfuscated") ?? "obfuscated"
            : ""
        );
      },
    );
  }

  shouldObfuscateAsset(
    compiler: Compiler,
    compilation: Compilation,
    context: CompilationContext,
    assetName: string,
  ): boolean
  {
    const asset = compilation.getAsset(assetName);

    if (asset == null)
    {
      return false;
    }

    if (asset.info.obfuscated && context.cache != null)
    {
      return false;
    }

    if (asset.info.development)
    {
      return false;
    }

    return compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
      undefined,
      {
        exclude: this.options.exclude ?? [],
        test: this.options.test ?? [
          DEFAULT_TEST_REGEXP,
        ],
      },
    )(assetName);
  }
}
