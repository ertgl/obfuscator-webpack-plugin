import { AsyncParallelHook } from "tapable";
import type {
  Compilation,
  sources as webpackSources,
} from "webpack";

import type { AssetName } from "./asset";
import type { MutableObfuscatorOptions } from "./obfuscator-options";
import type { IdentifierNamesCache } from "./registry";

export type CompilationToPluginHooksWeakMap = WeakMap<Compilation, PluginHooks>;

export type DoneHook = AsyncParallelHook<DoneHookParameters, void>; ;

export type DoneHookParameters = [
  IdentifierNamesCache,
];

export interface PluginHooks
{
  done: DoneHook;
  postObfuscation: PostObfuscationHook;
  preObfuscation: PreObfuscationHook;
}

export type PluginHookSetupCallbackFunction = (
  hooks: PluginHooks,
) => void;

export type PluginHookSetupFunction = (
  compilation: Compilation,
  hooks: PluginHooks,
) => void;

export type PostObfuscationHook = AsyncParallelHook<PostObfuscationHookParameters, void>;

export type PostObfuscationHookParameters = [
  AssetName,
  webpackSources.SourceMapSource,
  IdentifierNamesCache,
];

export type PreObfuscationHook = AsyncParallelHook<PreObfuscationHookParameters, void>;

export type PreObfuscationHookParameters = [
  AssetName,
  MutableObfuscatorOptions,
];

export function createCompilationToPluginHooksWeakMap(): CompilationToPluginHooksWeakMap
{
  return new WeakMap();
}

export function createPluginHooks(): PluginHooks
{
  return {
    done: new AsyncParallelHook(
      [
        "sharedIdentifierNamesCache",
      ] as const,
      "done",
    ),
    postObfuscation: new AsyncParallelHook(
      [
        "assetName",
        "source",
        "sharedIdentifierNamesCache",
      ] as const,
      "postObfuscation",
    ),
    preObfuscation: new AsyncParallelHook(
      [
        "assetName",
        "options",
      ] as const,
      "preObfuscation",
    ),
  };
}

export function getOrCreatePluginHooksForCompilation(
  map: CompilationToPluginHooksWeakMap,
  compilation: Compilation,
): PluginHooks
{
  let hooks = map.get(compilation);
  if (hooks == null)
  {
    hooks = createPluginHooks();
    map.set(compilation, hooks);
  }
  return hooks;
}
