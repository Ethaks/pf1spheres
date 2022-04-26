import { PF1S } from "./config";
import type { CombatSphere, MagicSphere, Sphere } from "./item-data";

/**
 * Returns and asserts whether a string containing a Sphere is a Magic Sphere
 */
export const isMagicSphere = (sphere: Sphere): sphere is MagicSphere => sphere in PF1S.magicSpheres;

/**
 * Returns and asserts whether a string containing a Sphere is a Combat Sphere
 */
export const isCombatSphere = (sphere: Sphere): sphere is CombatSphere =>
  sphere in PF1S.combatSpheres;

/**
 * Returns a given Sphere's type, or `undefined` if the type cannot be determined
 */
export const getSphereType = (sphere: Sphere): "magic" | "combat" | undefined => {
  if (isMagicSphere(sphere)) return "magic";
  else if (isCombatSphere(sphere)) return "combat";
  else return undefined;
};

/**
 * Returns a given Sphere's display name
 */
export const getSphereDisplayName = (sphere: Sphere) => {
  if (isMagicSphere(sphere)) return PF1S.magicSpheres[sphere];
  else if (isCombatSphere(sphere)) return PF1S.combatSpheres[sphere];
};
