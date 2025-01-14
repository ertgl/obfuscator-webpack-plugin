import { type Compilation } from "webpack";

export function checkIfTrustedTypesEnabled(
  compilation: Compilation,
): boolean
{
  return compilation.options.output.trustedTypes != null;
}
