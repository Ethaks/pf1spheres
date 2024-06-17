// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

import { SphereConfiguration } from "./config";
import type { CombatSphere, MagicSphere, SkillSphere, Sphere } from "./item-data";

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
 * Returns and asserts whether a string containing a Sphere is a Skill Sphere
 */
export const isSkillSphere = (sphere: Sphere | string): sphere is SkillSphere =>
  sphere in pf1s.config.skillSpheres;

/**
 * Returns a given Sphere's type, or `undefined` if the type cannot be determined
 */
export const getSphereType = (sphere: Sphere): "magic" | "combat" | "skill" | undefined => {
  if (isMagicSphere(sphere)) return "magic";
  else if (isCombatSphere(sphere)) return "combat";
  else if (isSkillSphere(sphere)) return "skill";
  else return undefined;
};

/**
 * Returns a Record containing all Spheres and their translations
 */
export const getAllSpheres = () =>
  Object.fromEntries([
    ...Object.entries(pf1s.config.magicSpheres).map(([key, value]) => [key, value.label]),
    ...Object.entries(pf1s.config.combatSpheres).map(([key, value]) => [key, value.label]),
    ...Object.entries(pf1s.config.skillSpheres).map(([key, value]) => [key, value.label]),
  ]) as Record<Sphere, string>;

/**
 * Returns a given Sphere's display name
 */
export const getSphereDisplayName = (sphere: Sphere) => {
  if (isMagicSphere(sphere)) return pf1s.config.magicSpheres[sphere].label;
  else if (isCombatSphere(sphere)) return pf1s.config.combatSpheres[sphere].label;
  else if (isSkillSphere(sphere)) return pf1s.config.skillSpheres[sphere].label;
  else throw new Error(`No display name found for "${sphere}"`);
};

/**
 * Returns the whole {@link SphereConfiguration} of a {@link Sphere}.
 */
export const getSphereConfig = (sphere: Sphere): Required<SphereConfiguration> => {
  const baseConfig: Required<SphereConfiguration> = { label: "", icon: "", reference: "" };
  if (isMagicSphere(sphere)) return { ...baseConfig, ...pf1s.config.magicSpheres[sphere] };
  else if (isCombatSphere(sphere)) return { ...baseConfig, ...pf1s.config.combatSpheres[sphere] };
  else if (isSkillSphere(sphere)) return { ...baseConfig, ...pf1s.config.skillSpheres[sphere] };
  else throw new Error(`No configuration found for "${sphere}"`);
};
