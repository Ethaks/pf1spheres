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
import { onAddDefaultChanges, onGetChangeFlat, registerChanges } from "./changes";
import type { LocalizationKey } from "./util";
import { getGame, localize } from "./util";
import type { PF1ModuleData } from "./common-data";
import { onActorSheetHeaderButtons, onActorSheetRender } from "./actor-sheet";
import { initializeModuleIntegrations } from "./integrations";

// Vite specific imports
import "../styles/pf1spheres.scss";
if (import.meta.env.DEV) {
  import("./dev");
}
if (import.meta.hot) {
  import("./hmr");
}

export * as actor from "./actor-methods";
export { PF1S as config } from "./config";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Hooks {
    interface StaticCallbacks {
      /**
       * A hook event that fires at the beginning of `pf1spheres`'s {@link Hooks.StaticCallbacks.setup "setup"} hook.
       * Modules wishing to add spheres should do so here, as the modules registers its Changes with the
       * system afterwards.
       *
       * @group Initialization
       * @param config - The {@link PF1S config} object also available globally via `CONFIG.PF1SPHERES`
       * @deprecated
       * @remarks This is called by {@link Hooks.callAll}
       */
      "pf1spheres.preSetup": (config: typeof PF1S) => void;
      /**
       * A hook event that fires at the beginning of `pf1spheres`'s {@link Hooks.StaticCallbacks.setup "setup"} hook.
       * Modules wishing to add spheres should do so here, as the modules registers its Changes with the
       * system afterwards.
       *
       * @group Initialization
       * @param config - The {@link PF1S config} object also available globally via `CONFIG.PF1SPHERES`
       * @remarks This is called by {@link Hooks.callAll}
       */
      pf1spheresPreSetup: (config: typeof PF1S) => void;
    }
  }
}

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
  CONFIG.PF1SPHERES = PF1S;
});

// Setup module
Hooks.once("i18nInit", () => {
  // Localise config
  const toLocalize = ["progression", "magicSpheres", "combatSpheres"] as const;
  const toLocalizePF = [
    "featTypes",
    "featTypesPlurals",
    "buffTargetCategories",
    "buffTargets",
    "contextNoteCategories",
    "contextNoteTargets",
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
        newValue = { ...value, label: localize(value.label as LocalizationKey) };
      else if (typeof value === "string") newValue = localize(value as LocalizationKey);
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

  // Add to PF1 config
  mergeObject(CONFIG.PF1, PF1CONFIG_EXTRA);
});

Hooks.once("setup", () => {
  // Call hook to allow modules to add spheres
  // @ts-expect-error v9 types do not include v10 Hooks property
  if (Hooks.events["pf1spheres.preSetup"]?.length) {
    foundry.utils.logCompatibilityWarning(
      "The 'pf1spheres.preSetup' hook has been deprecated. Please use 'pf1spheresPreSetup' instead.",
      {
        from: "PF1Spheres 0.5",
        until: "PF1Spheres 0.7",
      }
    );
    Hooks.callAll("pf1spheres.preSetup", PF1S);
  }
  Hooks.callAll("pf1spheresPreSetup", PF1S);

  // Register changes
  registerChanges();

  // Enable API
  const moduleData: PF1ModuleData | undefined = getGame().modules?.get("pf1spheres");
  if (moduleData) {
    moduleData.api = {
      config: PF1S,
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
