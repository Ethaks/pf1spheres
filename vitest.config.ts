import { defineConfig } from "vitest/config";
import path from "path";

const TEST_DIR = path.resolve(__dirname, "test");

const config = defineConfig({
  test: {
    dir: "test",
    include: [TEST_DIR + "/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    setupFiles: `${TEST_DIR}/setup.ts`,
    globals: true,
    globalSetup: "./test/setup.ts",
    coverage: {
      reporter: ["cobertura", "lcov", "text"],
      exclude: ["**/*-data.ts"],
      include: ["src/module"],
      all: true,
    },
  },
});

export default config;
