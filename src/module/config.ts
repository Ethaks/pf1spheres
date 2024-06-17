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

/**
 * A single Sphere's configuration entry.
 */
export interface SphereConfiguration {
  /** The label the sphere is displayed with in the interface. */
  label: string;
  /** The icon associated with the sphere. */
  icon?: string;
  /** A UUID reference to the sphere's {@link JournalEntry}. */
  reference?: string;
}

/** A dictionary of all magic Spheres from Spheres of Power */
export const magicSpheres = {
  alteration: {
    label: "PF1SPHERES.Spheres.Alteration",
    icon: "modules/pf1spheres/assets/icons/spheres/alteration.webp",
  },
  bear: {
    label: "PF1SPHERES.Spheres.Bear",
    icon: "",
  },
  blood: {
    label: "PF1SPHERES.Spheres.Blood",
    icon: "modules/pf1spheres/assets/icons/spheres/blood.webp",
  },
  conjuration: {
    label: "PF1SPHERES.Spheres.Conjuration",
    icon: "modules/pf1spheres/assets/icons/spheres/conjuration.webp",
  },
  creation: {
    label: "PF1SPHERES.Spheres.Creation",
    icon: "modules/pf1spheres/assets/icons/spheres/creation.webp",
  },
  dark: {
    label: "PF1SPHERES.Spheres.Dark",
    icon: "modules/pf1spheres/assets/icons/spheres/dark.webp",
  },
  death: {
    label: "PF1SPHERES.Spheres.Death",
    icon: "modules/pf1spheres/assets/icons/spheres/death.webp",
  },
  destruction: {
    label: "PF1SPHERES.Spheres.Destruction",
    icon: "modules/pf1spheres/assets/icons/spheres/destruction.webp",
  },
  divination: {
    label: "PF1SPHERES.Spheres.Divination",
    icon: "modules/pf1spheres/assets/icons/spheres/divination.webp",
  },
  enhancement: {
    label: "PF1SPHERES.Spheres.Enhancement",
    icon: "modules/pf1spheres/assets/icons/spheres/enhancement.webp",
  },
  fallenFey: {
    label: "PF1SPHERES.Spheres.FallenFey",
    icon: "modules/pf1spheres/assets/icons/spheres/fallen_fey.webp",
  },
  fate: {
    label: "PF1SPHERES.Spheres.Fate",
    icon: "modules/pf1spheres/assets/icons/spheres/fate.webp",
  },
  illusion: {
    label: "PF1SPHERES.Spheres.Illusion",
    icon: "modules/pf1spheres/assets/icons/spheres/illusion.webp",
  },
  life: {
    label: "PF1SPHERES.Spheres.Life",
    icon: "modules/pf1spheres/assets/icons/spheres/life.webp",
  },
  light: {
    label: "PF1SPHERES.Spheres.Light",
    icon: "modules/pf1spheres/assets/icons/spheres/light.webp",
  },
  mana: {
    label: "PF1SPHERES.Spheres.Mana",
    icon: "modules/pf1spheres/assets/icons/spheres/mana.webp",
  },
  mind: {
    label: "PF1SPHERES.Spheres.Mind",
    icon: "modules/pf1spheres/assets/icons/spheres/mind.webp",
  },
  nature: {
    label: "PF1SPHERES.Spheres.Nature",
    icon: "modules/pf1spheres/assets/icons/spheres/nature.webp",
  },
  protection: {
    label: "PF1SPHERES.Spheres.Protection",
    icon: "modules/pf1spheres/assets/icons/spheres/protection.webp",
  },
  telekinesis: {
    label: "PF1SPHERES.Spheres.Telekinesis",
    icon: "modules/pf1spheres/assets/icons/spheres/telekinesis.webp",
  },
  time: {
    label: "PF1SPHERES.Spheres.Time",
    icon: "modules/pf1spheres/assets/icons/spheres/time.webp",
  },
  war: {
    label: "PF1SPHERES.Spheres.War",
    icon: "modules/pf1spheres/assets/icons/spheres/war.webp",
  },
  warp: {
    label: "PF1SPHERES.Spheres.Warp",
    icon: "modules/pf1spheres/assets/icons/spheres/warp.webp",
  },
  weather: {
    label: "PF1SPHERES.Spheres.Weather",
    icon: "modules/pf1spheres/assets/icons/spheres/weather.webp",
  },
} as const satisfies Record<string, SphereConfiguration>;

/** A dictionary of all martial Spheres from Spheres of Might */
export const combatSpheres = {
  alchemy: {
    label: "PF1SPHERES.Spheres.Alchemy",
    icon: "modules/pf1spheres/assets/icons/spheres/alchemy.webp",
  },
  athletics: {
    label: "PF1SPHERES.Spheres.Athletics",
    icon: "modules/pf1spheres/assets/icons/spheres/athletics.webp",
  },
  barrage: {
    label: "PF1SPHERES.Spheres.Barrage",
    icon: "modules/pf1spheres/assets/icons/spheres/barrage.webp",
  },
  barroom: {
    label: "PF1SPHERES.Spheres.Barroom",
    icon: "modules/pf1spheres/assets/icons/spheres/barroom.webp",
  },
  beastmastery: {
    label: "PF1SPHERES.Spheres.Beastmastery",
    icon: "modules/pf1spheres/assets/icons/spheres/beastmastery.webp",
  },
  berserker: {
    label: "PF1SPHERES.Spheres.Berserker",
    icon: "modules/pf1spheres/assets/icons/spheres/berserker.webp",
  },
  boxing: {
    label: "PF1SPHERES.Spheres.Boxing",
    icon: "modules/pf1spheres/assets/icons/spheres/boxing.webp",
  },
  brute: {
    label: "PF1SPHERES.Spheres.Brute",
    icon: "modules/pf1spheres/assets/icons/spheres/brute.webp",
  },
  dualWielding: {
    label: "PF1SPHERES.Spheres.DualWielding",
    icon: "modules/pf1spheres/assets/icons/spheres/dual_wielding.webp",
  },
  duelist: {
    label: "PF1SPHERES.Spheres.Duelist",
    icon: "modules/pf1spheres/assets/icons/spheres/duelist.webp",
  },
  equipment: {
    label: "PF1SPHERES.Spheres.Equipment",
    icon: "modules/pf1spheres/assets/icons/spheres/equipment.webp",
  },
  fencing: {
    label: "PF1SPHERES.Spheres.Fencing",
    icon: "modules/pf1spheres/assets/icons/spheres/fencing.webp",
  },
  gladiator: {
    label: "PF1SPHERES.Spheres.Gladiator",
    icon: "modules/pf1spheres/assets/icons/spheres/gladiator.webp",
  },
  guardian: {
    label: "PF1SPHERES.Spheres.Guardian",
    icon: "modules/pf1spheres/assets/icons/spheres/guardian.webp",
  },
  lancer: {
    label: "PF1SPHERES.Spheres.Lancer",
    icon: "modules/pf1spheres/assets/icons/spheres/lancer.webp",
  },
  leadership: {
    label: "PF1SPHERES.Spheres.Leadership",
    icon: "modules/pf1spheres/assets/icons/spheres/leadership.webp",
  },
  openHand: {
    label: "PF1SPHERES.Spheres.OpenHand",
    icon: "modules/pf1spheres/assets/icons/spheres/open_hand.webp",
  },
  scoundrel: {
    label: "PF1SPHERES.Spheres.Scoundrel",
    icon: "modules/pf1spheres/assets/icons/spheres/scoundrel.webp",
  },
  scout: {
    label: "PF1SPHERES.Spheres.Scout",
    icon: "modules/pf1spheres/assets/icons/spheres/scout.webp",
  },
  shield: {
    label: "PF1SPHERES.Spheres.Shield",
    icon: "modules/pf1spheres/assets/icons/spheres/shield.webp",
  },
  sniper: {
    label: "PF1SPHERES.Spheres.Sniper",
    icon: "modules/pf1spheres/assets/icons/spheres/sniper.webp",
  },
  tech: {
    label: "PF1SPHERES.Spheres.Tech",
    icon: "modules/pf1spheres/assets/icons/spheres/tech.webp",
  },
  trap: {
    label: "PF1SPHERES.Spheres.Trap",
    icon: "modules/pf1spheres/assets/icons/spheres/trap.webp",
  },
  warleader: {
    label: "PF1SPHERES.Spheres.Warleader",
    icon: "modules/pf1spheres/assets/icons/spheres/warleader.webp",
  },
  wrestling: {
    label: "PF1SPHERES.Spheres.Wrestling",
    icon: "modules/pf1spheres/assets/icons/spheres/wrestling.webp",
  },
} as const satisfies Record<string, SphereConfiguration>;

/** A dictionary of all skill Spheres from Spheres of Guile */
export const skillSpheres = {
  artifice: { label: "PF1SPHERES.Spheres.Artifice" },
  bluster: { label: "PF1SPHERES.Spheres.Bluster" },
  bodyControl: { label: "PF1SPHERES.Spheres.BodyControl" },
  communication: { label: "PF1SPHERES.Spheres.Communication" },
  faction: { label: "PF1SPHERES.Spheres.Faction" },
  herbalism: { label: "PF1SPHERES.Spheres.Herbalism" },
  infiltration: { label: "PF1SPHERES.Spheres.Infiltration" },
  investigation: { label: "PF1SPHERES.Spheres.Investigation" },
  navigation: { label: "PF1SPHERES.Spheres.Navigation" },
  performance: { label: "PF1SPHERES.Spheres.Performance" },
  spellhacking: { label: "PF1SPHERES.Spheres.Spellhacking" },
  study: { label: "PF1SPHERES.Spheres.Study" },
  subterfuge: { label: "PF1SPHERES.Spheres.Subterfuge" },
  survivalism: { label: "PF1SPHERES.Spheres.Survivalism" },
  vocation: { label: "PF1SPHERES.Spheres.Vocation" },
} as const satisfies Record<string, SphereConfiguration>;
