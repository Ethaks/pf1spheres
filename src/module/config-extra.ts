/*
 * SPDX-FileCopyrightText: 2023 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { Ability } from "./actor-data";
import type { BonusModifier, ItemType } from "./item-data";
import type { _AssertExtends } from "./ts-util";

/**
 * Config values to be merged into the PF1 system config
 */
export const PF1CONFIG_EXTRA = {
  featTypes: {
    combatTalent: "PF1SPHERES.CombatTalent",
    magicTalent: "PF1SPHERES.MagicTalent",
    skillTalent: "PF1SPHERES.SkillTalent",
  },
  featTypesPlurals: {
    combatTalent: "PF1SPHERES.CombatTalentPlural",
    magicTalent: "PF1SPHERES.MagicTalentPlural",
    skillTalent: "PF1SPHERES.SkillTalentPlural",
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
