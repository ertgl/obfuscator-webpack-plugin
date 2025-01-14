import type { ObfuscatorOptions } from "javascript-obfuscator";

export type IdentifierNamesCache = (
  Exclude<
    ObfuscatorOptions["identifierNamesCache"],
    (
      | null
      | undefined
    )
  >
);

export function createIdentifierNamesCache(): IdentifierNamesCache
{
  return {
    globalIdentifiers: {},
    propertyIdentifiers: {},
  };
}

export function diffIdentifierNamesCaches(
  prev: IdentifierNamesCache,
  next?: IdentifierNamesCache | null,
)
{
  return {
    globalIdentifiers: (
      next?.globalIdentifiers == null
        ? {}
        : Object.keys(
            next.globalIdentifiers,
          ).filter(
            (identifier) =>
            {
              return prev.globalIdentifiers?.[identifier] == null;
            },
          )
    ),
    propertyIdentifiers: (
      next?.propertyIdentifiers == null
        ? {}
        : Object.keys(
            next.propertyIdentifiers,
          ).filter(
            (identifier) =>
            {
              return prev.propertyIdentifiers?.[identifier] == null;
            },
          )
    ),
  };
}

export function mergeIdentifierNamesCaches(
  base?: IdentifierNamesCache | null,
  overrides?: IdentifierNamesCache | null,
): IdentifierNamesCache
{
  return {
    ...base,
    ...overrides,
    globalIdentifiers: {
      ...(base?.globalIdentifiers ?? {}),
      ...(overrides?.globalIdentifiers ?? {}),
    },
    propertyIdentifiers: {
      ...(base?.propertyIdentifiers ?? {}),
      ...(overrides?.propertyIdentifiers ?? {}),
    },
  };
}

export function mergeIdentifierNamesCachesByReference(
  base: IdentifierNamesCache,
  overrides?: IdentifierNamesCache | null,
): void
{
  if (overrides == null)
  {
    return;
  }

  if (overrides.globalIdentifiers != null)
  {
    base.globalIdentifiers ??= {};
    Object.assign(base.globalIdentifiers, overrides.globalIdentifiers);
  }

  if (overrides.propertyIdentifiers != null)
  {
    base.propertyIdentifiers ??= {};
    Object.assign(base.propertyIdentifiers, overrides.propertyIdentifiers);
  }
}
