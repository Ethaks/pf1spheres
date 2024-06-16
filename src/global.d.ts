/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataPath } from "./module/actor-data";
import type { ActorSheetPF } from "./module/actor-sheet";
import type { PF1CONFIG_EXTRA, PF1CONFIG } from "./module/config-extra";
import type * as PF1S from "./module/config";
import type { ItemChange, RollData, SourceEntry, SourceInfo, Sphere } from "./module/item-data";
import type { FromEntriesWithReadOnly } from "./module/ts-util";
import type { D20ActorRollOptions } from "./pf1-types/d20roll";

export {};

declare global {
  namespace foundry {
    namespace utils {
      const logCompatibilityWarning: (
        message: string,
        options: { from: string; until: string },
      ) => void;
    }
  }
  interface CONFIG {
    PF1: PF1CONFIG & typeof PF1CONFIG_EXTRA;
    PF1SPHERES: typeof PF1S;
  }

  class RollPF extends Roll {
    static safeRoll(formula: string, rollData: RollData): RollPF;
    err?: Error;
  }

  const pf1: {
    config: typeof CONFIG.PF1;
    documents: {
      actor: {
        changes: {
          getSourceInfo(
            sourceInfo: SourceInfo,
            key: ActorDataPath,
          ): { positive: SourceEntry[]; negative: SourceEntry[] };
        };
      };
      settings: {
        getSkipActionPrompt: () => boolean;
      };
    };
    applications: {
      actor: {
        ActorSheetPF: typeof ActorSheetPF;
      };
    };
    components: {
      ItemChange: typeof ItemChange;
    };
    dice: {
      d20Roll: (
        options: D20ActorRollOptions,
      ) => Promise<ChatMessage | ChatMessage["data"]["_source"] | void>;
    };
    registry: {
      Registry: typeof Registry;
    };
  };

  declare class Registry extends Collection<unknown> {
    register(namespace: string, id: string, data: Record<string, unknown>): void;
  }

  namespace ClientSettings {
    interface Values {
      // PF1 system settings
      "pf1.useFractionalBaseBonuses": boolean;
    }
  }

  interface FlagConfig {
    JournalEntry: { pf1spheres?: { sphere?: Sphere } };
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
