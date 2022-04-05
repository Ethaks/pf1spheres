/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

// Import TypeScript modules
import { registerSettings } from "./settings";
import { preloadTemplates } from "./preloadTemplates";
import { PF1S, PF1CONFIG_EXTRA } from "./config";
import { onItemSheetRender } from "./item-sheet";
import { onActorBasePreparation } from "./actor";
import {
  onAddDefaultChanges,
  changeFlatTargets,
  onGetChangeFlat,
  registerChanges,
} from "./changes";
import { getGame, localize } from "./util";
import type { PF1SpheresApi } from "./common-data";
import { onActorSheetRender } from "./actor-sheet";
import * as packUtils from "./pack-util";

// Initialize module
Hooks.once("init", () => {
  console.log("pf1spheres | Initializing pf1spheres");
  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  preloadTemplates();

  // Add Battered to Status Effects
  CONFIG.statusEffects.push({
    id: "battered",
    label: "PF1SPHERES.Battered",
    icon: "modules/pf1spheres/assets/icons/battered.png",
  });
});

// Setup module
Hooks.once("setup", async () => {
  // Localise config
  const toLocalize = ["progression", "magicSpheres", "combatSpheres"] as const;
  const toLocalizePF = [
    "featTypes",
    "featTypesPlurals",
    "buffTargetCategories",
    "buffTargets",
    "conditionTypes",
    "conditions",
  ] as const;
  const toSort = ["magicSpheres", "combatSpheres"] as const;

  const localizeObject = (
    obj: Record<string, string | { label: string }>,
    sort = false
  ): Record<string, string | { label: string }> => {
    const localized = Object.entries(obj).map(([key, value]) => {
      let newValue;
      if (typeof value === "object" && value.label != null)
        newValue = { ...value, label: localize(value.label) };
      else if (typeof value === "string") newValue = localize(value);
      return [key, newValue];
    });
    if (sort)
      localized.sort((a, b) => {
        const labelA =
          typeof a[1] === "object" && a[1].label != null ? a[1].label : (a[1] as string);
        const labelB =
          typeof b[1] === "object" && b[1].label != null ? b[1].label : (b[1] as string);
        return labelA.localeCompare(labelB);
      });
    return Object.fromEntries(localized);
  };

  // Replace every localisable object with a localised version
  for (const o of toLocalize) {
    // @ts-expect-error Ignore as const definition of config, strings get replaced in-place
    PF1S[o] = localizeObject(PF1S[o], toSort.includes(o));
  }

  for (const o of toLocalizePF) {
    // @ts-expect-error Ignore as const definition of config, strings get replaced in-place
    PF1CONFIG_EXTRA[o] = localizeObject(PF1CONFIG_EXTRA[o]);
  }

  // Enable API
  const moduleData = getGame().modules?.get("pf1spheres");
  if (moduleData) {
    (moduleData.api as PF1SpheresApi) = {
      config: PF1S,
      changeFlatTargets: changeFlatTargets,
      _internal: {
        packUtils: packUtils,
      },
    };
  }
  CONFIG.PF1SPHERES = PF1S;

  // Add to PF1 config
  mergeObject(CONFIG.PF1, PF1CONFIG_EXTRA);

  // Register changes
  registerChanges();
});

Hooks.on("renderItemSheetPF", onItemSheetRender);

Hooks.on("renderActorSheetPF", onActorSheetRender);

Hooks.on("pf1.prepareBaseActorData", onActorBasePreparation);

Hooks.on("pf1.getChangeFlat", onGetChangeFlat);

Hooks.on("pf1.addDefaultChanges", onAddDefaultChanges);
