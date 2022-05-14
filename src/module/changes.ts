/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { Ability, ActorDataPath, ActorPF } from "./actor-data";
import type {
  BonusModifier,
  CombatSphere,
  ItemChange,
  ItemChangeCreateData,
  MagicSphere,
  SourceEntry,
  SphereBABChangeTarget,
  SphereChangeTarget,
  SphereCLChangeTarget,
} from "./item-data";
import { PF1S } from "./config";
import { getGame, localize } from "./util";
import { getActorHelpers } from "./actor-util";
import { nonNullable } from "./ts-util";

/**
 * Registers all change targets not already part of the static buffTarget additions
 * from PF1CONFIG_EXTRA and applies additional changes to the PF1 system config.
 */
export const registerChanges = (): void => {
  // Register sphere specific CL change targets
  Object.entries(PF1S.magicSpheres).forEach(([sphere, value], index) => {
    CONFIG.PF1.buffTargets[`spherecl${(sphere as MagicSphere).capitalize()}`] = {
      label: `${value} ${localize("CasterLevel")}`,
      category: "sphereCasterLevel",
      sort: 305000 + index * 10,
    };
  });

  // Register sphere specific BAB change targets
  Object.entries(PF1S.combatSpheres).forEach(([sphere, value], index) => {
    CONFIG.PF1.buffTargets[`spherebab${(sphere as CombatSphere).capitalize()}`] = {
      label: `${value} ${localize("PF1.BAB")}`,
      category: "sphereBAB",
      sort: 306000 + index * 10,
    };
  });

  // Allow stacking of multple sphere caster level modifiers capped at HD
  CONFIG.PF1.stackingBonusModifiers?.push("sphereCLCap");
};

/**
 * Determines the data targets of a given change
 *
 * @param target - A change target
 * @param modifier - The bonus type of the change value
 * @param result - Data determining the data path to adjust
 */
export const onGetChangeFlat = (
  target: SphereChangeTarget,
  modifier: BonusModifier,
  result: { keys: ActorDataPath[] }
): number =>
  result.keys.push(
    ...(changeFlatTargets[target]?.[modifier] ?? changeFlatTargets[target]?.default ?? [])
  );

// TODO: Determine whether this should be a config object, or purely derived
/** A dictionary containing all SphereChangeTargets and their respective data targets */
export const changeFlatTargets: Record<SphereChangeTarget, ChangeFlatTargetData> = {
  // General Sphere CL (general buffs apply to everything, HD capped only to modCap)
  spherecl: {
    default: [
      "data.spheres.cl.total",
      ...Object.keys(PF1S.magicSpheres).map(
        (sphere): ActorDataPath => `data.spheres.cl.${sphere}.total`
      ),
    ],
    sphereCLCap: ["data.spheres.cl.modCap"],
  },
  // Hidden target, only applied to general total (used for base + modCap calculation)
  "~spherecl": {
    default: ["data.spheres.cl.total"],
  },
  "~castingAbility": {
    default: ["data.spheres.cam"],
  },
  // MSB
  msb: {
    default: ["data.spheres.msb.total"],
    untypedPerm: ["data.spheres.msb.base"],
  },
  // Actor-wide concentration
  sphereConcentration: {
    default: ["data.spheres.concentration.total"],
  },
  // MSD
  msd: {
    default: ["data.spheres.msd.total"],
    untypedPerm: ["data.spheres.msd.base"],
  },
  // Sphere specific CL
  ...Object.fromEntries(
    Object.keys(PF1S.magicSpheres).map((sphere): [SphereCLChangeTarget, ChangeFlatTargetData] => [
      `spherecl${sphere.capitalize()}`,
      {
        default: [`data.spheres.cl.${sphere}.total`],
        sphereCLCap: [`data.spheres.cl.${sphere}.modCap`],
      },
    ])
  ),
  // BAB to sphere BABs
  "~spherebabBase": {
    default: Object.keys(PF1S.combatSpheres).map(
      (sphere): ActorDataPath => `data.spheres.bab.${sphere}.total`
    ),
  },
  // Sphere specific BAB
  ...Object.fromEntries(
    Object.keys(PF1S.combatSpheres).map((sphere): [SphereBABChangeTarget, ChangeFlatTargetData] => [
      `spherebab${sphere.capitalize()}`,
      { default: [`data.spheres.bab.${sphere}.total`] },
    ])
  ),
};

/**
 * Adds general/default changes to an actor's Changes array.
 * These Changes are either applicable for all actors (like handling MSB/MSD),
 * or they are triggered by an actor's general data (like conditions).
 *
 * @param actor - The actor to whose Changes data is added
 * @param changes - The array of Changes that will be applied to this actor
 */
export const onAddDefaultChanges = (actor: ActorPF, changes: ItemChange[]): DefaultChangeData[] => {
  const { ItemChange, pushNSourceInfo, pushPSourceInfo, getAbilityMod } = getChangeHelpers(actor);

  // Generate array with all change data and source info
  const defaultChangeData = getDefaultChanges();

  // Add battered condition change if applicable
  const battered = actor.data.data.attributes.conditions.battered ?? false;
  const batteredChangeData = getBatteredChangeData(battered);

  // Add Concentration bonus from Casting Ability
  const castingAbility = actor.data.flags.pf1spheres?.castingAbility;
  const castingAbilityMod = getAbilityMod(castingAbility);
  const castingAbilityChangeData = getCastingAbilityChange(castingAbility, castingAbilityMod);

  const changeData: DefaultChangeData[] = [
    defaultChangeData,
    batteredChangeData,
    castingAbilityChangeData,
  ].filter(nonNullable);

  // Actually add Changes to the system's process
  changes.push(
    ...changeData.flatMap(
      (data) => data.changes?.map((changeData) => ItemChange.create(changeData)) ?? []
    )
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
      subTarget: "~spherecl",
      modifier: "untyped",
    },
    // For every magic sphere, determine CL from base + general HD capped + sphere specific HD capped
    ...Object.keys(PF1S.magicSpheres).map(
      (sphere): ItemChangeCreateData => ({
        formula: `min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.${sphere}.modCap)`,
        subTarget: `spherecl${sphere.capitalize()}`,
        modifier: "untyped",
      })
    ),
    // Add a change to add total BAB to sphere BABs
    {
      formula: "@attributes.bab.total",
      subTarget: "~spherebabBase",
      modifier: "base",
    },
    // Add MSB Base to Total
    { formula: "@spheres.msb.base", subTarget: "msb", modifier: "base" },
    // Add MSD Base to Total
    { formula: "@spheres.msd.base", subTarget: "msd", modifier: "base" },
  ],
});

/** Returns DefaultChangeData dependent on whether the battered condition is true */
const getBatteredChangeData = (battered: boolean): DefaultChangeData | undefined =>
  battered
    ? {
        changes: [
          {
            formula: "-2",
            subTarget: "cmd",
            modifier: "untyped",
          },
        ],
        nSourceInfo: [["data.attributes.cmd.total", { value: -2, name: localize("Battered") }]],
      }
    : undefined;

const getCastingAbilityChange = (
  ability: Ability | "" | undefined,
  modifier: number
): DefaultChangeData | undefined =>
  ability !== undefined && ability !== ""
    ? {
        changes: [
          {
            formula: `${modifier}`,
            subTarget: "sphereConcentration",
            modifier: "untyped",
          },
          { formula: `@spheres.msb.total`, subTarget: "sphereConcentration", modifier: "untyped" },
          { formula: `${modifier}`, subTarget: "~castingAbility", modifier: "untyped" },
        ],
        pSourceInfo: [
          [
            "data.spheres.concentration.total",
            {
              value: modifier,
              name: `${localize("CastingAbility")} (${CONFIG.PF1.abilities[ability]})`,
            },
          ],
          [
            "data.spheres.concentration.total",
            { name: localize("MagicSkillBonus"), formula: "@spheres.msb.total" },
          ],
        ],
      }
    : undefined;

/** Returns a collection of helper functions and classes for actor and ItemChange handling */
const getChangeHelpers = (actor: ActorPF) => ({
  ...getActorHelpers(actor),
  ItemChange: getGame().pf1.documentComponents.ItemChange,
});

/** A data set used to create Changes added bu default as well as corresponding source info */
interface DefaultChangeData {
  changes?: ItemChangeCreateData[];
  nSourceInfo?: [ActorDataPath, SourceEntry][];
  pSourceInfo?: [ActorDataPath, SourceEntry][];
}

type ChangeFlatTargetData = { default: ActorDataPath[] } & {
  [Key in BonusModifier]?: ActorDataPath[];
};
