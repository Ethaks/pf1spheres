import type { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import type { ActorPF, PF1ActorSpheresData } from "./actor-data";
import type { TotalModData, ValueData } from "./common-data";
import { PF1S } from "./config";
import type { CombatSphere, MagicSphere, PF1ClassDataSource } from "./item-data";
import { getActorHelpers, getGame, localize, pushSourceInfo } from "./util";

/**
 * Hooks into the preparation of base data for Actors, setting base values
 * derived from class levels.
 *
 * Every change target needs to get initialised with a value of the type number,
 * as otherwise Changes cannot be calculated and summed up.
 *
 * @param {Actor} actor - The actor whose data gets prepared
 */
export const onActorBasePreparation = (actor: ActorPF): void => {
  // Populate/reset spheres data
  const sphereData = (actor.data.data.spheres = getBlankSphereData());

  // Start actual calculations
  const useFractionalBAB = getGame().settings.get("pf1", "useFractionalBaseBonuses") ?? false;

  pushSourceInfo(actor, "positive")("data.spheres.msd.base", {
    name: localize("PF1.Base"),
    value: 11,
  });

  // Determine MSB and Caster Level from classes
  const { casterLevel, baseMSB } = actor.items
    .map((i) => i.data)
    .filter(filterClasses)
    .map(getItemLevelData(useFractionalBAB))
    .map(pushLevelSources(actor))
    .reduce(
      (levels, data) => {
        levels.casterLevel += data.clPart;
        levels.baseMSB += data.baseLevel;
        return levels;
      },
      { casterLevel: 0, baseMSB: 0 }
    );

  // Set base MSB and MSD
  sphereData.msb.base = baseMSB;
  sphereData.msd.base = baseMSB + 11;

  // Base Caster Level after fractional BAB check
  const baseCasterLevel = useFractionalBAB ? Math.floor(casterLevel) : casterLevel;
  sphereData.cl.base = baseCasterLevel;
};

/** Filters itemData by its type, narrowing available data to class data with a caster progression */
export const filterClasses = (item: ItemData): item is ItemData & PF1ClassDataSource =>
  item.type === "class" && Boolean(item.flags.pf1spheres?.casterProgression);

/**
 * Returns a function that determines an itemData's effective contribution to
 * a character's overall sphere caster level dependent on fractional BAB rules usage.
 */
export const getItemLevelData =
  (useFractionalBAB: boolean) =>
  (item: ItemData & PF1ClassDataSource): ItemSphereClData => {
    const baseLevel = item.data.level ?? 0;

    // Determine progression for actual CL contribution
    const progression = item.flags.pf1spheres?.casterProgression;
    const rawLevel =
      progression && progression in PF1S.progressionFormula
        ? PF1S.progressionFormula[progression] * baseLevel
        : 0;

    // The actual number of levels contributed by this class
    const clPart = useFractionalBAB ? rawLevel : Math.floor(rawLevel);

    return { baseLevel, clPart, name: item.name };
  };

/**
 * Returns a function that adds an itemData's data to an actor's source info
 * and returns the itemData unchanged.
 */
export const pushLevelSources = (
  actor: ActorPF
): ((data: ItemSphereClData) => ItemSphereClData) => {
  // Get curried function to add to sourceInfo
  const { pushPSourceInfo } = getActorHelpers(actor);

  return (data: ItemSphereClData): ItemSphereClData => {
    if (data.baseLevel > 0) {
      pushPSourceInfo("data.spheres.msb.base", {
        value: data.baseLevel ?? 0,
        name: data.name,
      });
      pushPSourceInfo("data.spheres.msd.base", {
        value: data.baseLevel ?? 0,
        name: data.name,
      });
    }
    if (data.clPart > 0) {
      pushPSourceInfo("data.spheres.cl.base", {
        value: data.clPart,
        name: data.name,
      });
    }
    return data;
  };
};

/**
 * Returns an object containing all spheres data with reset values as it is expected by the system.
 */
const getBlankSphereData = (): PF1ActorSpheresData => {
  // Data layouts for spheres data
  const valueDataTemplate = (): ValueData<number> => ({
    base: 0,
    modCap: 0,
    total: 0,
  });
  const totalModTemplate = (): TotalModData<number> => ({
    modCap: 0,
    total: 0,
  });

  /** Helper to fill a Record containing spheres, each with a data set */
  /* eslint-disable-next-line @typescript-eslint/ban-types */
  const fillSpheres = <S extends string, D extends () => object>(keys: S[], data: D) =>
    Object.fromEntries(keys.map((k) => [k, data()])) as { [Key in S]: ReturnType<D> };

  return {
    cl: {
      ...fillSpheres(Object.keys(PF1S.magicSpheres) as MagicSphere[], totalModTemplate),
      ...valueDataTemplate(),
    },
    msb: valueDataTemplate(),
    msd: valueDataTemplate(),
    bab: fillSpheres(Object.keys(PF1S.combatSpheres) as CombatSphere[], totalModTemplate),
  };
};

export interface ItemSphereClData {
  clPart: number;
  baseLevel: number;
  name: string;
}
