import type { Compilation } from "webpack";

export const NODE_ENV = (
  process.env.NODE_ENV
  || "development"
);

export function getNodeEnvFromWebpackCompilation(
  compilation: Compilation,
): null | string
{
  return (
    (
      (
        compilation.compiler.options.mode != null
        && compilation.compiler.options.mode !== "none"
      )
        ? compilation.compiler.options.mode
        : null
    )
    ?? (
      (
        compilation.compiler.options.optimization.nodeEnv != null
        && compilation.compiler.options.optimization.nodeEnv !== false
      )
        ? (
            compilation.compiler.options.optimization.nodeEnv === "production"
              ? "production"
              : "development"
          )
        : null
    )
  );
}

export function getNodeEnvModeFromWebpackCompilation(
  compilation: Compilation,
): "development" | "production" | null
{
  const nodeEnv = getNodeEnvFromWebpackCompilation(compilation);
  if (nodeEnv == null)
  {
    return null;
  }
  return (
    nodeEnv === "production"
      ? "production"
      : "development"
  );
}
