import type {
  Compilation,
  sources as webpackSources,
} from "webpack";

import type { IdentifierNamesCache } from "./registry";

export type CompilationCacheFacade = ReturnType<Compilation["getCache"]>;

export type CompilationItemCacheFacade = ReturnType<CompilationCacheFacade["getItemCache"]>;

export type ObfuscationCacheData = {
  addedIdentifierNamesCache: IdentifierNamesCache;
  source: webpackSources.Source;
};
