/**
 * Runtime config object for the PF1 Spheres module
 */
export const PF1S = {
  /**
   * The different rates at which a class advances caster or practicioner levels.
   */
  progression: {
    low: "PF1SPHERES.LowCaster",
    mid: "PF1SPHERES.MidCaster",
    high: "PF1SPHERES.HighCaster",
  },

  /**
   * Formulae for {@link progression}
   */
  progressionFormula: {
    low: 0.5,
    mid: 0.75,
    high: 1,
  },

  changeCategories: {
    sphereValues: "PF1SPHERES.SphereValues",
  },

  magicSpheres: {
    alteration: "PF1SPHERES.Spheres.Alteration",
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
  },

  combatSpheres: {
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
  },
} as const;

/**
 * Config values to be merged into the PF1 system config
 */
export const PF1CONFIG = {
  featTypes: {
    combatTalent: "PF1SPHERES.CombatTalent",
    magicTalent: "PF1SPHERES.MagicTalent",
  },
  featTypesPlurals: {
    combatTalent: "PF1SPHERES.CombatTalentPlural",
    magicTalent: "PF1SPHERES.MagicTalentPlural",
  },
  buffTargetCategories: {
    sphereValues: {
      label: "PF1SPHERES.SphereValues",
    },
    sphereCasterLevel: {
      label: "PF1SPHERES.SphereCasterLevelPlural",
    },
  },
  buffTargets: {
    spherecl: {
      label: "PF1SPHERES.CasterLevel",
      category: "sphereValues",
    },
    msb: {
      label: "PF1SPHERES.MSB",
      category: "sphereValues",
    },
    msd: {
      label: "PF1SPHERES.MSD",
      category: "sphereValues",
    },
  },
  bonusModifiers: {
    sphereCLCap: "PF1SPHERES.SphereCLCapped",
  },
} as const;
