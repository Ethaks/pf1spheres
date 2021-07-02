import { ActorDataPath } from "./module/actor-data";
import { PF1S } from "./module/config";
import { BonusModifier, ItemChange, RollData, SourceEntry, SourceInfo } from "./module/item-data";
import { PropPath } from "./module/util";

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
          key: ActorDataPath
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
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      setProperty<T>(o: T, key: PropPath<T>, value: any): boolean;
    };
  };
}
