const { ok } = require("node:assert");
const { access } = require("node:fs/promises");
const { resolve: resolvePath } = require("node:path");
const {
  describe,
  it,
} = require("node:test");

const webpack = require("webpack");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Available after build.
const {
  createIdentifierNamesCache,
  mergeIdentifierNamesCaches,
  ObfuscatorPlugin,
} = require("obfuscator-webpack-plugin");

/**
 * @import {
 *   type Configuration as WebpackConfiguration,
 *   type Stats as WebpackStats,
 * } from "webpack";
 *
 * @import {
 *   type IdentifierNamesCache,
 *   type ObfuscatorPluginOptions,
 * } from "../../../../src";
 */

const SRC_DIR_PATH = resolvePath(
  __dirname,
  "..",
  "src",
);

const OUTPUT_DIR_PATH = resolvePath(
  __dirname,
  "..",
  "output",
);

/**
 * @param {WebpackConfiguration} config
 * @returns {Promise<WebpackStats>}
 */
async function compileWebpack(
  config,
)
{
  return new Promise(
    (resolve, reject) =>
    {
      webpack(
        config,
        (err, stats) =>
        {
          if (err != null)
          {
            reject(err);
            return;
          }
          else if (stats == null)
          {
            reject(new Error("No webpack stats provided"));
            return;
          }

          if (stats.hasErrors())
          {
            const err = new Error("Webpack compilation failed");
            err.cause = stats;
            reject(err);
            return;
          }
          else
          {
            resolve(stats);
          }
        },
      );
    },
  );
}

/**
 * @param {ObfuscatorPluginOptions | null} [pluginOptions]
 * @returns {WebpackConfiguration}
 */
function createWebpackConfig(
  pluginOptions,
)
{
  /**
   * @type {WebpackConfiguration}
   */
  return {
    bail: true,
    devtool: false,
    entry: {
      main: {
        import: resolvePath(
          SRC_DIR_PATH,
          "entry.js",
        ),
      },
    },
    mode: "production",
    optimization: {
      minimize: true,
      minimizer: [
        new ObfuscatorPlugin(pluginOptions),
      ],
    },
    output: {
      clean: true,
      path: OUTPUT_DIR_PATH,
    },
    target: "node",
  };
}

void describe(
  "ObfuscatorPlugin",
  (s) =>
  {
    void it(
      "obfuscates across chunks consistently",
      async (t) =>
      {
        /**
         * @type {Record<string, IdentifierNamesCache>}
         */
        const assetNameToIdentifierNamesCacheMapping = {};

        const config = createWebpackConfig({
          setupHooks(
            compilation,
            hooks,
          )
          {
            hooks.done.tap(
              "root",
              (sharedIdentifierNamesCache) =>
              {
                compilation.emitAsset(
                  "identifier-names-cache.json",
                  new compilation.compiler.webpack.sources.RawSource(
                    JSON.stringify(
                      assetNameToIdentifierNamesCacheMapping,
                      null,
                      2,
                    ),
                  ),
                );
              },
            );

            hooks.preObfuscation.tap(
              "root",
              (
                assetName,
                obfuscatorOptions,
              ) =>
              {
                obfuscatorOptions.renameGlobals = true;
              },
            );

            hooks.postObfuscation.tap(
              "root",
              (
                assetName,
                source,
                sharedIdentifierNamesCache,
              ) =>
              {
                assetNameToIdentifierNamesCacheMapping[assetName] = mergeIdentifierNamesCaches(
                  assetNameToIdentifierNamesCacheMapping[assetName],
                  sharedIdentifierNamesCache,
                );
              },
            );
          },
        });

        const stats = await compileWebpack(config);

        console.log(stats.toString({ colors: true }));
        console.log("\n== Identifier names caches by assets:");
        console.log(assetNameToIdentifierNamesCacheMapping);
        console.log("==");

        const statsJSON = stats.toJson();

        const { assets } = statsJSON;
        ok(
          assets != null,
          "Expected assets to be emitted.",
        );
        ok(
          assets.length === 3,
          "Expected 3 assets to be emitted.",
        );

        /**
         * @type {IdentifierNamesCache}
         */
        const seen = createIdentifierNamesCache();

        for (const assetName of Object.keys(assetNameToIdentifierNamesCacheMapping))
        {
          const identifierNamesCacheByAsset = assetNameToIdentifierNamesCacheMapping[assetName];
          for (const globalIdentifierName of Object.keys(identifierNamesCacheByAsset.globalIdentifiers ?? {}))
          {
            const obfuscatedGlobalIdentifierName = identifierNamesCacheByAsset.globalIdentifiers?.[globalIdentifierName];
            if (obfuscatedGlobalIdentifierName == null)
            {
              continue;
            }
            const existingObfuscatedGlobalIdentifierName = seen.globalIdentifiers?.[globalIdentifierName];
            if (existingObfuscatedGlobalIdentifierName != null)
            {
              ok(
                existingObfuscatedGlobalIdentifierName === obfuscatedGlobalIdentifierName,
                `Expected global identifier "${globalIdentifierName}" to be consistently obfuscated across assets.`,
              );
              continue;
            }
            seen.globalIdentifiers ??= {};
            seen.globalIdentifiers[globalIdentifierName] = obfuscatedGlobalIdentifierName;
          }
        }

        ok(
          (
            Object.keys(seen.globalIdentifiers ?? {}).length > 0
            || Object.keys(seen.propertyIdentifiers ?? {}).length > 0
          ),
          "Expected at least one global or property identifier to be obfuscated.",
        );

        const isIdentifierNamesCacheJSONFileEmitted = await access(
          resolvePath(
            OUTPUT_DIR_PATH,
            "identifier-names-cache.json",
          ),
        ).then(
          () => true,
        ).catch(
          () => false,
        );

        ok(
          isIdentifierNamesCacheJSONFileEmitted,
          "Expected `identifier-names-cache.json` file to be emitted.",
        );
      },
    );
  },
);
