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
  json.download = `https://github.com/Ethaks/pf1spheres/releases/download/v${version}/module.zip`;
  const manifestString = JSON.stringify(json);
  return manifestString;
};
