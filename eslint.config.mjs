import { createRequire } from "node:module";
import {
  dirname,
  relative as getRelativePath,
  join as joinPaths,
  resolve as resolvePath,
} from "node:path";
import { fileURLToPath } from "node:url";

import cspellPlugin from "@cspell/eslint-plugin";
import javascriptPlugin from "@eslint/js";
import jsonPlugin from "@eslint/json";
import markdownPlugin from "@eslint/markdown";
import stylisticPlugin from "@stylistic/eslint-plugin";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import ymlPlugin from "eslint-plugin-yml";
import globals from "globals";
import typescriptPlugin from "typescript-eslint";

import E2E_PACKAGE from "./e2e/package.json" with { type: "json" };

/**
 * @import { type StylisticCustomizeOptions } from "@stylistic/eslint-plugin";
 * @import { type Linter } from "eslint";
 * @import { type Config } from "typescript-eslint";
 * @import fastGlobModule from "fast-glob";
 */

const require = createRequire(import.meta.url);

/**
 * @type {typeof fastGlobModule}
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const fastGlob = require("fast-glob");
const { glob } = fastGlob;

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const E2E_DIR_PATH = resolvePath(__dirname, "e2e");

const PATTERN_ALL = "**/*";

const PATTERN_CJS_JS_MJS = "**/*.{cjs,js,mjs}";

const PATTERN_CJSX_JSX_MJSX = `${PATTERN_CJS_JS_MJS}x`;

const PATTERN_CTS_MTS_TS = "**/*.{cts,mts,ts}";

const PATTERN_CTSX_MTSX_TSX = `${PATTERN_CTS_MTS_TS}x`;

const PATTERN_CJS_CJSX_CTS_CTSX = `**/*.{cjs,cjsx,cts,ctsx}`;

const PATTERN_JS_JSX_TS_TSX = `**/*.{js,jsx,ts,tsx}`;

const PATTERN_MJS_MJSX_MTS_MTSX = `**/*.{mjs,mjsx,mts,mtsx}`;

const PATTERN_JSON = "**/*.json";

const PATTERN_MD = "**/*.md";

const PATTERN_YAML_YML = "**/*.{yaml,yml}";

/**
 * @type {Linter.Config["languageOptions"]}
 */
const eslintBaseLanguageOptions = {
  parserOptions: {
    projectService: true,
    tsconfigRootDir: __dirname,
    warnOnUnsupportedTypeScriptVersion: false,
  },
};

/**
 * @type {StylisticCustomizeOptions}
 */
const stylisticBaseCustomizationOptions = {
  arrowParens: true,
  blockSpacing: true,
  braceStyle: "allman",
  commaDangle: "always-multiline",
  flat: true,
  indent: 2,
  jsx: false,
  quoteProps: "consistent-as-needed",
  quotes: "double",
  semi: true,
};

const E2E_WORKSPACE_DIR_PATHS = await glob(
  E2E_PACKAGE.workspaces,
  {
    absolute: true,
    cwd: E2E_DIR_PATH,
    onlyDirectories: true,
  },
);

/**
 * @type {Config}
 */
export default typescriptPlugin.config([
  {
    files: [
      PATTERN_ALL,
    ],
    plugins: {
      "@cspell": cspellPlugin,
    },
    rules: {
      "@cspell/spellchecker": [
        "warn",
        {
          autoFix: false,
          checkComments: true,
          checkIdentifiers: true,
          checkJSXText: true,
          checkStrings: true,
          checkStringTemplates: true,
          configFile: resolvePath(
            __dirname,
            "cspell.config.yaml",
          ),
          generateSuggestions: true,
          ignoreImportProperties: false,
          ignoreImports: false,
          numSuggestions: Infinity,
        },
      ],
    },
  },

  {
    ...javascriptPlugin.configs.recommended,
    files: [
      PATTERN_CJS_JS_MJS,
      PATTERN_CJSX_JSX_MJSX,
    ],
  },

  {
    files: [
      PATTERN_CJS_JS_MJS,
      PATTERN_CJSX_JSX_MJSX,
    ],
    rules: {
      "no-unused-vars": [
        "warn",
        {
          args: "none",
        },
      ],
    },
  },

  ...typescriptPlugin.configs.strictTypeChecked.map(
    (config) =>
    {
      return {
        ...config,
        files: [
          PATTERN_CJS_JS_MJS,
          PATTERN_CJSX_JSX_MJSX,
          PATTERN_CTS_MTS_TS,
          PATTERN_CTSX_MTSX_TSX,
        ],
      };
    },
  ),

  {
    files: [
      PATTERN_CJS_JS_MJS,
      PATTERN_CJSX_JSX_MJSX,
      PATTERN_CTS_MTS_TS,
      PATTERN_CTSX_MTSX_TSX,
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "none",
        },
      ],
    },
  },

  {
    files: [
      PATTERN_CJS_CJSX_CTS_CTSX,
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  {
    files: [
      PATTERN_CJS_JS_MJS,
      PATTERN_CTS_MTS_TS,
    ],
    languageOptions: {
      ...eslintBaseLanguageOptions,
    },
  },

  {
    files: [
      PATTERN_CJSX_JSX_MJSX,
      PATTERN_CTSX_MTSX_TSX,
    ],
    languageOptions: {
      ...eslintBaseLanguageOptions,
      parserOptions: {
        ...eslintBaseLanguageOptions.parserOptions,
        ecmaFeatures: {
          ...eslintBaseLanguageOptions.parserOptions?.ecmaFeatures,
          jsx: true,
        },
      },
    },
  },

  {
    files: [
      PATTERN_CJS_CJSX_CTS_CTSX,
    ],
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.commonjs,
        ...globals.node,
        ...globals.nodeBuiltin,
      },
    },
  },

  {
    files: [
      PATTERN_JS_JSX_TS_TSX,
    ],
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.commonjs,
        ...globals.es2025,
      },
    },
  },

  {
    files: [
      PATTERN_MJS_MJSX_MTS_MTSX,
    ],
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.es2025,
      },
    },
  },

  {
    ...stylisticPlugin.configs.customize({
      ...stylisticBaseCustomizationOptions,
    }),
    files: [
      PATTERN_CJS_JS_MJS,
      PATTERN_CTS_MTS_TS,
    ],
  },

  {
    ...stylisticPlugin.configs.customize({
      ...stylisticBaseCustomizationOptions,
      jsx: true,
    }),
    files: [
      PATTERN_CJSX_JSX_MJSX,
      PATTERN_CTSX_MTSX_TSX,
    ],
  },

  {
    ...perfectionistPlugin.configs["recommended-natural"],
    files: [
      PATTERN_CJS_JS_MJS,
      PATTERN_CJSX_JSX_MJSX,
      PATTERN_CTS_MTS_TS,
      PATTERN_CTSX_MTSX_TSX,
    ],
  },

  {
    files: [
      PATTERN_CJS_JS_MJS,
      PATTERN_CJSX_JSX_MJSX,
      PATTERN_CTS_MTS_TS,
      PATTERN_CTSX_MTSX_TSX,
    ],
    rules: {
      "perfectionist/sort-imports": [
        "error",
        {
          customGroups: {
            type: {
              "node-type": /^node:.+$/iu.source,
            },
            value: {
              node: /^node:.+$/iu.source,
            },
          },
          groups: [
            [
              "node-type",
              "node",
              "builtin",
            ],
            [
              "type",
              "external",
            ],
            [
              "internal-type",
              "internal",
            ],
            [
              "parent-type",
              "parent",
            ],
            [
              "sibling-type",
              "sibling",
            ],
            [
              "index-type",
              "index",
            ],
            ["object"],
            ["unknown"],
          ],
          ignoreCase: false,
          internalPattern: [
            /^obfuscator-webpack-plugin(?:[\\/].*)?$/iu.source,
          ],
          newlinesBetween: "always",
          tsconfigRootDir: __dirname,
        },
      ],
    },
  },

  {
    ...jsonPlugin.configs.recommended,
    files: [
      PATTERN_JSON,
    ],
    language: "json/json",
  },

  ...markdownPlugin.configs.recommended.map(
    (
      /**
       * @type {Record<string, unknown>}
       */
      config,
    ) =>
    {
      return {
        ...config,
        files: [
          PATTERN_MD,
        ],
        language: "markdown/gfm",
      };
    },
  ),

  {
    files: [
      PATTERN_MD,
    ],
    rules: {
      "markdown/no-reversed-media-syntax": "off",
    },
  },

  ...ymlPlugin.configs["flat/recommended"].map(
    (config) =>
    {
      return {
        ...config,
        files: [
          PATTERN_YAML_YML,
        ],
      };
    },
  ),

  {
    files: [
      PATTERN_YAML_YML,
    ],
    rules: {
      "yml/no-empty-mapping-value": "off",
    },
  },

  {
    ignores: [
      resolvePath(__dirname, ".husky", "_"),
      resolvePath(__dirname, ".yarn"),
      resolvePath(__dirname, "dist"),
      resolvePath(__dirname, "node_modules"),
    ].map(
      (absoluteIgnorePath) =>
      {
        return joinPaths(
          getRelativePath(__dirname, absoluteIgnorePath),
          "**",
          "*",
        );
      },
    ),
  },

  {
    ignores: [
      resolvePath(E2E_DIR_PATH, "node_modules"),
      resolvePath(E2E_DIR_PATH, "apps", "nextjs", ".next"),
      resolvePath(E2E_DIR_PATH, "apps", "nextjs", ".swc"),
    ].map(
      (absoluteIgnorePath) =>
      {
        return joinPaths(
          getRelativePath(__dirname, absoluteIgnorePath),
          "**",
          "*",
        );
      },
    ),
  },

  {
    ignores: E2E_WORKSPACE_DIR_PATHS.flatMap(
      (e2eWorkspaceDirPath) =>
      {
        return [
          resolvePath(e2eWorkspaceDirPath, "node_modules"),
          resolvePath(e2eWorkspaceDirPath, "output"),
        ].map(
          (absoluteIgnorePath) =>
          {
            return joinPaths(
              getRelativePath(__dirname, absoluteIgnorePath),
              "**",
              "*",
            );
          },
        );
      },
    ),
  },
]);
