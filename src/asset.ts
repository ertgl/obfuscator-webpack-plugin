export type AssetName = string;

declare module "webpack"
{
  export interface KnownAssetInfo
  {
    obfuscated?: boolean;
  }
}
