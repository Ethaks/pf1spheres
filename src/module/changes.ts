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
  if (target === "spherecl") result.keys.push("data.spheres.cl.mod");
  else if (target === "msb") result.keys.push("data.spheres.msb.mod");
  else if (target === "msd") result.keys.push("data.spheres.msd.mod");
  else if (target.startsWith("spherecl")) {
    const sphere = target.substr(8).toLowerCase();
    result.keys.push(`data.spheres.cl.${sphere}.mod`);
  }
};
