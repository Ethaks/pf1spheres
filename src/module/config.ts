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
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.FsQN2kab3f4lmZqG",
  },
  bear: {
    label: "PF1SPHERES.Spheres.Bear",
    icon: "",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.LRmA72mfWcj2awse",
  },
  blood: {
    label: "PF1SPHERES.Spheres.Blood",
    icon: "modules/pf1spheres/assets/icons/spheres/blood.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.DJSaE4axyRk1xfVK",
  },
  conjuration: {
    label: "PF1SPHERES.Spheres.Conjuration",
    icon: "modules/pf1spheres/assets/icons/spheres/conjuration.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.geVXGIQ7iWChlhtg",
  },
  creation: {
    label: "PF1SPHERES.Spheres.Creation",
    icon: "modules/pf1spheres/assets/icons/spheres/creation.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.PjxwuKenqHLpJ3O0",
  },
  dark: {
    label: "PF1SPHERES.Spheres.Dark",
    icon: "modules/pf1spheres/assets/icons/spheres/dark.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.YwwTbo0OsOzDTc3d",
  },
  death: {
    label: "PF1SPHERES.Spheres.Death",
    icon: "modules/pf1spheres/assets/icons/spheres/death.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.cBjQM5mEg1nd0LF3",
  },
  destruction: {
    label: "PF1SPHERES.Spheres.Destruction",
    icon: "modules/pf1spheres/assets/icons/spheres/destruction.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.gmVbVv1G4Yjvctpk",
  },
  divination: {
    label: "PF1SPHERES.Spheres.Divination",
    icon: "modules/pf1spheres/assets/icons/spheres/divination.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.BBVwIMEzgnA6iP7l",
  },
  enhancement: {
    label: "PF1SPHERES.Spheres.Enhancement",
    icon: "modules/pf1spheres/assets/icons/spheres/enhancement.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.5XdUN1vOxJMrbWV5",
  },
  fallenFey: {
    label: "PF1SPHERES.Spheres.FallenFey",
    icon: "modules/pf1spheres/assets/icons/spheres/fallen_fey.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.FTIK9381ihV7qLU0",
  },
  fate: {
    label: "PF1SPHERES.Spheres.Fate",
    icon: "modules/pf1spheres/assets/icons/spheres/fate.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.LedRtYAsnraxePG7",
  },
  illusion: {
    label: "PF1SPHERES.Spheres.Illusion",
    icon: "modules/pf1spheres/assets/icons/spheres/illusion.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.JbgFc8iXgkhwgHSi",
  },
  life: {
    label: "PF1SPHERES.Spheres.Life",
    icon: "modules/pf1spheres/assets/icons/spheres/life.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.pXjwpwgm3JjPVKx0",
  },
  light: {
    label: "PF1SPHERES.Spheres.Light",
    icon: "modules/pf1spheres/assets/icons/spheres/light.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.1H2H1HBLchZnglw1",
  },
  mana: {
    label: "PF1SPHERES.Spheres.Mana",
    icon: "",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.p3jS6YjY1Hsv43yb",
  },
  mind: {
    label: "PF1SPHERES.Spheres.Mind",
    icon: "modules/pf1spheres/assets/icons/spheres/mind.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.JxBr8xrBKsgLSFqf",
  },
  nature: {
    label: "PF1SPHERES.Spheres.Nature",
    icon: "modules/pf1spheres/assets/icons/spheres/nature.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.XUTuc8hE7v4FbZ92",
  },
  protection: {
    label: "PF1SPHERES.Spheres.Protection",
    icon: "modules/pf1spheres/assets/icons/spheres/protection.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.MD1IfBcSxtwPR1uM",
  },
  telekinesis: {
    label: "PF1SPHERES.Spheres.Telekinesis",
    icon: "modules/pf1spheres/assets/icons/spheres/telekinesis.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.mWLpDZzxnYD7PaQP",
  },
  time: {
    label: "PF1SPHERES.Spheres.Time",
    icon: "modules/pf1spheres/assets/icons/spheres/time.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.cF1CHBGl1hQqT533",
  },
  war: {
    label: "PF1SPHERES.Spheres.War",
    icon: "modules/pf1spheres/assets/icons/spheres/war.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.4cnb45aZfioaRB2F",
  },
  warp: {
    label: "PF1SPHERES.Spheres.Warp",
    icon: "modules/pf1spheres/assets/icons/spheres/warp.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.OsquO4qSj5jm8j4F",
  },
  weather: {
    label: "PF1SPHERES.Spheres.Weather",
    icon: "modules/pf1spheres/assets/icons/spheres/weather.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.pcgrw2W6ZhS3GmIA.JournalEntryPage.kIcg8FhTIxYeNcjI",
  },
} as const satisfies Record<string, SphereConfiguration>;

/** A dictionary of all martial Spheres from Spheres of Might */
export const combatSpheres = {
  alchemy: {
    label: "PF1SPHERES.Spheres.Alchemy",
    icon: "modules/pf1spheres/assets/icons/spheres/alchemy.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.2hOiqXBkmyAPtr3u",
  },
  athletics: {
    label: "PF1SPHERES.Spheres.Athletics",
    icon: "modules/pf1spheres/assets/icons/spheres/athletics.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.HU03DEUruhT9DyUR",
  },
  barrage: {
    label: "PF1SPHERES.Spheres.Barrage",
    icon: "modules/pf1spheres/assets/icons/spheres/barrage.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.PCdlQv48li7cm2Ld",
  },
  barroom: {
    label: "PF1SPHERES.Spheres.Barroom",
    icon: "modules/pf1spheres/assets/icons/spheres/barroom.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.TAUFsxlhyUiD0crS",
  },
  beastmastery: {
    label: "PF1SPHERES.Spheres.Beastmastery",
    icon: "modules/pf1spheres/assets/icons/spheres/beastmastery.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.cZpf0zh9Rs2yk14N",
  },
  berserker: {
    label: "PF1SPHERES.Spheres.Berserker",
    icon: "modules/pf1spheres/assets/icons/spheres/berserker.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.48C3CRQ1wJVWohDH",
  },
  boxing: {
    label: "PF1SPHERES.Spheres.Boxing",
    icon: "modules/pf1spheres/assets/icons/spheres/boxing.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.XyjemN7vRFuCKbf7",
  },
  brute: {
    label: "PF1SPHERES.Spheres.Brute",
    icon: "modules/pf1spheres/assets/icons/spheres/brute.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.59v7K0CoRPU2CyaU",
  },
  dualWielding: {
    label: "PF1SPHERES.Spheres.DualWielding",
    icon: "modules/pf1spheres/assets/icons/spheres/dual_wielding.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.rwizDxEVgYVqGsJl",
  },
  duelist: {
    label: "PF1SPHERES.Spheres.Duelist",
    icon: "modules/pf1spheres/assets/icons/spheres/duelist.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.qJhuJKrJRq6WGhEv",
  },
  equipment: {
    label: "PF1SPHERES.Spheres.Equipment",
    icon: "modules/pf1spheres/assets/icons/spheres/equipment.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.OvqUMfEKwrSvRiga",
  },
  fencing: {
    label: "PF1SPHERES.Spheres.Fencing",
    icon: "modules/pf1spheres/assets/icons/spheres/fencing.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.LrXrUWdsl1zw91cj",
  },
  gladiator: {
    label: "PF1SPHERES.Spheres.Gladiator",
    icon: "modules/pf1spheres/assets/icons/spheres/gladiator.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.dGgOjHSwvNV7wTP1",
  },
  guardian: {
    label: "PF1SPHERES.Spheres.Guardian",
    icon: "modules/pf1spheres/assets/icons/spheres/guardian.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.Eghax0GFRMprCazS",
  },
  lancer: {
    label: "PF1SPHERES.Spheres.Lancer",
    icon: "modules/pf1spheres/assets/icons/spheres/lancer.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.R3Pzw2eTyaM7CKFV",
  },
  leadership: {
    label: "PF1SPHERES.Spheres.Leadership",
    icon: "modules/pf1spheres/assets/icons/spheres/leadership.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.DSUb2gnP4cj5PK3V",
  },
  openHand: {
    label: "PF1SPHERES.Spheres.OpenHand",
    icon: "modules/pf1spheres/assets/icons/spheres/open_hand.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.aDl29BHfY1ogutSc",
  },
  scoundrel: {
    label: "PF1SPHERES.Spheres.Scoundrel",
    icon: "modules/pf1spheres/assets/icons/spheres/scoundrel.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.SJ84dI1vzZsyCd2M",
  },
  scout: {
    label: "PF1SPHERES.Spheres.Scout",
    icon: "modules/pf1spheres/assets/icons/spheres/scout.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.aNEAY2YPgEgpwvup",
  },
  shield: {
    label: "PF1SPHERES.Spheres.Shield",
    icon: "modules/pf1spheres/assets/icons/spheres/shield.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.dH2aeRBVjs9uWpwh",
  },
  sniper: {
    label: "PF1SPHERES.Spheres.Sniper",
    icon: "modules/pf1spheres/assets/icons/spheres/sniper.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.DWov2jIaILv0Bt0T",
  },
  tech: {
    label: "PF1SPHERES.Spheres.Tech",
    icon: "modules/pf1spheres/assets/icons/spheres/tech.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.GNiLIdukALXr4ska",
  },
  trap: {
    label: "PF1SPHERES.Spheres.Trap",
    icon: "modules/pf1spheres/assets/icons/spheres/trap.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.GNiLIdukALXr4ska",
  },
  warleader: {
    label: "PF1SPHERES.Spheres.Warleader",
    icon: "modules/pf1spheres/assets/icons/spheres/warleader.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.1Y6shgQvz37Fa0nR",
  },
  wrestling: {
    label: "PF1SPHERES.Spheres.Wrestling",
    icon: "modules/pf1spheres/assets/icons/spheres/wrestling.webp",
    reference:
      "Compendium.pf1spheres.rules.JournalEntry.6ofS12a3d99UJ840.JournalEntryPage.LInmZEtVFbGnHyPV",
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
