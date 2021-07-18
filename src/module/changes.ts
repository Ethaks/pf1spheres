import { ActorDataPath, ActorPF } from "./actor-data";
import { PF1S } from "./config";
import {
  BonusModifier,
  CombatSphere,
  ItemChange,
  MagicSphere,
  SphereChangeTarget,
} from "./item-data";
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
): void => {
  const push = (key: ActorDataPath) => {
    result.keys.push(key);
  };
  // General CL (possibly capped)
  if (target === "spherecl") {
    if (modifier !== "sphereCLCap") {
      // General CL increase affects total CL as well as all sphere totals
      push("data.spheres.cl.total");
      for (const sphere of Object.keys(PF1S.magicSpheres)) {
        push(`data.spheres.cl.${sphere}.total`);
      }
    } else push("data.spheres.cl.modCap");
  }
  // General MSB
  else if (target === "msb") {
    if (modifier === "untypedPerm") push("data.spheres.msb.base");
    else push("data.spheres.msb.total");
  }
  // General MSD
  else if (target === "msd")
    if (modifier === "untypedPerm") push("data.spheres.msd.base");
    else push("data.spheres.msd.total");
  // Sphere specific CL (possibly capped)
  else if (target.startsWith("spherecl")) {
    const sphere = target.substr(8).toLowerCase() as MagicSphere;
    if (modifier !== "sphereCLCap") result.keys.push(`data.spheres.cl.${sphere}.total`);
    else push(`data.spheres.cl.${sphere}.modCap`);
  }
  // One change to move BAB to sphere BAB
  else if (target === "~spherebabBase") {
    for (const sphere of Object.keys(PF1S.combatSpheres)) {
      push(`data.spheres.bab.${sphere}.total`);
    }
  }
  // Sphere specific BAB
  else if (target.startsWith("spherebab")) {
    const sphere = target.substr(9).toLocaleLowerCase() as CombatSphere;
    push(`data.spheres.bab.${sphere}.total`);
  }
};

/**
 * Adds general/default changes to an actor's Changes array.
 * These Changes are either applicable for all actors (like handling MSB/MSD),
 * or they are triggered by an actor's general data (like conditions).
 *
 * @param actor - The actor to whose Changes data is added
 * @param changes - The array of Changes that will be applied to this actor
 */
export const addDefaultChanges = (actor: ActorPF, changes: ItemChange[]): void => {
  // Get ItemChange class from PF1 API
  const ItemChange = getGame().pf1.documentComponents.ItemChange;
  // Get actor helpers
  const { pushNSourceInfo } = getActorHelpers(actor);

  // Push ModCap to Total change (and every sphere's total!)
  changes.push(
    ItemChange.create({
      formula: "min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap)",
      subTarget: "spherecl",
      modifier: "untyped",
    })
  );

  // For every magic sphere, add a change to determine actually applicable capped CL bonus and add that
  for (const sphere of Object.keys(PF1S.magicSpheres)) {
    changes.push(
      ItemChange.create({
        formula: `min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.${sphere}.modCap) - @spheres.cl.base`,
        subTarget: `spherecl${sphere.capitalize()}`,
        modifier: "untyped",
      })
    );
  }

  // Add a change to add total BAB to sphere BABs
  changes.push(
    ItemChange.create({
      formula: "@attributes.bab.total",
      subTarget: "~spherebabBase",
      modifier: "base",
    })
  );

  // Add MSB Base to Total
  changes.push(
    ItemChange.create({ formula: "@spheres.msb.base", subTarget: "msb", modifier: "base" })
  );
  // Add MSD Base to Total
  changes.push(
    ItemChange.create({ formula: "@spheres.msd.base", subTarget: "msd", modifier: "base" })
  );

  // Handle the Battered condition
  if (actor.data.data.attributes.conditions.battered) {
    changes.push(
      ItemChange.create({
        formula: "-2",
        subTarget: "cmd",
        modifier: "untyped",
      })
    );
    pushNSourceInfo("data.attributes.cmd.total", {
      value: -2,
      name: localize("Battered"),
    });
  }
};
