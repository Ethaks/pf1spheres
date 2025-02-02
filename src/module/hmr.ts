/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { getGame, MODULE_ID } from "./util";

// IMPORTANT: Types have to be added and maintained manually, as importing them will trigger typecheck errors
// due to this repo's tsconfig being applied to node_modules.
interface HandlebarsReloadData {
  file: string;
  content: string;
}
interface LanguageReloadData {
  language: string;
  content: Record<string, unknown>;
}

/*
 * Apply a given translation to Foundry's i18n cache (or fallback)
 *
 * @param {Record<string, unknown>} content - The content that will be merged into the i18n cache
 * @param {boolean} fallback - Whether to merge content into the main translations cache or the fallback cache
 */
const applyTranslation = (content: Record<string, unknown>, fallback = false) => {
  const game = getGame();
  // @ts-expect-error Fallback access necessary for handling of multiple/incomplete translations
  const target = fallback ? game.i18n._fallback : game.i18n.translations;
  target.PF1SPHERES = {};
  foundry.utils.mergeObject(target, content);
  const displayLanguage = fallback
    ? "localization fallback"
    : `localization file modules/pf1spheres/lang/${game.i18n.lang}.json`;
  console.log(`PF1SPHERES | Applied ${displayLanguage}`);
};

if (import.meta.hot) {
  // Handlebars
  import.meta.hot.on("hotHandle:update", ({ file, content }: HandlebarsReloadData) => {
    const compiled = Handlebars.compile(content);
    Handlebars.registerPartial(file, compiled);
    Handlebars.partials[file] = compiled;
    console.log(`${MODULE_ID} | Compiled template ${file}`);

    // Rerender opened applications to make use of updated templates
    for (const appId in ui.windows) {
      ui.windows[Number(appId)].render(true);
    }
  });

  // Language files
  import.meta.hot.on("hotLangs:update", ({ language, content }: LanguageReloadData) => {
    const lang = getGame().i18n.lang;

    // Apply translation if it exists
    if (lang === language) applyTranslation(content);

    // Apply English as fallback if it exists
    if (lang !== "en" && language === "en") applyTranslation(content, true);

    // Rerender opened applications to make use of updated translations
    for (const appId in ui.windows) {
      ui.windows[Number(appId)].render(true);
    }
  });
}
