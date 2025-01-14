import { isAbsolute as isAbsolutePath } from "node:path";

import queryBrowserslist from "browserslist";
import type { Configuration as WebpackConfiguration } from "webpack";

import type { TargetPlatform } from "./target";

export function determineTargetPlatformFromWebpackBrowserslistTargetEntries(
  targetEntries: string[],
): TargetPlatform
{
  for (const targetEntry of targetEntries)
  {
    const browserslist = queryBrowserslistByWebpackTargetEntry(
      targetEntry,
    );

    for (const segment of browserslist)
    {
      if (segment.startsWith("node "))
      {
        return "node";
      }
    }
  }

  return "browser";
}

export function extractBrowserslistQueriesFromWebpackTarget(
  target: WebpackConfiguration["target"],
): string[]
{
  if (target == null || target === false)
  {
    return [];
  }
  else if (typeof target === "string")
  {
    if (isWebpackTargetEntryBrowserslistQuery(target))
    {
      return [target];
    }
    return [];
  }
  else if (Array.isArray(target))
  {
    return target.filter(isWebpackTargetEntryBrowserslistQuery);
  }

  return [];
}

export function isWebpackTargetEntryBrowserslistQuery(
  entry: string,
): boolean
{
  return (
    entry === "browserslist"
    || entry.startsWith("browserslist:")
  );
}

export function queryBrowserslistByWebpackTargetEntry(
  target: string,
): string[]
{
  const segments = target.split(":");

  if (segments[0] !== "browserslist")
  {
    throw new Error(`Invalid target: ${target}`);
  }

  const browserslistrcFilePath = (
    isAbsolutePath(segments[1])
      ? segments[1]
      : undefined
  );

  const query = (
    browserslistrcFilePath != null
      ? undefined
      : (
          segments[1] === "defaults"
            ? segments[1]
            : (
                segments[1].match(/\s+/u) != null
                  ? segments[1]
                  : undefined
              )
        )
  );

  const env = (
    browserslistrcFilePath != null
      ? segments[2]
      : (
          query != null
            ? segments[2]
            : segments[1]
        )
  );

  return queryBrowserslist(
    query,
    {
      config: browserslistrcFilePath,
      env,
    },
  );
}
