import { randomBytes } from "node:crypto";

import { type ObfuscatorOptions } from "javascript-obfuscator";

import type { Assumptions } from "./assumptions";
import { NODE_ENV } from "./env";
import { createIdentifierNamesCache } from "./registry";
import { RESERVED_NAMES_PRESET_ALL } from "./reserved";

export type MutableObfuscatorOptions = {
  -readonly [K in keyof ObfuscatorOptions]: ObfuscatorOptions[K];
};

export interface ObfuscatorOptionsResolutionOptions
{
  assumptions?: Assumptions | null;
  overrides?: null | ObfuscatorOptions;
}

export function resolveObfuscatorOptions(
  resolutionOptions?: null | ObfuscatorOptionsResolutionOptions,
): ObfuscatorOptions
{
  resolutionOptions ??= {};

  const assumptions = resolutionOptions.assumptions ?? {};
  const overrides = resolutionOptions.overrides ?? {};

  const nodeEnv = (
    assumptions.nodeEnv
    ?? NODE_ENV
  );

  const isProduction = nodeEnv === "production";
  const isDevelopment = !isProduction;

  const target = (
    overrides.target
    ?? assumptions.target
    ?? "browser"
  );

  const isBrowser = (
    target === "browser"
    || target === "browser-no-eval"
    || target === "service-worker"
  );

  const isNode = !isBrowser;

  const debugProtection = !isNode;

  const debugProtectionInterval = (
    isDevelopment
      ? 120_000
      : 4_000
  );

  const disableConsoleOutput = isProduction && !isNode;

  const domainLockRedirectUrl = (
    overrides.domainLockRedirectUrl
    ?? "about:blank"
  );

  const identifierNamesCache = (
    overrides.identifierNamesCache
    ?? createIdentifierNamesCache()
  );

  const reservedNames: Exclude<ObfuscatorOptions["reservedNames"], undefined> = (
    overrides.reservedNames
    ?? Object.keys(RESERVED_NAMES_PRESET_ALL)
  );

  const seed = (
    overrides.seed
    ?? randomBytes(64).toString("hex")
  );

  const selfDefending = isNode;

  const simplify = isBrowser;

  let stringArrayEncoding = overrides.stringArrayEncoding;
  let usingRC4 = true;

  if (stringArrayEncoding != null)
  {
    usingRC4 = stringArrayEncoding.includes("rc4");
  }

  stringArrayEncoding ??= [
    usingRC4
      ? "rc4"
      : "base64",
  ];

  const stringArrayIndexShift = isNode;
  const stringArrayRotate = isNode;

  return {
    compact: true,
    controlFlowFlattening: false,
    controlFlowFlatteningThreshold: 0.05,
    deadCodeInjection: false,
    deadCodeInjectionThreshold: 0.05,
    debugProtection,
    debugProtectionInterval,
    disableConsoleOutput,
    domainLock: [],
    domainLockRedirectUrl,
    forceTransformStrings: [],
    identifierNamesCache,
    identifierNamesGenerator: "hexadecimal",
    identifiersDictionary: [],
    identifiersPrefix: "",
    ignoreImports: true,
    ignoreRequireImports: true,
    inputFileName: "",
    log: false,
    numbersToExpressions: false,
    optionsPreset: "default",
    renameGlobals: false,
    renameProperties: false,
    renamePropertiesMode: "safe",
    reservedNames,
    reservedStrings: [],
    seed,
    selfDefending,
    simplify,
    sourceMap: true,
    sourceMapBaseUrl: "",
    sourceMapFileName: "",
    sourceMapMode: "separate",
    sourceMapSourcesMode: "sources-content",
    splitStrings: false,
    splitStringsChunkLength: 5,
    stringArray: false,
    stringArrayCallsTransform: false,
    stringArrayCallsTransformThreshold: 0.05,
    stringArrayEncoding,
    stringArrayIndexesType: [
      "hexadecimal-number",
    ],
    stringArrayIndexShift,
    stringArrayRotate,
    stringArrayShuffle: false,
    stringArrayThreshold: 0.05,
    stringArrayWrappersChainedCalls: false,
    stringArrayWrappersCount: 1,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: "variable",
    target,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    ...overrides,
  };
}
