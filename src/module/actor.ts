import { ActorPF } from "./actor-data";
import { TotalModData, ValueData } from "./common-data";
import { PF1S } from "./config";
import { CombatSphere, MagicSphere } from "./item-data";
import { getActorHelpers, getGame } from "./util";

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
  // Get curried function to add to sourceInfo
  const { pushPSourceInfo } = getActorHelpers(actor);
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

  // Populate/reset spheres data
  actor.data.data.spheres = {
    cl: {
      ...fillSpheres(Object.keys(PF1S.magicSpheres) as MagicSphere[], totalModTemplate),
      ...valueDataTemplate(),
    },
    msb: valueDataTemplate(),
    msd: valueDataTemplate(),
    bab: fillSpheres(Object.keys(PF1S.combatSpheres) as CombatSphere[], totalModTemplate),
  };
  // From now on sphereData is guaranteed to be populated
  const sphereData = actor.data.data.spheres;

  // Start actual calculations
  const useFractionalBAB = getGame().settings.get("pf1", "useFractionalBaseBonuses") ?? false;

  // Determine MSB and Caster Level from classes
  const { casterLevel, baseMSB } = actor.items.reduce(
    (levels, item) => {
      const itemData = item.data;
      if (itemData.type === "class" && !!itemData.flags.pf1spheres?.casterProgression) {
        // Increase MSB regardless of caster level
        levels.baseMSB += itemData.data.level ?? 0;
        pushPSourceInfo("data.spheres.msb.base", {
          value: itemData.data.level ?? 0,
          name: item.name ?? "",
        });
        pushPSourceInfo("data.spheres.msd.base", {
          value: itemData.data.level ?? 0,
          name: item.name ?? "",
        });

        // Determine progression for actual CL contribution
        const progression = itemData.flags.pf1spheres.casterProgression;
        const rawLevel = (PF1S.progressionFormula[progression] ?? 0) * itemData.data.level;
        // The actual number of levels contributed by this class
        const addLevel = useFractionalBAB ? rawLevel : Math.floor(rawLevel);
        // Add level to sum and sourceInfo
        levels.casterLevel += addLevel;
        pushPSourceInfo("data.spheres.cl.base", {
          value: addLevel,
          name: item.name ?? "",
        });
      }
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
