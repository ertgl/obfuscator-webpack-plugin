import type { ObfuscatorOptions } from "javascript-obfuscator";
import type { Compilation } from "webpack";

import type { Assumptions } from "./assumptions";
import {
  determineTargetPlatformFromWebpackBrowserslistTargetEntries,
  extractBrowserslistQueriesFromWebpackTarget,
} from "./browserslist";

export type ObfuscatorTarget = (
  Exclude<
    ObfuscatorOptions["target"],
    (
      | null
      | undefined
    )
  >
);

export type TargetPlatform = "browser" | "node";

export function determineObfuscatorTargetFromWebpackCompilation(
  compilation: Compilation,
  assumptions: Pick<Assumptions, "csp">,
): null | ObfuscatorTarget
{
  let target: null | ObfuscatorTarget = null;

  if (
    compilation.options.target === "web"
    || compilation.options.target === "webworker"
    || compilation.options.externalsPresets.web
    || compilation.options.externalsPresets.webAsync
  )
  {
    target = "browser";
  }
  else if (
    compilation.options.target === "node"
    || compilation.options.externalsPresets.node
    || compilation.options.externalsPresets.electron
    || compilation.options.externalsPresets.electronMain
    || compilation.options.externalsPresets.electronPreload
    || compilation.options.externalsPresets.electronRenderer
    // eslint-disable-next-line @cspell/spellchecker
    || compilation.options.externalsPresets.nwjs
  )
  {
    target = "node";
  }
  else
  {
    const browserslistTargetEntries = extractBrowserslistQueriesFromWebpackTarget(
      compilation.options.target,
    );

    if (browserslistTargetEntries.length > 0)
    {
      target = determineTargetPlatformFromWebpackBrowserslistTargetEntries(
        browserslistTargetEntries,
      );
    }

    if (target === "browser" && assumptions.csp)
    {
      target = "browser-no-eval";
    }
  }

  return target;
}
