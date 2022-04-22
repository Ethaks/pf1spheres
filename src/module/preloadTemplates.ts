/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

/**
 * Preloads the module's templates, making them available as partial and speeding
 * up future renderings.
 *
 * @returns The promise created by the loadTemplates call
 */
export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
  const templatePaths: string[] = [
    "modules/pf1spheres/templates/class-progression.hbs",
    "modules/pf1spheres/templates/talent-details.hbs",
    "modules/pf1spheres/templates/actor-spheres-settings.hbs",
  ];

  return loadTemplates(templatePaths);
}
