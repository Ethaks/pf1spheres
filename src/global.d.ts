import { PF1S } from "./module/config";
import { BonusModifier, Change } from "./module/item-data";

export {};

declare global {
  /**
   * PF1 Spheres module type definition
   */
  interface PF1SModule extends Game.Module {
    api: {
      config: typeof PF1S;
    };
  }

  interface CONFIG {
    PF1: {
      buffTargets: Record<string, { label: string; category: string }>;
      stackingBonusModifiers?: BonusModifier[];
    };
  }

  interface PFItem extends Item {
    changes: Collection<Change>;
  }

  /**
   * TODO: Remove this with 0.8 types!
   */
  let foundry: {
    utils: {
      deepClone<T>(o: T): T;
    };
  };
}
