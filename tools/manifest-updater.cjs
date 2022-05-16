/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

module.exports.readVersion = function (contents) {
  return JSON.parse(contents).version;
};

module.exports.writeVersion = function (contents, version) {
  const json = JSON.parse(contents);
  json.version = version;
  json.download = `https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/-/releases/v${version}/downloads/pf1spheres.zip`;
  const manifestString = require("prettier").format(JSON.stringify(json), { parser: "json" });
  return manifestString;
};
