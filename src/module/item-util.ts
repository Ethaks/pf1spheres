// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

import type { CombatSphere, MagicSphere, Sphere } from "./item-data";

/**
 * Returns and asserts whether a string containing a Sphere is a Magic Sphere
 */
export const isMagicSphere = (sphere: Sphere | string): sphere is MagicSphere =>
  sphere in pf1s.config.magicSpheres;

/**
 * Returns and asserts whether a string containing a Sphere is a Combat Sphere
 */
export const isCombatSphere = (sphere: Sphere | string): sphere is CombatSphere =>
  sphere in pf1s.config.combatSpheres;

/**
 * Returns a given Sphere's type, or `undefined` if the type cannot be determined
 */
export const getSphereType = (sphere: Sphere): "magic" | "combat" | undefined => {
  if (isMagicSphere(sphere)) return "magic";
  else if (isCombatSphere(sphere)) return "combat";
  else return undefined;
};

/**
 * Returns a Record containing all Spheres and their translations
 */
export const getAllSpheres = () =>
  ({ ...pf1s.config.magicSpheres, ...pf1s.config.combatSpheres }) as Record<Sphere, string>;

/**
 * Returns a given Sphere's display name
 */
export const getSphereDisplayName = (sphere: Sphere) => {
  if (isMagicSphere(sphere)) return pf1s.config.magicSpheres[sphere];
  else if (isCombatSphere(sphere)) return pf1s.config.combatSpheres[sphere];
  else throw new Error(`No display name found for "${sphere}"`);
};
