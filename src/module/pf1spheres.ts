/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
/**
 * The main entry point for the PF1 Spheres module.
 * The exports of this module are available globally under the `pf1s` namespace, e.g. `pf1s.config`.
 *
 * @module pf1s
 */

// Import TypeScript modules
import { registerSettings } from "./settings";
import { preloadTemplates } from "./preloadTemplates";
import { onItemSheetRender } from "./item-sheet";
import { onActorBasePreparation } from "./actor";
import { localizeChanges, onAddDefaultChanges, onGetChangeFlat, registerChanges } from "./changes";
import { MODULE_ID, getGame } from "./util";
import type { PF1ModuleData } from "./common-data";
import { onActorSheetHeaderButtons, onActorSheetRender } from "./actor-sheet";
import { initializeModuleIntegrations } from "./integrations";
import { PF1CONFIG_EXTRA } from "./config-extra";

// Vite specific imports
import "../styles/pf1spheres.scss";
if (import.meta.env.DEV) {
  import("./dev");
}
if (import.meta.hot) {
  import("./hmr");
}

// API
import * as PF1S from "./config";

export { PF1S as config };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Hooks {
    interface StaticCallbacks {
      pf1RegisterConditions: (registry: Registry, model: unknown) => void;
      /**
       * A hook event that fires after the module's base config has been initialised.
       * This does _not_ include derived config values (i.e. sphere-specific CL/BAB change targets).
       * Modules wishing to add spheres should do so here,
       * as the modules registers its Changes with the system _afterwards_.
       *
       * @group Initialization
       * @param config - The {@link pf1s.config config} object also available globally via `CONFIG.PF1SPHERES`
       * @remarks This is called by {@link Hooks.callAll}
       */
      pf1spheresConfig: (config: typeof pf1s.config) => void;

      /**
       * A hook event that fires after the module's {@link Hooks.StaticCallbacks["init"] init} hook has been called.
       * At this point, all of the module's config is available.
       *
       * @group Initialization
       * @remarks This is called by {@link Hooks.callAll}
       */
      pf1spheresPostInit: () => void;
    }
  }

  // eslint-disable-next-line
  var pf1s: {
    config: typeof PF1S;
  };
}

globalThis.pf1s = {
  config: { ...PF1S },
};

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

  initializeModuleIntegrations();

  // Make own config available via shortcut
  CONFIG.PF1SPHERES = pf1s.config;

  // Merge additions to the system's config
  mergeObject(CONFIG.PF1, PF1CONFIG_EXTRA);

  // Call hooks once base config has been initialised
  Hooks.callAll("pf1spheresConfig", pf1s.config);

  // Register changes
  registerChanges();

  pf1.config.sheetSections.features.magicTalent = {
    label: "PF1SPHERES.MagicTalentPlural",
    interface: { create: true, actions: true, types: true },
    filters: [{ type: "feat", subTypes: ["magicTalent"] }],
    create: { type: "feat", system: { subType: "magicTalent" } },
    sort: 2_600,
  };
  pf1.config.sheetSections.features.combatTalent = {
    label: "PF1SPHERES.CombatTalentPlural",
    interface: { create: true, actions: true, types: true },
    filters: [{ type: "feat", subTypes: ["combatTalent"] }],
    create: { type: "feat", system: { subType: "combatTalent" } },
    sort: 2_400,
  };

  // Call hooks after derived config has been initialised
  Hooks.callAll("pf1spheresPostInit");
});

Hooks.on("pf1RegisterConditions", (registry, _model) => {
  registry.register(MODULE_ID, "battered", {
    name: "PF1SPHERES.Battered",
    texture: "modules/pf1spheres/assets/icons/battered.png",
    mechanics: {
      changes: [{ formula: -2, target: "cmd", type: "untyped" }],
    },
  });
});

// Setup module
Hooks.once("i18nInit", () => {
  // Localise config
  const toLocalize = ["progression", "magicSpheres", "combatSpheres", "skillSpheres"] as const;
  const toSort = ["magicSpheres", "combatSpheres", "skillSpheres"] as const;

  const game = getGame();
  const localizeObject = (
    obj: Record<string, string | { label: string }>,
    sort = false,
  ): Record<string, string | { label: string }> => {
    const localized = Object.entries(obj).map(([key, value]) => {
      let newValue;
      if (typeof value === "object" && value.label != null)
        newValue = { ...value, label: game.i18n.localize(value.label) };
      else if (typeof value === "string") newValue = game.i18n.localize(value);
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
    pf1s.config[o] = localizeObject(pf1s.config[o], toSort.includes(o));
  }

  // Apply special localisation to cl/bab buff targets
  localizeChanges();
});

Hooks.once("setup", () => {
  // Enable API
  const moduleData: PF1ModuleData | undefined = getGame().modules?.get("pf1spheres");
  if (moduleData) {
    moduleData.api = {
      config: pf1s.config,
      _internal: {
        packUtils: undefined,
        devUtils: undefined,
      },
    };
  }
});

Hooks.on("renderItemSheetPF", onItemSheetRender);

Hooks.on("renderActorSheetPF", onActorSheetRender);

Hooks.on("getActorSheetPFHeaderButtons", onActorSheetHeaderButtons);

Hooks.on("pf1PrepareBaseActorData", onActorBasePreparation);

Hooks.on("pf1GetChangeFlat", onGetChangeFlat);

Hooks.on("pf1AddDefaultChanges", onAddDefaultChanges);
