import { PF1ActorSpheresData } from "./actor-data";
import { TotalModData, ValueData } from "./common-data";
import { PF1S } from "./config";
import { PF1ItemData } from "./item-data";

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
  setProperty(sphereData, "cl.base", useFractionalBAB ? Math.floor(casterLevel) : casterLevel);
  setProperty(sphereData, "cl.total", casterLevel + (sphereData.cl.mod ?? 0));

  // Set total CL for every sphere
  for (const sphere of Object.keys(PF1S.magicSpheres)) {
    const modifier = getProperty(sphereData.cl, `${sphere}.mod`);
    setProperty(sphereData.cl, `${sphere}.total`, sphereData.cl.total + modifier);
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

export const onActorBasePreparation = (actor: Actor): void => {
  const valueDataTemplate: ValueData<number> = {
    base: 0,
    mod: 0,
    total: 0,
  };

  const totalModTemplate: TotalModData<number> = {
    mod: 0,
    total: 0,
  };

  actor.data.data.spheres = {
    cl: foundry.utils.deepClone(valueDataTemplate),
    msb: foundry.utils.deepClone(valueDataTemplate),
    msd: foundry.utils.deepClone(valueDataTemplate),
  };
  for (const sphere of Object.keys(PF1S.magicSpheres)) {
    setProperty(actor.data, `data.spheres.cl.${sphere}`, foundry.utils.deepClone(totalModTemplate));
  }
};
