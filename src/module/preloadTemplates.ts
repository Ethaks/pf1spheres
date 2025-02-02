/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { enforce, MODULE_ID } from "./util";

/** Array of template paths without their module directory or file type */
export const templates = [
  "class-progression",
  "talent-details",
  "talent-excluded",
  "apps/actor-settings",
  "actor-spheres-tab",
] as const;

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

/**
 * Synchronously renders an already preloaded template, throwing an error if the template is not found.
 *
 * @see {@link preloadTemplates}
 * @param template - The name of the template to be rendered
 * @param data - A data object to be passed to the template rendering
 */
export function renderPf1sTemplate(template: (typeof templates)[number], data?: object) {
  const templatePath = getTemplatePath(template);
  const hbsTemplate = Handlebars.partials[templatePath];
  enforce(template, `${MODULE_ID}: No template found for ${template} (${templatePath})`);

  return hbsTemplate(data || {}, {
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true,
  });
}
