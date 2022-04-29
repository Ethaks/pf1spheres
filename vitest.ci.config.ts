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
  exclude: ["**/*-data.ts"],
  include: ["src/module"],
  all: true,
};

export default config;
