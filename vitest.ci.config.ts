/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import defaultConfig from "./vitest.config";

const config = defaultConfig;
if (!config.test) throw new Error("No test config found!");
config.test.reporters = ["default", "junit"];
config.test.outputFile = { junit: "junit.xml" };
config.test.coverage = {
  reporter: ["cobertura", "lcov", "text"],
  all: true,
  include: ["src/module"],

  exclude: [
    // Exclude data.ts files, since they should only contain declarations or immediately adjacent minimal code
    "**/*-data.ts",
    // Exclude pack utils, since they are not part of the usual module's code and should only be run by devs
    "src/module/pack-utils/**/*.ts",
    // Exclude hot reload code, as it only runs in dev environment
    "src/module/hmr.ts",
    // Exclude dev utils, as they only run in dev environment
    "src/module/dev",
    // Exclude entry point file containing only imports and Hooks
    "src/module/pf1spheres.ts",
  ],
};

export default config;
