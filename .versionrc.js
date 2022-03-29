// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

const prettier = require("prettier");

const manifest = {
  filename: "./src/module.json",
  updater: {
    readVersion: function (contents) {
      return JSON.parse(contents).version;
    },
    writeVersion: function (contents, version) {
      const json = JSON.parse(contents);
      json.version = version;
      json.download = `https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/releases/v${version}/pf1spheres.zip`;
      const manifestString = prettier.format(JSON.stringify(json), { parser: "json" });
      return manifestString;
    },
  },
};

const packageJson = {
  filename: "./package.json",
  type: "json",
};

module.exports = {
  packageFiles: [manifest],
  bumpFiles: [packageJson, manifest],
};
