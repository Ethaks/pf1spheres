import type { ActorDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import type {
  ActorDataPath,
  PF1ActorDataProperties,
  PF1ActorDataSource,
} from "./module/actor-data";
import type { ActorSheetPF } from "./module/actor-sheet";
import type { PF1S } from "./module/config";
import type {
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
import type { FromEntriesWithReadOnly } from "./module/util";

export {};

declare global {
  interface CONFIG {
    PF1: {
      buffTargets: Record<string, { label: string; category: string }>;
      stackingBonusModifiers?: BonusModifier[];
      armorProficiencies: Record<"lgt" | "med" | "hvy" | "shl" | "twr", string>;
      weaponProficiencies: Record<"sim" | "mar", string>;
      skills: Record<string, string>;
    };
    PF1SPHERES: typeof PF1S;
  }

  class RollPF extends Roll {
    static safeRoll(formula: string, rollData: RollData): RollPF;
    err?: Error;
  }

  interface Game {
    pf1: {
      DicePF: typeof DicePF;
      applications: {
        ActorSheetPF: typeof ActorSheetPF;
      };
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
      pf1spheres?: {
        sphere?: Sphere;
        casterProgression?: CasterProgression;
      };
    };
  }

  namespace ClientSettings {
    interface Values {
      // PF1 system settings
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
    fromEntries<T>(obj: T): FromEntriesWithReadOnly<T>;
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

declare class DicePF {
  static d20Roll(options: DicePFD20RollOptions): ChatMessage | Roll;
}

interface DicePFD20RollOptions {
  event?: JQuery.ClickEvent | Event;
  fastForward?: boolean;
  parts?: string | string[];
  dice?: string;
  data?: RollData | ActorDataProperties["data"];
  title?: string;
  speaker?: ChatSpeakerDataProperties;
  chatTemplate?: string;
}
