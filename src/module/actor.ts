import { PF1ActorSpheresData } from "./actor-data";
import { TotalModData, ValueData } from "./common-data";
import { PF1S } from "./config";
import { PF1ItemData } from "./item-data";

/**
 * Hooks into the preparation of base data for Actors, setting base values
 * derived from class levels.
 *
 * Every change target needs to get initialised with a value of the type number,
 * as otherwise Changes cannot be calculated and summed up.
 *
 * @param {Actor} actor - The actor whose data gets prepared
 */
export const onActorBasePreparation = (actor: Actor): void => {
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
  };
  for (const sphere of Object.keys(PF1S.magicSpheres) as Array<keyof typeof PF1S["magicSpheres"]>) {
    setProperty(actor.data, `data.spheres.cl.${sphere}`, foundry.utils.deepClone(totalModTemplate));
  }

  // Start actual calculations
  const sphereData: PF1ActorSpheresData = actor.data.data.spheres;
  const useFractionalBAB =
    (game.settings.get("pf1", "useFractionalBaseBonuses") as boolean) ?? false;

  // Set Caster Level, MSB, and MSD
  const casterLevel = actor.items.reduce((level, item) => {
    const itemData = item.data as PF1ItemData;
    if (itemData.type === "class" && !!itemData.flags.pf1spheres?.casterProgression) {
      const progression = itemData.flags.pf1spheres.casterProgression;
      const rawLevel = (PF1S.progressionFormula[progression] ?? 0) * itemData.data.level;
      if (useFractionalBAB) level += rawLevel;
      else level += Math.floor(rawLevel);
    }
    return level;
  }, 0);
  // Base Caster Level after fractional BAB check
  const baseCasterLevel = useFractionalBAB ? Math.floor(casterLevel) : casterLevel;
  setProperty(sphereData, "cl.base", baseCasterLevel);
};
