import type { Compilation } from "webpack";

export function checkIfDevtoolUsesEval(
  compilation: Compilation,
): boolean
{
  const { devtool } = compilation.options;

  return (
    typeof devtool === "string"
    && (
      devtool === "eval"
      || devtool.startsWith("eval-")
      || devtool.includes("-eval-")
    )
  );
}
