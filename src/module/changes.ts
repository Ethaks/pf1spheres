import { ActorPF } from "./actor-data";
import { PF1S } from "./config";
import { BonusModifier, ItemChange, PF1ClassData, SphereChangeTarget } from "./item-data";
import { localize } from "./util";

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

export const addDefaultChanges = (actor: ActorPF, changes: ItemChange[]): void => {
  // Get ItemChange class from PF1 API
  const ItemChange = game.pf1.documentComponents.ItemChange;
  // Get getSourceInfo util function from PF1 for source tracking
  const getSourceInfo = game.pf1.utils.getSourceInfo;

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

  // Apply MSB from classes TODO: Move this into base data prep?
  actor.items
    .filter((i) => i.data.type === "class" && i.data.flags.pf1spheres?.casterProgression !== "")
    .forEach((i) => {
      changes.push(
        ItemChange.create({
          formula: `${(i.data as PF1ClassData).data.level ?? 0}`,
          subTarget: "msb",
          modifier: "untypedPerm",
        })
      );
    });
  // Add MSB Base to Total
  changes.push(
    ItemChange.create({ formula: "@spheres.msb.base", subTarget: "msb", modifier: "base" })
  );
  // Calculate MSD from MSB
  changes.push(
    ItemChange.create({ formula: "@spheres.msb.base + 11", subTarget: "msd", modifier: "base" })
  );

  if (actor.data.data.attributes.conditions.battered) {
    changes.push(
      ItemChange.create({
        formula: "-2",
        subTarget: "cmd",
        modifier: "untyped",
      })
    );
    getSourceInfo(actor.sourceInfo, "data.attributes.cmd.total").negative.push({
      value: -2,
      name: game.i18n.localize("PF1SPHERES.Battered"),
    });
  }
};
