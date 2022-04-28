/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { MODULE_ID } from "./util";

/** Array of template paths without their module directory or file type */
export const templates = [
  "class-progression",
  "talent-details",
  "apps/actor-settings",
  "actor-spheres-tab",
];

/** Returns the full (relative) path for a shortened template path from {@link templates} */
const getTemplatePath = (template: string): string =>
  `modules/${MODULE_ID}/templates/${template}.hbs`;

/**
 * Preloads the module's templates, making them available as partial and speeding
 * up future renderings.
 *
 * @returns The promise created by the loadTemplates call
 */
export const preloadTemplates = async (): Promise<Handlebars.TemplateDelegate[]> =>
  loadTemplates(templates.map(getTemplatePath));
