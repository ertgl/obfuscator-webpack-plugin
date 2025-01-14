import { type ObfuscatorOptions } from "javascript-obfuscator";

import type { Assumptions } from "./assumptions";
import type { PluginHookSetupFunction } from "./plugin-hooks";

export interface ObfuscatorPluginOptions
{
  assumptions?: Assumptions | null ;
  cache?: boolean | null;
  exclude?: (RegExp | string)[] | null;
  options?: null | Partial<ObfuscatorOptions>;
  setupHooks?: null | PluginHookSetupFunction;
  stage?: null | number;
  test?: (RegExp | string)[] | null;
}

export const DEFAULT_TEST_REGEXP = /\.[cm]?js[x]?(?:\?.*)?$/iu;
