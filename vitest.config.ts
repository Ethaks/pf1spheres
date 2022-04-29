/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

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
    reporters: ["default", "junit"],
    outputFile: { junit: "junit.xml" },
    coverage: {
      reporter: ["cobertura", "lcov", "text"],
      exclude: ["**/*-data.ts"],
      include: ["src/module"],
      all: true,
    },
  },
});

export default config;
