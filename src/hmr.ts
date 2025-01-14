import {
  type Compilation,
  default as webpack,
} from "webpack";

export function checkIfHMREnabled(
  compilation: Compilation,
): boolean
{
  // @ts-expect-error - Missing types.
  const hot: unknown = compilation.options.devServer?.hot;

  if (typeof hot === "boolean" || hot === "only")
  {
    return !!hot;
  }

  return compilation.options.plugins.some(
    (plugin) =>
    {
      return plugin instanceof webpack.HotModuleReplacementPlugin;
    },
  );
}
