import { PF1S } from "./config";
import { BonusModifier, SphereChangeTarget } from "./item-data";
import { localize } from "./util";

/**
 * Registers all change targets not already part of {@link PF1CONFIG.buffTargets}
 */
export const registerChanges = (): void => {
  for (const [key, value] of Object.entries(PF1S.magicSpheres)) {
    setProperty(CONFIG.PF1.buffTargets, `spherecl${key.capitalize()}`, {
      label: `${value} ${localize("CasterLevel")}`,
      category: "sphereCasterLevel",
    });
  }
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
    if (modifier !== "sphereCLCap") result.keys.push("data.spheres.cl.mod");
    else result.keys.push("data.spheres.cl.modCap");
  }
  // General MSB
  else if (target === "msb") result.keys.push("data.spheres.msb.mod");
  // General MSD
  else if (target === "msd") result.keys.push("data.spheres.msd.mod");
  // Sphere specific CL (possibly capped)
  else if (target.startsWith("spherecl")) {
    const sphere = target.substr(8).toLowerCase();
    if (modifier !== "sphereCLCap") result.keys.push(`data.spheres.cl.${sphere}.mod`);
    else result.keys.push(`data.spheres.cl.${sphere}.modCap`);
  }
};
