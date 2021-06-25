import { PF1S, PF1CONFIG } from "./config";

export type PF1ItemData = PF1FeatData | PF1ClassData;

interface PF1FeatData extends Item.Data {
  type: "feat";
  data: {
    featType:
      | "feat"
      | "classFeat"
      | "trait"
      | "racial"
      | "misc"
      | "template"
      | keyof typeof PF1CONFIG.featTypes;
  };
  flags: {
    pf1spheres: {
      sphere: Sphere;
    };
  };
}

export interface PF1ClassData extends Item.Data {
  type: "class";
  data: {
    level: number;
  };
  flags: {
    pf1spheres: {
      casterProgression: keyof typeof PF1S.progression | "";
    };
  };
}

export type Sphere = CombatSphere | MagicSphere;

export type CombatSphere = keyof typeof PF1S.combatSpheres;
export type MagicSphere = keyof typeof PF1S.magicSpheres;

export type SphereChangeTarget = keyof typeof PF1CONFIG.buffTargets | SphereCLChangeTarget;

export type SphereCLChangeTarget = `spherecl${Capitalize<MagicSphere>}`;

/************************/
/*   PF1 CONFIG BELOW   */
/************************/

/*
 * Item Types from the PF1 system
 */
export type ItemType =
  | "weapon"
  | "equipment"
  | "consumable"
  | "loot"
  | "class"
  | "spell"
  | "feat"
  | "buff"
  | "attack"
  | "race"
  | "container";

/*
 * Bonus Modifier types from the PF1 system, used for Changes
 */
export type BonusModifier =
  | "untyped"
  | "untypedPerm"
  | "base"
  | "enh"
  | "dodge"
  | "inherent"
  | "deflection"
  | "morale"
  | "luck"
  | "sacred"
  | "insight"
  | "resist"
  | "profane"
  | "trait"
  | "racial"
  | "size"
  | "competence"
  | "circumstance"
  | "alchemical"
  | "penalty"
  | keyof typeof PF1CONFIG.bonusModifiers;

export interface ItemChange extends ItemChangeGetters {
  data: ItemChangeData;
  parent: ActorPF;
}

export type ItemChangeGetters = {
  [Property in keyof ItemChangeData]: ItemChangeData[Property];
};

export interface ItemChangeData {
  _id: string;
  formula: string;
  operator: "add" | "set" | "script";
  subTarget: SphereChangeTarget;
  modifier: BonusModifier;
}

// TODO: This type can be refined a bit even without typing the PF1 system
export type RollData = {
  [key: string]: string | RollData;
};
