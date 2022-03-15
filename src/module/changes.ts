import type { ActorDataPath, ActorPF } from "./actor-data";
import { PF1S } from "./config";
import type {
  BonusModifier,
  ItemChange,
  ItemChangeCreateData,
  SourceEntry,
  SphereBABChangeTarget,
  SphereChangeTarget,
  SphereCLChangeTarget,
} from "./item-data";
import type { ActorHelpers } from "./util";
import { getActorHelpers, getGame, localize } from "./util";

/**
 * Registers all change targets not already part of {@link PF1CONFIG.buffTargets}
 * and applies additional changes to the PF1 system config.
 */
export const registerChanges = (): void => {
  // Register sphere specific CL change targets
  for (const [key, value] of Object.entries(PF1S.magicSpheres)) {
    setProperty(CONFIG.PF1.buffTargets, `spherecl${key.capitalize()}`, {
      label: `${value} ${localize("CasterLevel")}`,
      category: "sphereCasterLevel",
    });

    // Register sphere specific BAB change targets
    for (const [key, value] of Object.entries(PF1S.combatSpheres)) {
      setProperty(CONFIG.PF1.buffTargets, `spherebab${key.capitalize()}`, {
        label: `${value} ${localize("PF1.BAB")}`,
        category: "sphereBAB",
      });
    }
  }

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
  // General Sphere CL
  spherecl: {
    default: [
      "data.spheres.cl.total",
      ...Object.keys(PF1S.magicSpheres).map(
        (sphere): ActorDataPath => `data.spheres.cl.${sphere}.total`
      ),
    ],
    sphereCLCap: ["data.spheres.cl.modCap"],
  },
  // MSB
  msb: {
    default: ["data.spheres.msb.total"],
    untypedPerm: ["data.spheres.msb.base"],
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
  const { ItemChange, pushNSourceInfo, pushPSourceInfo } = getChangeHelpers(actor);

  // Generate array with all change data and source info
  const changeData = [
    getDefaultChanges(),
    getBatteredChange(actor.data.data.attributes.conditions.battered ?? false),
  ];

  // Actually add Changes to the system's process
  changes.push(
    ...changeData.flatMap((data) => data.changes.map((changeData) => ItemChange.create(changeData)))
  );
  // Push source info into actor
  changeData.forEach((cd) => {
    cd.pSourceInfo.forEach((si) => pushPSourceInfo(si[0], si[1]));
    cd.nSourceInfo.forEach((si) => pushNSourceInfo(si[0], si[1]));
  });

  // Return changeData to enable easier testing
  return changeData;
};

/** Returns DefaultChangeData applicable to every single actor, regardless of actor data */
const getDefaultChanges = (): DefaultChangeData =>
  createDefaultChangeData({
    changes: [
      // Push ModCap to Total change (and every sphere's total!)
      {
        formula: "min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap)",
        subTarget: "spherecl",
        modifier: "untyped",
      },
      // For every magic sphere, add a change to determine actually applicable capped CL bonus and add that
      ...Object.keys(PF1S.magicSpheres).map(
        (sphere): ItemChangeCreateData => ({
          formula: `min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.${sphere}.modCap) - @spheres.cl.base`,
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
const getBatteredChange = (battered: boolean): DefaultChangeData =>
  battered
    ? createDefaultChangeData({
        changes: [
          {
            formula: "-2",
            subTarget: "cmd",
            modifier: "untyped",
          },
        ],
        nSourceInfo: [["data.attributes.cmd.total", { value: -2, name: localize("Battered") }]],
      })
    : createDefaultChangeData();

/** Returns a collection of helper functions and classes for actor and ItemChange handling */
const getChangeHelpers = (actor: ActorPF): ChangeHelpers => ({
  ...getActorHelpers(actor),
  ItemChange: getGame().pf1.documentComponents.ItemChange,
});

/**
 * Constructs DefaultChangeData from a Partial, guaranteeing that all properties will be present
 */
const createDefaultChangeData = (data: Partial<DefaultChangeData> = {}): DefaultChangeData => ({
  changes: data.changes ?? [],
  nSourceInfo: data.nSourceInfo ?? [],
  pSourceInfo: data.pSourceInfo ?? [],
});

interface ChangeHelpers extends ActorHelpers {
  ItemChange: typeof ItemChange;
}

interface DefaultChangeData {
  changes: ItemChangeCreateData[];
  nSourceInfo: [ActorDataPath, SourceEntry][];
  pSourceInfo: [ActorDataPath, SourceEntry][];
}

type ChangeFlatTargetData = { default: ActorDataPath[] } & {
  [Key in BonusModifier]?: ActorDataPath[];
};
