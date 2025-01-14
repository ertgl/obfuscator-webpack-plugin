import nextJest from "next/jest.js";

/**
 * @import { type Config } from "jest";
 */

const createNextJestConfig = nextJest({
  dir: "./",
});

/**
 * @type {Config}
 */
const config = {
  testEnvironment: "jsdom",
  testMatch: [
    "**/*.{spec,test}.{cjs,cjsx,cts,ctsx,js,jsx,mjs,mjsx,mts,mtsx,ts,tsx}",
  ],
};

const nextJestConfig = createNextJestConfig(config);

export default nextJestConfig;
