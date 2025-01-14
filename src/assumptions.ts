import type { ObfuscatorOptions } from "javascript-obfuscator";
import type { Compilation } from "webpack";

import { checkIfDevtoolUsesEval } from "./devtool";
import {
  getNodeEnvModeFromWebpackCompilation,
  NODE_ENV,
} from "./env";
import { checkIfHMREnabled } from "./hmr";
import {
  determineObfuscatorTargetFromWebpackCompilation,
  type ObfuscatorTarget,
} from "./target";
import { checkIfTrustedTypesEnabled } from "./trusted-types";

export interface Assumptions
{
  csp?: boolean | null;
  hmr?: boolean | null;
  nodeEnv?: null | string;
  target?: null | ObfuscatorTarget;
}

export interface AssumptionsPreparationOptions
{
  options?: null | ObfuscatorOptions;
  overrides?: Assumptions | null;
}

export function prepareAssumptions(
  compilation: Compilation,
  options?: AssumptionsPreparationOptions | null,
): Assumptions
{
  options ??= {};

  const overrides = options.overrides ?? {};

  const csp = (
    overrides.csp
    ?? (
      !checkIfDevtoolUsesEval(compilation)
      && checkIfTrustedTypesEnabled(compilation)
    )
  );

  const hmr = (
    overrides.hmr
    ?? checkIfHMREnabled(compilation)
  );

  const nodeEnv = (
    overrides.nodeEnv
    ?? getNodeEnvModeFromWebpackCompilation(compilation)
    ?? NODE_ENV
  );

  const target: ObfuscatorTarget = (
    options.options?.target
    ?? overrides.target
    ?? determineObfuscatorTargetFromWebpackCompilation(
      compilation,
      {
        csp,
      },
    )
    ?? "browser"
  );

  return {
    csp,
    hmr,
    nodeEnv,
    target,
  };
}
