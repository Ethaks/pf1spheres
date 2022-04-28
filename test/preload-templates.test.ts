/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { templates } from "../src/module/preloadTemplates";
import fs from "fs-extra";

const getTemplatePath = (template: string) => `public/templates/${template}.hbs`;

test.each(templates.map(getTemplatePath))("Template %s exists", async (template) => {
  const fileStats = await fs.stat(template);
  expect(fileStats.isFile()).to.be.true;
});
