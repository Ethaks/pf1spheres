// Import TypeScript modules
import { registerSettings } from "./settings";
import { preloadTemplates } from "./preloadTemplates";
import { PF1S, PF1CONFIG } from "./config";
import { onItemSheetRender } from "./item-sheet";
import { onActorBasePreparation, onActorPreparation } from "./actor";
import { onGetChangeFlat, registerChanges } from "./changes";
import { localize } from "./util";

// Initialize module
Hooks.once("init", async () => {
  console.log("pf1spheres | Initializing pf1spheres");
  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();
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
    PF1CONFIG[o] = localizeObject(PF1CONFIG[o]);
  }

  // Enable API
  const module = game.modules?.get("pf1spheres") as PF1SModule;
  module.api = {
    config: PF1S,
  };
  CONFIG.PF1SPHERES = PF1S;

  // Add to PF1 config
  mergeObject(CONFIG.PF1, PF1CONFIG);

  // Register changes
  registerChanges();
});

Hooks.on("renderActorSheetPF", async (app, html, data) => {
  // Add talent tab
});

Hooks.on("renderItemSheetPF", onItemSheetRender);

Hooks.on("pf1.prepareBaseActorData", onActorBasePreparation);

Hooks.on("pf1.prepareDerivedActorData", onActorPreparation);

Hooks.on("pf1.getChangeFlat", onGetChangeFlat);
