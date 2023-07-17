/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { Ability } from "./actor-data";
import type { BonusModifier, ItemType } from "./item-data";
import type { _AssertExtends } from "./ts-util";

/**
 * Runtime config object for the PF1 Spheres module
 */
export const PF1S = {
  /**
   * The different rates at which a class advances caster or practicioner levels.
   */
  progression: {
    low: "PF1SPHERES.LowCaster",
    mid: "PF1SPHERES.MidCaster",
    high: "PF1SPHERES.HighCaster",
  },

  /**
   * Formulae for {@link PF1S.progression}
   */
  progressionFormula: {
    low: 0.5,
    mid: 0.75,
    high: 1,
  },

  changeCategories: {
    sphereValues: "PF1SPHERES.SphereValues",
  },

  /** A dictionary of all magic Spheres from Spheres of Power */
  magicSpheres: {
    alteration: "PF1SPHERES.Spheres.Alteration",
    bear: "PF1SPHERES.Spheres.Bear",
    blood: "PF1SPHERES.Spheres.Blood",
    conjuration: "PF1SPHERES.Spheres.Conjuration",
    creation: "PF1SPHERES.Spheres.Creation",
    dark: "PF1SPHERES.Spheres.Dark",
    death: "PF1SPHERES.Spheres.Death",
    destruction: "PF1SPHERES.Spheres.Destruction",
    divination: "PF1SPHERES.Spheres.Divination",
    enhancement: "PF1SPHERES.Spheres.Enhancement",
    fallenFey: "PF1SPHERES.Spheres.FallenFey",
    fate: "PF1SPHERES.Spheres.Fate",
    illusion: "PF1SPHERES.Spheres.Illusion",
    life: "PF1SPHERES.Spheres.Life",
    light: "PF1SPHERES.Spheres.Light",
    mana: "PF1SPHERES.Spheres.Mana",
    mind: "PF1SPHERES.Spheres.Mind",
    nature: "PF1SPHERES.Spheres.Nature",
    protection: "PF1SPHERES.Spheres.Protection",
    telekinesis: "PF1SPHERES.Spheres.Telekinesis",
    time: "PF1SPHERES.Spheres.Time",
    war: "PF1SPHERES.Spheres.War",
    warp: "PF1SPHERES.Spheres.Warp",
    weather: "PF1SPHERES.Spheres.Weather",
  },

  /** A dictionary of all martial Spheres from Spheres of Might */
  combatSpheres: {
    alchemy: "PF1SPHERES.Spheres.Alchemy",
    athletics: "PF1SPHERES.Spheres.Athletics",
    barrage: "PF1SPHERES.Spheres.Barrage",
    barroom: "PF1SPHERES.Spheres.Barroom",
    beastmastery: "PF1SPHERES.Spheres.Beastmastery",
    berserker: "PF1SPHERES.Spheres.Berserker",
    boxing: "PF1SPHERES.Spheres.Boxing",
    brute: "PF1SPHERES.Spheres.Brute",
    dualWielding: "PF1SPHERES.Spheres.DualWielding",
    duelist: "PF1SPHERES.Spheres.Duelist",
    equipment: "PF1SPHERES.Spheres.Equipment",
    fencing: "PF1SPHERES.Spheres.Fencing",
    gladiator: "PF1SPHERES.Spheres.Gladiator",
    guardian: "PF1SPHERES.Spheres.Guardian",
    lancer: "PF1SPHERES.Spheres.Lancer",
    leadership: "PF1SPHERES.Spheres.Leadership",
    openHand: "PF1SPHERES.Spheres.OpenHand",
    scoundrel: "PF1SPHERES.Spheres.Scoundrel",
    scout: "PF1SPHERES.Spheres.Scout",
    shield: "PF1SPHERES.Spheres.Shield",
    sniper: "PF1SPHERES.Spheres.Sniper",
    tech: "PF1SPHERES.Spheres.Tech",
    trap: "PF1SPHERES.Spheres.Trap",
    warleader: "PF1SPHERES.Spheres.Warleader",
    wrestling: "PF1SPHERES.Spheres.Wrestling",
  },

  /** A dictionary of spheres and their respective icon */
  sphereIcons: {
    alteration: "modules/pf1spheres/assets/icons/spheres/alteration.webp",
    blood: "modules/pf1spheres/assets/icons/spheres/blood.webp",
    conjuration: "modules/pf1spheres/assets/icons/spheres/conjuration.webp",
    creation: "modules/pf1spheres/assets/icons/spheres/creation.webp",
    dark: "modules/pf1spheres/assets/icons/spheres/dark.webp",
    death: "modules/pf1spheres/assets/icons/spheres/death.webp",
    destruction: "modules/pf1spheres/assets/icons/spheres/destruction.webp",
    divination: "modules/pf1spheres/assets/icons/spheres/divination.webp",
    enhancement: "modules/pf1spheres/assets/icons/spheres/enhancement.webp",
    fallenFey: "modules/pf1spheres/assets/icons/spheres/fallen_fey.webp",
    fate: "modules/pf1spheres/assets/icons/spheres/fate.webp",
    illusion: "modules/pf1spheres/assets/icons/spheres/illusion.webp",
    life: "modules/pf1spheres/assets/icons/spheres/life.webp",
    light: "modules/pf1spheres/assets/icons/spheres/light.webp",
    mind: "modules/pf1spheres/assets/icons/spheres/mind.webp",
    nature: "modules/pf1spheres/assets/icons/spheres/nature.webp",
    protection: "modules/pf1spheres/assets/icons/spheres/protection.webp",
    telekinesis: "modules/pf1spheres/assets/icons/spheres/telekinesis.webp",
    time: "modules/pf1spheres/assets/icons/spheres/time.webp",
    war: "modules/pf1spheres/assets/icons/spheres/war.webp",
    warp: "modules/pf1spheres/assets/icons/spheres/warp.webp",
    weather: "modules/pf1spheres/assets/icons/spheres/weather.webp",
    alchemy: "modules/pf1spheres/assets/icons/spheres/alchemy.webp",
    athletics: "modules/pf1spheres/assets/icons/spheres/athletics.webp",
    barrage: "modules/pf1spheres/assets/icons/spheres/barrage.webp",
    barroom: "modules/pf1spheres/assets/icons/spheres/barroom.webp",
    beastmastery: "modules/pf1spheres/assets/icons/spheres/beastmastery.webp",
    berserker: "modules/pf1spheres/assets/icons/spheres/berserker.webp",
    boxing: "modules/pf1spheres/assets/icons/spheres/boxing.webp",
    brute: "modules/pf1spheres/assets/icons/spheres/brute.webp",
    dualWielding: "modules/pf1spheres/assets/icons/spheres/dual_wielding.webp",
    duelist: "modules/pf1spheres/assets/icons/spheres/duelist.webp",
    equipment: "modules/pf1spheres/assets/icons/spheres/equipment.webp",
    fencing: "modules/pf1spheres/assets/icons/spheres/fencing.webp",
    gladiator: "modules/pf1spheres/assets/icons/spheres/gladiator.webp",
    guardian: "modules/pf1spheres/assets/icons/spheres/guardian.webp",
    lancer: "modules/pf1spheres/assets/icons/spheres/lancer.webp",
    leadership: "modules/pf1spheres/assets/icons/spheres/leadership.webp",
    openHand: "modules/pf1spheres/assets/icons/spheres/open_hand.webp",
    scoundrel: "modules/pf1spheres/assets/icons/spheres/scoundrel.webp",
    scout: "modules/pf1spheres/assets/icons/spheres/scout.webp",
    shield: "modules/pf1spheres/assets/icons/spheres/shield.webp",
    sniper: "modules/pf1spheres/assets/icons/spheres/sniper.webp",
    tech: "modules/pf1spheres/assets/icons/spheres/tech.webp",
    trap: "modules/pf1spheres/assets/icons/spheres/trap.webp",
    warleader: "modules/pf1spheres/assets/icons/spheres/warleader.webp",
    wrestling: "modules/pf1spheres/assets/icons/spheres/wrestling.webp",
  },
} as const;

/**
 * Config values to be merged into the PF1 system config
 */
export const PF1CONFIG_EXTRA = {
  featTypes: {
    combatTalent: "PF1SPHERES.CombatTalent",
    magicTalent: "PF1SPHERES.MagicTalent",
  },
  featTypesPlurals: {
    combatTalent: "PF1SPHERES.CombatTalentPlural",
    magicTalent: "PF1SPHERES.MagicTalentPlural",
  },
  buffTargetCategories: {
    sphereValues: {
      label: "PF1SPHERES.SphereValues",
    },
    sphereCasterLevel: {
      label: "PF1SPHERES.SphereCasterLevelPlural",
    },
    sphereBAB: {
      label: "PF1SPHERES.BAB",
    },
  },
  buffTargets: {
    spherecl: {
      label: "PF1SPHERES.CasterLevel",
      category: "sphereValues",
      sort: 45100,
    },
    "~spherecl": {
      label: "PF1SPHERES.CasterLevel",
      category: "sphereValues",
      sort: 45200,
    },
    "~castingAbility": {
      label: "PF1SPHERES.CastingAbility",
      category: "sphereValues",
      sort: 35001,
    },
    msb: {
      label: "PF1SPHERES.MSB",
      category: "sphereValues",
      sort: 45700,
    },
    sphereConcentration: {
      label: "PF1.Concentration",
      category: "sphereValues",
      sort: 45750,
    },
    msd: {
      label: "PF1SPHERES.MSD",
      category: "sphereValues",
      sort: 45751,
    },
    "~spherebabBase": {
      label: "PF1.BAB",
      category: "sphereValues",
      sort: 45800,
    },
  },
  contextNoteCategories: {
    spheresMisc: { label: "PF1SPHERES.SpherePlural" },
  },
  contextNoteTargets: {
    msb: { label: "PF1SPHERES.Checks.MSB", category: "spheresMisc" },
    concentration: { label: "PF1.Concentration", category: "spheresMisc" },
  },
  bonusModifiers: {
    sphereCLCap: "PF1SPHERES.SphereCLCapped",
  },
  conditionTypes: {
    battered: "PF1SPHERES.Battered",
  },
  conditions: {
    battered: "PF1SPHERES.Battered",
  },
  conditionTextures: {
    battered: "modules/pf1spheres/assets/icons/battered.png",
  },
} as const;

/** The widened shape of the PF1 system config */
export interface PF1CONFIG {
  featTypes: Record<string, string>;
  featTypesPlurals: Record<string, string>;
  buffTargetCategories: Record<string, { label: string }>;
  buffTargets: Record<
    string,
    { label: string; category: keyof typeof CONFIG.PF1.buffTargetCategories; sort: number }
  >;
  contextNoteCategories: Record<string, { label: string }>;
  contextNoteTargets: Record<
    string,
    { label: string; category: keyof typeof CONFIG.PF1.contextNoteCategories }
  >;
  bonusModifiers: Record<string, string>;
  conditionTypes: Record<string, string>;
  conditions: Record<string, string>;
  conditionTextures: Record<string, string>;
  stackingBonusModifiers?: BonusModifier[];
  armorProficiencies: Record<"lgt" | "med" | "hvy" | "shl" | "twr", string>;
  weaponProficiencies: Record<"sim" | "mar", string>;
  skills: Record<string, string>;
  abilities: Record<Ability, string>;
  defaultIcons: Record<"actor" | "items", Record<ItemType, string>>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */ // Presence alone is sufficient to allow type checking
type _TestPF1CONFIG_EXTRA = _AssertExtends<
  typeof PF1CONFIG_EXTRA,
  { [key in keyof PF1CONFIG]?: PF1CONFIG[key] }
>;
/* eslint-enable @typescript-eslint/no-unused-vars */
