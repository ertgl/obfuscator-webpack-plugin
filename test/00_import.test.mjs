import { strictEqual } from "node:assert";
import { test } from "node:test";

void test(
  "importing the plugin",
  async (t) =>
  {
    const {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Available after build.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ObfuscatorPlugin,
    } = await import("obfuscator-webpack-plugin");

    strictEqual(typeof ObfuscatorPlugin, "function");
  },
);
