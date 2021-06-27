import { ActorPF } from "./actor-data";
import { PF1S } from "./config";
import { BonusModifier, ItemChange, SphereChangeTarget } from "./item-data";
import { localize, pushPositiveSourceInfo } from "./util";

/**
 * Registers all change targets not already part of {@link PF1CONFIG.buffTargets}
 * and applies additional changes to the PF1 system config.
 */
export const registerChanges = (): void => {
  for (const [key, value] of Object.entries(PF1S.magicSpheres)) {
    setProperty(CONFIG.PF1.buffTargets, `spherecl${key.capitalize()}`, {
      label: `${value} ${localize("CasterLevel")}`,
      category: "sphereCasterLevel",
    });
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
  result: { keys: string[] }
): void => {
  // General CL (possibly capped)
  if (target === "spherecl") {
    if (modifier !== "sphereCLCap") {
      // General CL increase affects total CL as well as all sphere totals
      result.keys.push("data.spheres.cl.total");
      for (const sphere of Object.keys(PF1S.magicSpheres)) {
        result.keys.push(`data.spheres.cl.${sphere}.total`);
      }
    } else result.keys.push("data.spheres.cl.modCap");
  }
  // General MSB
  else if (target === "msb") {
    if (modifier === "untypedPerm") result.keys.push("data.spheres.msb.base");
    else result.keys.push("data.spheres.msb.total");
  }
  // General MSD
  else if (target === "msd")
    if (modifier === "untypedPerm") result.keys.push("data.spheres.msd.base");
    else result.keys.push("data.spheres.msd.total");
  // Sphere specific CL (possibly capped)
  else if (target.startsWith("spherecl")) {
    const sphere = target.substr(8).toLowerCase();
    if (modifier !== "sphereCLCap") result.keys.push(`data.spheres.cl.${sphere}.total`);
    else result.keys.push(`data.spheres.cl.${sphere}.modCap`);
  }
};

/**
 * Adds general/default changes to an actor's Changes array.
 * These Changes are either applicable for all actors (like handling MSB/MSD),
 * or they are triggered by an actor's general data (like conditions).
 *
 * @param {ActorPF} actor - The actor to whose Changes data is added
 * @param {ItemChange[]} changes - The array of Changes that will be applied to this actor
 */
export const addDefaultChanges = (actor: ActorPF, changes: ItemChange[]): void => {
  // Get ItemChange class from PF1 API
  const ItemChange = game.pf1.documentComponents.ItemChange;
  // Get curried function to add to sourceInfo
  const pushPSourceInfo = pushPositiveSourceInfo(actor);

  // Push ModCap to Total change (and every sphere's total!)
  changes.push(
    ItemChange.create({
      formula: "min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap)",
      subTarget: "spherecl",
      modifier: "untyped",
    })
  );

  // For every sphere, add a change to determine actually applicable capped CL bonus and add that
  for (const sphere of Object.keys(PF1S.magicSpheres) as Array<keyof typeof PF1S["magicSpheres"]>) {
    changes.push(
      ItemChange.create({
        formula: `min(@attributes.hd.total, @spheres.cl.base + @spheres.cl.modCap + @spheres.cl.${sphere}.modCap) - @spheres.cl.base`,
        subTarget: `spherecl${sphere.capitalize()}`,
        modifier: "untyped",
      })
    );
  }

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
    pushPSourceInfo("data.attributes.cmd.total", {
      value: -2,
      name: localize("Battered"),
    });
  }
};
