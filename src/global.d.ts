import { PF1ActorData } from "./module/actor-data";
import { PF1S } from "./module/config";
import {
  BonusModifier,
  ItemChangeData,
  PF1ItemData,
  RollData,
  SourceDetails,
  SourceEntry,
  SourceInfo,
} from "./module/item-data";

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

  class ActorPF extends Actor {
    items: Collection<ItemPF>;
    data: PF1ActorData;
    sourceDetails: SourceDetails;
    sourceInfo: SourceInfo;
  }

  class ItemPF extends Item {
    data: PF1ItemData;
    isActive: boolean;
    changes: Collection<ItemChange>;
  }

  class RollPF extends Roll {
    static safeRoll(formula: string, rollData: RollData): RollPF;
    err?: Error;
  }

  interface Game {
    pf1: {
      documentComponents: {
        ItemChange: typeof ItemChange;
      };
      utils: {
        getSourceInfo(
          sourceInfo: SourceInfo,
          key: keyof typeof sourceInfo
        ): { positive: SourceEntry[]; negative: SourceEntry[] };
      };
    };
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

export declare class ItemChange {
  data: ItemChangeData;
  parent: ActorPF;
  static create(data: Partial<ItemChangeData>): ItemChange;
}
