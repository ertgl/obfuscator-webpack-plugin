import type { Assumptions } from "./assumptions";
import type { CompilationCacheFacade } from "./cache";
import type { PluginHooks } from "./plugin-hooks";

export type CompilationContext = {
  assumptions: Assumptions;
  cache: CompilationCacheFacade | null;
  hooks: PluginHooks;
};
