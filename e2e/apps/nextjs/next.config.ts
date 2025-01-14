import type { NextConfig } from "next";
import type { WebpackConfigContext } from "next/dist/server/config-shared";
import type { Configuration as WebpackConfiguration } from "webpack";

import { ObfuscatorPlugin } from "obfuscator-webpack-plugin";

const nextConfig: NextConfig = {
  webpack(
    webpackConfig: WebpackConfiguration,
    webpackContext: WebpackConfigContext,
  )
  {
    webpackConfig.optimization ??= {};

    webpackConfig.optimization.minimize = true;
    webpackConfig.optimization.minimizer ??= [];

    webpackConfig.optimization.minimizer.push(
      new ObfuscatorPlugin({
        assumptions: {
          csp: false,
          hmr: webpackContext.dev,
          nodeEnv: (
            !webpackContext.dev
              ? "production"
              : "development"
          ),
          target: (
            webpackContext.isServer
              ? "node"
              : "browser"
          ),
        },
        exclude: [
          /(?:.+[_])?(?:client|server)-reference-manifest.js$/iu,
        ],
      }),
    );

    return webpackConfig;
  },
};

export default nextConfig;
