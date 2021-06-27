import { ActorPF, PF1ActorSpheresData } from "./actor-data";
import { TotalModData, ValueData } from "./common-data";
import { PF1S } from "./config";
import { PF1ItemData } from "./item-data";
import { pushPositiveSourceInfo } from "./util";

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
  const pushPSourceInfo = pushPositiveSourceInfo(actor);
  // Data layouts for spheres data
  const valueDataTemplate: ValueData<number> = {
    base: 0,
    modCap: 0,
    total: 0,
  };
  const totalModTemplate: TotalModData<number> = {
    modCap: 0,
    total: 0,
  }; // >

  // Populate spheres data
  actor.data.data.spheres = {
    cl: foundry.utils.deepClone(valueDataTemplate),
    msb: foundry.utils.deepClone(valueDataTemplate),
    msd: foundry.utils.deepClone(valueDataTemplate),
  } as PF1ActorSpheresData; // Spheres get added in next lines
  for (const sphere of Object.keys(PF1S.magicSpheres) as Array<keyof typeof PF1S["magicSpheres"]>) {
    setProperty(actor.data, `data.spheres.cl.${sphere}`, foundry.utils.deepClone(totalModTemplate));
  }

  // Start actual calculations
  const sphereData: PF1ActorSpheresData = actor.data.data.spheres;
  const useFractionalBAB =
    (game.settings.get("pf1", "useFractionalBaseBonuses") as boolean) ?? false;

  // Determine MSB and Caster Level from classes
  const { casterLevel, baseMSB } = actor.items.reduce(
    (levels, item) => {
      const itemData = item.data as PF1ItemData;
      if (itemData.type === "class" && !!itemData.flags.pf1spheres?.casterProgression) {
        // Increase MSB regardless of caster level
        levels.baseMSB += itemData.data.level ?? 0;
        pushPSourceInfo("data.spheres.msb.base", {
          value: itemData.data.level ?? 0,
          name: item.name,
        });
        pushPSourceInfo("data.spheres.msd.base", {
          value: itemData.data.level ?? 0,
          name: item.name,
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
          name: item.name,
        });
      }
      return levels;
    },
    { casterLevel: 0, baseMSB: 0 }
  );
  // Set base MSB and MSD
  setProperty(sphereData, "msb.base", baseMSB);
  setProperty(sphereData, "msd.base", baseMSB + 11);
  // Base Caster Level after fractional BAB check
  const baseCasterLevel = useFractionalBAB ? Math.floor(casterLevel) : casterLevel;
  setProperty(sphereData, "cl.base", baseCasterLevel);
};
