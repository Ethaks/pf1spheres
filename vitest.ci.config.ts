/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import defaultConfig from "./vitest.config";

const config = defaultConfig;
config.test.reporters = ["default", "junit"];
config.test.outputFile = { junit: "junit.xml" };
config.test.coverage = {
  reporter: ["cobertura", "lcov", "text"],
  all: true,
  include: ["src/module"],

  // Exclude data.ts files, since they should only contain declarations or immediately adjacent minimal code
  // Exclude pack utils, since they are not part of the usual module's code and should only be run by devs
  // Exclude hot reload code, as it only runs in dev environment
  exclude: ["**/*-data.ts", "src/module/pack-utils/**/*.ts", "src/module/hmr.ts"],
};

export default config;
