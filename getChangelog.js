// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

const fs = require("fs-extra");

try {
  const changelog = fs.readFileSync("./CHANGELOG.md", "utf-8");
  const recentChanges =
    changelog.toString().match(/^# Changelog\n*(## (.|\n)*?)^\n^## \d*/m)?.[1] ?? "";

  const manifest = fs.readJSONSync("src/module.json");
  let url = manifest.manifest.replaceAll("latest", manifest.version);

  const releaseNotes = `**Manifest URL: ${url}**\n\n${recentChanges}`;
  fs.writeFileSync("recent-changes.md", releaseNotes);
} catch (e) {
  console.error(e);
}
