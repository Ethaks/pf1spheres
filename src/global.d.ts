import { ActorDataPath, PF1ActorDataProperties, PF1ActorDataSource } from "./module/actor-data";
import { PF1S } from "./module/config";
import {
  BonusModifier,
  CasterProgression,
  ItemChange,
  ItemPF,
  PF1ItemDataProperties,
  PF1ItemDataSource,
  RollData,
  SourceEntry,
  SourceInfo,
  Sphere,
} from "./module/item-data";

export {};

declare global {
  interface CONFIG {
    PF1: {
      buffTargets: Record<string, { label: string; category: string }>;
      stackingBonusModifiers?: BonusModifier[];
    };
    PF1SPHERES: typeof PF1S;
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

  interface DocumentClassConfig {
    Item: typeof ItemPF;
  }

  /** Source Data configuration for the PF1 system */
  interface SourceConfig {
    Actor: PF1ActorDataSource;
    Item: PF1ItemDataSource;
  }

  interface DataConfig {
    Actor: PF1ActorDataProperties;
    Item: PF1ItemDataProperties;
  }

  interface FlagConfig {
    Item: {
      pf1spheres: {
        sphere: Sphere;
        casterProgression: CasterProgression;
      };
    };
  }

  namespace ClientSettings {
    interface Values {
      "pf1.useFractionalBaseBonuses": boolean;
    }
  }

  namespace Game {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    interface ModuleData<T> {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      api?: Record<string, any>;
    }
  }

  // This changes the return type of Object.keys – handle with care
  interface ObjectConstructor {
    keys<T>(o: T): ObjectKeys<T>;
  }
}

/* eslint-disable-next-line @typescript-eslint/ban-types */
type ObjectKeys<T> = T extends object
  ? (keyof T)[]
  : T extends number
  ? []
  : /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  T extends Array<any> | string
  ? string[]
  : never;
