import { PF1ActorSpheresData } from "./actor-data";
import { TotalModData, ValueData } from "./common-data";
import { PF1S } from "./config";
import { PF1ItemData, Sphere } from "./item-data";

/**
 * Hook into the preparation of derived data for Actors, calculating all
 * data dependent on an actor's Items, like Caster Level and MSB/D.
 *
 * @param actor - The actor whose data gets prepared
 */
export const onActorPreparation = (actor: Actor): void => {
  const sphereData: PF1ActorSpheresData = actor.data.data.spheres;
  const useFractionalBAB =
    (game.settings.get("pf1", "useFractionalBaseBonuses") as boolean) ?? false;

  // Set Caster Level, MSB, and MSD
  const casterLevel = actor.items.reduce((level, item) => {
    const itemData = item.data as PF1ItemData;
    if (itemData.type === "class") {
      const progression = itemData.flags.pf1spheres?.casterProgression;
      const rawLevel = (PF1S.progressionFormula[progression] ?? 0) * itemData.data.level;
      if (useFractionalBAB) level += rawLevel;
      else level += Math.floor(rawLevel);
    }
    return level;
  }, 0);
  // Base Caster Level after fractional BAB check
  const baseCasterLevel = useFractionalBAB ? Math.floor(casterLevel) : casterLevel;
  setProperty(sphereData, "cl.base", baseCasterLevel);

  // Determine actual value of CL changes capped at HD
  const cappedSphereCLMod =
    Math.min(actor.data.data.attributes.hd.total, sphereData.cl.modCap + baseCasterLevel) -
    baseCasterLevel;
  // Set resulting general CL
  setProperty(sphereData, "cl.total", baseCasterLevel + cappedSphereCLMod + sphereData.cl.mod);

  // Set total CL for every sphere
  for (const sphere of Object.keys(PF1S.magicSpheres)) {
    // Uncapped sphere-specific modifier
    const modifier = getProperty(sphereData.cl, `${sphere}.mod`) as number;
    // Modifier capped at HD
    const cappedModifier = getProperty(sphereData.cl, `${sphere}.modCap`) as number;
    // Actual capped modifier after evaluating it against the actor's HD
    const applicableCappedModifier =
      Math.min(actor.data.data.attributes.hd.total, sphereData.cl.total + cappedModifier) -
      sphereData.cl.total;
    setProperty(
      sphereData.cl,
      `${sphere}.total`,
      sphereData.cl.total + modifier + applicableCappedModifier
    );
  }

  // Calculate MSB from classes, set total from base + mod
  const msb = actor.items.reduce(
    (msb, item) => ((item.data as PF1ItemData).type === "class" ? msb + item.data.data.level : msb),
    0
  );
  setProperty(sphereData, "msb.base", msb);
  setProperty(sphereData, "msb.total", msb + (sphereData.msb.mod ?? 0));
  setProperty(sphereData, "msd.base", msb + 11);
  setProperty(sphereData, "msd.total", msb + 11 + (sphereData.msd.mod ?? 0));
};

/**
 * Hooks into the preparation of base data for Actors, resetting values later
 * on derived from items, like Caster Level and MSB/D.
 *
 * Every change target needs to get initialised with a value of the type number,
 * as otherwise Changes cannot be calculated and summed up.
 *
 * @param {Actor} actor - The actor whose data gets prepared
 */
export const onActorBasePreparation = (actor: Actor): void => {
  const valueDataTemplate: ValueData<number> = {
    base: 0,
    mod: 0,
    modCap: 0,
    total: 0,
  };

  const totalModTemplate: TotalModData<number> = {
    mod: 0,
    modCap: 0,
    total: 0,
  };

  actor.data.data.spheres = {
    cl: foundry.utils.deepClone(valueDataTemplate),
    msb: foundry.utils.deepClone(valueDataTemplate),
    msd: foundry.utils.deepClone(valueDataTemplate),
  };
  for (const sphere of Object.keys(PF1S.magicSpheres) as Sphere[]) {
    setProperty(actor.data, `data.spheres.cl.${sphere}`, foundry.utils.deepClone(totalModTemplate));
  }
};
