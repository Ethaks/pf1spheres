/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { Ability, ActorDataPath, ActorPF } from "./actor-data";
import type {
  BonusType,
  CombatSphere,
  ItemChange,
  ItemChangeCreateData,
  MagicSphere,
  SourceEntry,
  SphereBABChangeTarget,
  SphereChangeTarget,
  SphereCLChangeTarget,
} from "./item-data";
import { PF1CONFIG_EXTRA } from "./config-extra";
import { localize } from "./util";
import { getActorHelpers } from "./actor-util";
import { nonNullable } from "./ts-util";

/**
 * Registers all change targets not already part of the static buffTarget additions
 * from PF1CONFIG_EXTRA and applies additional changes to the PF1 system config.
 */
export const registerChanges = (): void => {
  const baseSort = PF1CONFIG_EXTRA.buffTargets["~spherecl"].sort;
  // Register sphere specific CL change targets
  Object.entries(pf1s.config.magicSpheres).forEach(([sphere, value], index) => {
    const key = `spherecl${(sphere as MagicSphere).capitalize()}`;
    CONFIG.PF1.buffTargets[key] = {
      label: value.label,
      category: "sphereCasterLevel",
      sort: baseSort + 100 + index * 5,
    };
  });

  // Register sphere specific BAB change targets
  Object.entries(pf1s.config.combatSpheres).forEach(([sphere, value], index) => {
    CONFIG.PF1.buffTargets[`spherebab${(sphere as CombatSphere).capitalize()}`] = {
      label: value.label,
      category: "sphereBAB",
      sort: baseSort + 300 + index * 5,
    };
  });

  // Allow stacking of multiple sphere caster level modifiers capped at HD
  CONFIG.PF1.stackingBonusTypes?.push("sphereCLCap");
};

/**
 * Localises change targets for caster levels and BABs, adding the respective
 * label suffixes to the base sphere's name.
 */
export const localizeChanges = (): void => {
  for (const buffTarget of Object.values(pf1.config.buffTargets)) {
    switch (buffTarget.category) {
      case "sphereCasterLevel": {
        buffTarget.label = `${buffTarget.label} ${localize("CasterLevel")}`;
        break;
      }
      case "sphereBAB": {
        buffTarget.label = `${buffTarget.label} ${localize("PF1.BAB")}`;
        break;
      }
      default:
        break;
    }
  }
};

/**
 * Determines the data targets of a given change
 *
 * @param target - A change target
 * @param type - The bonus type of the change value
 * @param result - Data determining the data path to adjust
 */
export const onGetChangeFlat = (
  result: ActorDataPath[],
  target: SphereChangeTarget,
  type: BonusType,
): number => {
  // Cache change targets on first call
  if (changeFlatTargets === undefined) changeFlatTargets = getChangeFlatTargets();

  return result.push(
    ...(changeFlatTargets[target]?.[type] ?? changeFlatTargets[target]?.default ?? []),
  );
};

/** A cache containing all SphereChangeTargets and their respective data targets */
let changeFlatTargets: Record<SphereChangeTarget, ChangeFlatTargetData> | undefined;

/** A function generating a dictionary containing all SphereChangeTargets and their respective data targets */
export const getChangeFlatTargets = (): Record<SphereChangeTarget, ChangeFlatTargetData> => ({
  // General Sphere CL (general buffs apply to everything, HD capped only to modCap)
  spherecl: {
    default: [
      "system.spheres.cl.total",
      ...Object.keys(pf1s.config.magicSpheres).map(
        (sphere): ActorDataPath => `system.spheres.cl.${sphere}.total`,
      ),
    ],
    sphereCLCap: ["system.spheres.cl.modCap"],
  },
  // Hidden target, only applied to general total (used for base + modCap calculation)
  "~spherecl": {
    default: ["system.spheres.cl.total"],
  },
  // Hidden target, used to make CAM/PAM/OAM available via short
  "~castingAbility": {
    default: ["system.spheres.cam"],
  },
  "~practitionerAbility": {
    default: ["system.spheres.pam"],
  },
  "~operativeAbility": {
    default: ["system.spheres.oam"],
  },
  // MSB
  msb: {
    default: ["system.spheres.msb.total"],
    untypedPerm: ["system.spheres.msb.base"],
  },
  // Actor-wide concentration
  sphereConcentration: {
    default: ["system.spheres.concentration.total"],
  },
  // MSD
  msd: {
    default: ["system.spheres.msd.total"],
    untypedPerm: ["system.spheres.msd.base"],
  },
  // Sphere specific CL
  ...Object.fromEntries(
    Object.keys(pf1s.config.magicSpheres).map(
      (sphere): [SphereCLChangeTarget, ChangeFlatTargetData] => [
        `spherecl${sphere.capitalize()}`,
        {
          default: [`system.spheres.cl.${sphere}.total`],
          sphereCLCap: [`system.spheres.cl.${sphere}.modCap`],
        },
      ],
    ),
  ),
  // BAB to sphere BABs
  "~spherebabBase": {
    default: Object.keys(pf1s.config.combatSpheres).map(
      (sphere): ActorDataPath => `system.spheres.bab.${sphere}.total`,
    ),
  },
  // Sphere specific BAB
  ...Object.fromEntries(
    Object.keys(pf1s.config.combatSpheres).map(
      (sphere): [SphereBABChangeTarget, ChangeFlatTargetData] => [
        `spherebab${sphere.capitalize()}`,
        { default: [`system.spheres.bab.${sphere}.total`] },
      ],
    ),
  ),
});

/**
 * Adds general/default changes to an actor's Changes array.
 * These Changes are either applicable for all actors (like handling MSB/MSD),
 * or they are triggered by an actor's general data (like conditions).
 *
 * @param actor - The actor to whose Changes data is added
 * @param changes - The array of Changes that will be applied to this actor
 */
export const onAddDefaultChanges = (actor: ActorPF, changes: ItemChange[]): DefaultChangeData[] => {
  const { ItemChange, pushNSourceInfo, pushPSourceInfo } = getChangeHelpers(actor);

  // Generate array with all change data and source info
  const defaultChangeData = getDefaultChanges();

  // Add Casting Ability Modifier to Concentration and `@spheres.cam` shortcut
  const abilityChanges = (
    ["castingAbility", "practitionerAbility", "operativeAbility"] as const
  ).map((abilityType) => {
    const ability = actor.flags.pf1spheres?.[abilityType];
    return getAbilityChange(ability, abilityType, abilityType === "castingAbility");
  });

  const msbToConcentrationChangeData = getMsbToConcentrationChange();

  const changeData: DefaultChangeData[] = [
    defaultChangeData,
    msbToConcentrationChangeData,
    ...abilityChanges,
  ].filter(nonNullable);

  // Actually add Changes to the system's process
  changes.push(
    ...changeData.flatMap(
      (data) => data.changes?.map((changeData) => new ItemChange(changeData)) ?? [],
    ),
  );
  // Push source info into actor
  changeData.forEach((cd) => {
    cd.pSourceInfo?.forEach(([path, sourceEntry]) => pushPSourceInfo(path, sourceEntry));
    cd.nSourceInfo?.forEach(([path, sourceEntry]) => pushNSourceInfo(path, sourceEntry));
  });

  // Return changeData to enable easier testing
  return changeData;
};

/** Returns DefaultChangeData applicable to every single actor, regardless of actor data */
const getDefaultChanges = (): DefaultChangeData => ({
  changes: [
    // Push ModCap to Total change
    {
      formula: "min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap)",
      target: "~spherecl",
      modifier: "untyped",
    },
    // For every magic sphere, determine CL from base + general HD capped + sphere specific HD capped
    ...Object.keys(pf1s.config.magicSpheres).map(
      (sphere): ItemChangeCreateData => ({
        formula: `min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.${sphere}.modCap)`,
        target: `spherecl${sphere.capitalize()}`,
        modifier: "untyped",
      }),
    ),
    // Add a change to add total BAB to sphere BABs
    {
      formula: "@attributes.bab.total",
      target: "~spherebabBase",
      modifier: "base",
    },
    // Add MSB Base to Total
    { formula: "@spheres.msb.base", target: "msb", modifier: "base" },
    // Add MSD Base to Total
    { formula: "@spheres.msd.base", target: "msd", modifier: "base" },
  ],
});

const getMsbToConcentrationChange = (): DefaultChangeData => ({
  changes: [
    {
      formula: `@spheres.msb.total`,
      target: "sphereConcentration",
      modifier: "untyped",
      flavor: localize("MagicSkillBonus"),
    },
  ],
});

const getAbilityChange = (
  ability: Ability | "" | undefined,
  target: "castingAbility" | "practitionerAbility" | "operativeAbility",
  includeConcentration = false,
): DefaultChangeData | undefined => {
  if (ability === undefined || ability === "") return undefined;
  const changes: ItemChangeCreateData[] = [
    {
      formula: `@abilities.${ability}.mod`,
      target: `~${target}` as const,
      modifier: "untyped",
      flavor: `${localize(target.capitalize())} (${CONFIG.PF1.abilities[ability]})`,
    },
  ];
  if (includeConcentration) {
    changes.push({
      formula: `@abilities.${ability}.mod`,
      target: "sphereConcentration",
      modifier: "untyped",
      flavor: `${localize(target.capitalize())} (${CONFIG.PF1.abilities[ability]})`,
    });
  }

  return { changes };
};

/** Returns a collection of helper functions and classes for actor and ItemChange handling */
const getChangeHelpers = (actor: ActorPF) => ({
  ...getActorHelpers(actor),
  ItemChange: pf1.components.ItemChange,
});

/** A data set used to create Changes added by default as well as corresponding source info */
interface DefaultChangeData {
  changes?: ItemChangeCreateData[];
  nSourceInfo?: [ActorDataPath, SourceEntry][];
  pSourceInfo?: [ActorDataPath, SourceEntry][];
}

type ChangeFlatTargetData = { default: ActorDataPath[] } & {
  [Key in BonusType]?: ActorDataPath[];
};
