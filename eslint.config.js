// SPDX-FileCopyrightText: 2024 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

// @ts-check

import eslint from "@eslint/js";
import teslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default teslint.config(
  { ignores: ["dist/", "docs/", "src/pf1spheres.js"] },
  eslint.configs.recommended,
  ...teslint.configs.strict,
  ...teslint.configs.stylistic,
  prettierConfig,
  {
    rules: {
      // Extending classes might not need anything but changes to static members
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { sourceType: "commonjs" },
    extends: [teslint.configs.disableTypeChecked],
  },
  { files: ["tools/*.js"], languageOptions: { globals: { ...globals.node } } },
);
