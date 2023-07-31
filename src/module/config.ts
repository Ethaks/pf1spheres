/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
/**
 * Configuration for the PF1 Spheres module.
 *
 * This module provides configuration data, usually in the form of `{ [enumKey: string]: string }` objects,
 * where the keys serve as enum and the values are the localized display names.
 * Localisation values are expected to be mutated from their translation key form to their localized form
 * in the `i18init` hook.
 *
 * This configuration may be adjusted at runtime to influence the behaviour of the module.
 * It is available as `pf1s.config` in the global scope, as well as through `CONFIG.PF1S`.
 *
 * @module
 */

/**
 * The different rates at which a class advances caster or practicioner levels.
 */
export const progression = {
  low: "PF1SPHERES.LowCaster",
  mid: "PF1SPHERES.MidCaster",
  high: "PF1SPHERES.HighCaster",
} as const;

/**
 * Formulae for {@link pf1s.config.progression}
 */
export const progressionFormula = {
  low: 0.5,
  mid: 0.75,
  high: 1,
} as const;

/** A dictionary of all magic Spheres from Spheres of Power */
export const magicSpheres = {
  alteration: "PF1SPHERES.Spheres.Alteration",
  bear: "PF1SPHERES.Spheres.Bear",
  blood: "PF1SPHERES.Spheres.Blood",
  conjuration: "PF1SPHERES.Spheres.Conjuration",
  creation: "PF1SPHERES.Spheres.Creation",
  dark: "PF1SPHERES.Spheres.Dark",
  death: "PF1SPHERES.Spheres.Death",
  destruction: "PF1SPHERES.Spheres.Destruction",
  divination: "PF1SPHERES.Spheres.Divination",
  enhancement: "PF1SPHERES.Spheres.Enhancement",
  fallenFey: "PF1SPHERES.Spheres.FallenFey",
  fate: "PF1SPHERES.Spheres.Fate",
  illusion: "PF1SPHERES.Spheres.Illusion",
  life: "PF1SPHERES.Spheres.Life",
  light: "PF1SPHERES.Spheres.Light",
  mana: "PF1SPHERES.Spheres.Mana",
  mind: "PF1SPHERES.Spheres.Mind",
  nature: "PF1SPHERES.Spheres.Nature",
  protection: "PF1SPHERES.Spheres.Protection",
  telekinesis: "PF1SPHERES.Spheres.Telekinesis",
  time: "PF1SPHERES.Spheres.Time",
  war: "PF1SPHERES.Spheres.War",
  warp: "PF1SPHERES.Spheres.Warp",
  weather: "PF1SPHERES.Spheres.Weather",
} as const;

/** A dictionary of all martial Spheres from Spheres of Might */
export const combatSpheres = {
  alchemy: "PF1SPHERES.Spheres.Alchemy",
  athletics: "PF1SPHERES.Spheres.Athletics",
  barrage: "PF1SPHERES.Spheres.Barrage",
  barroom: "PF1SPHERES.Spheres.Barroom",
  beastmastery: "PF1SPHERES.Spheres.Beastmastery",
  berserker: "PF1SPHERES.Spheres.Berserker",
  boxing: "PF1SPHERES.Spheres.Boxing",
  brute: "PF1SPHERES.Spheres.Brute",
  dualWielding: "PF1SPHERES.Spheres.DualWielding",
  duelist: "PF1SPHERES.Spheres.Duelist",
  equipment: "PF1SPHERES.Spheres.Equipment",
  fencing: "PF1SPHERES.Spheres.Fencing",
  gladiator: "PF1SPHERES.Spheres.Gladiator",
  guardian: "PF1SPHERES.Spheres.Guardian",
  lancer: "PF1SPHERES.Spheres.Lancer",
  leadership: "PF1SPHERES.Spheres.Leadership",
  openHand: "PF1SPHERES.Spheres.OpenHand",
  scoundrel: "PF1SPHERES.Spheres.Scoundrel",
  scout: "PF1SPHERES.Spheres.Scout",
  shield: "PF1SPHERES.Spheres.Shield",
  sniper: "PF1SPHERES.Spheres.Sniper",
  tech: "PF1SPHERES.Spheres.Tech",
  trap: "PF1SPHERES.Spheres.Trap",
  warleader: "PF1SPHERES.Spheres.Warleader",
  wrestling: "PF1SPHERES.Spheres.Wrestling",
} as const;

/** A dictionary of all skill Spheres from Spheres of Guile */
export const skillSpheres = {
  artifice: "PF1SPHERES.Spheres.Artifice",
  bluster: "PF1SPHERES.Spheres.Bluster",
  bodyControl: "PF1SPHERES.Spheres.BodyControl",
  communication: "PF1SPHERES.Spheres.Communication",
  faction: "PF1SPHERES.Spheres.Faction",
  herbalism: "PF1SPHERES.Spheres.Herbalism",
  infiltration: "PF1SPHERES.Spheres.Infiltration",
  investigation: "PF1SPHERES.Spheres.Investigation",
  navigation: "PF1SPHERES.Spheres.Navigation",
  performance: "PF1SPHERES.Spheres.Performance",
  spellhacking: "PF1SPHERES.Spheres.Spellhacking",
  study: "PF1SPHERES.Spheres.Study",
  subterfuge: "PF1SPHERES.Spheres.Subterfuge",
  survivalism: "PF1SPHERES.Spheres.Survivalism",
  vocation: "PF1SPHERES.Spheres.Vocation",
} as const;

/** A dictionary of spheres and their respective icon */
export const sphereIcons = {
  alteration: "modules/pf1spheres/assets/icons/spheres/alteration.webp",
  blood: "modules/pf1spheres/assets/icons/spheres/blood.webp",
  conjuration: "modules/pf1spheres/assets/icons/spheres/conjuration.webp",
  creation: "modules/pf1spheres/assets/icons/spheres/creation.webp",
  dark: "modules/pf1spheres/assets/icons/spheres/dark.webp",
  death: "modules/pf1spheres/assets/icons/spheres/death.webp",
  destruction: "modules/pf1spheres/assets/icons/spheres/destruction.webp",
  divination: "modules/pf1spheres/assets/icons/spheres/divination.webp",
  enhancement: "modules/pf1spheres/assets/icons/spheres/enhancement.webp",
  fallenFey: "modules/pf1spheres/assets/icons/spheres/fallen_fey.webp",
  fate: "modules/pf1spheres/assets/icons/spheres/fate.webp",
  illusion: "modules/pf1spheres/assets/icons/spheres/illusion.webp",
  life: "modules/pf1spheres/assets/icons/spheres/life.webp",
  light: "modules/pf1spheres/assets/icons/spheres/light.webp",
  mind: "modules/pf1spheres/assets/icons/spheres/mind.webp",
  nature: "modules/pf1spheres/assets/icons/spheres/nature.webp",
  protection: "modules/pf1spheres/assets/icons/spheres/protection.webp",
  telekinesis: "modules/pf1spheres/assets/icons/spheres/telekinesis.webp",
  time: "modules/pf1spheres/assets/icons/spheres/time.webp",
  war: "modules/pf1spheres/assets/icons/spheres/war.webp",
  warp: "modules/pf1spheres/assets/icons/spheres/warp.webp",
  weather: "modules/pf1spheres/assets/icons/spheres/weather.webp",

  alchemy: "modules/pf1spheres/assets/icons/spheres/alchemy.webp",
  athletics: "modules/pf1spheres/assets/icons/spheres/athletics.webp",
  barrage: "modules/pf1spheres/assets/icons/spheres/barrage.webp",
  barroom: "modules/pf1spheres/assets/icons/spheres/barroom.webp",
  beastmastery: "modules/pf1spheres/assets/icons/spheres/beastmastery.webp",
  berserker: "modules/pf1spheres/assets/icons/spheres/berserker.webp",
  boxing: "modules/pf1spheres/assets/icons/spheres/boxing.webp",
  brute: "modules/pf1spheres/assets/icons/spheres/brute.webp",
  dualWielding: "modules/pf1spheres/assets/icons/spheres/dual_wielding.webp",
  duelist: "modules/pf1spheres/assets/icons/spheres/duelist.webp",
  equipment: "modules/pf1spheres/assets/icons/spheres/equipment.webp",
  fencing: "modules/pf1spheres/assets/icons/spheres/fencing.webp",
  gladiator: "modules/pf1spheres/assets/icons/spheres/gladiator.webp",
  guardian: "modules/pf1spheres/assets/icons/spheres/guardian.webp",
  lancer: "modules/pf1spheres/assets/icons/spheres/lancer.webp",
  leadership: "modules/pf1spheres/assets/icons/spheres/leadership.webp",
  openHand: "modules/pf1spheres/assets/icons/spheres/open_hand.webp",
  scoundrel: "modules/pf1spheres/assets/icons/spheres/scoundrel.webp",
  scout: "modules/pf1spheres/assets/icons/spheres/scout.webp",
  shield: "modules/pf1spheres/assets/icons/spheres/shield.webp",
  sniper: "modules/pf1spheres/assets/icons/spheres/sniper.webp",
  tech: "modules/pf1spheres/assets/icons/spheres/tech.webp",
  trap: "modules/pf1spheres/assets/icons/spheres/trap.webp",
  warleader: "modules/pf1spheres/assets/icons/spheres/warleader.webp",
  wrestling: "modules/pf1spheres/assets/icons/spheres/wrestling.webp",
} as const;
