/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataPath } from "./module/actor-data";
import type { ActorSheetPF } from "./module/actor-sheet";
import type { PF1CONFIG_EXTRA, PF1CONFIG, PF1S } from "./module/config";
import type { DicePF } from "./module/dice-data";
import type { ItemChange, RollData, SourceEntry, SourceInfo, Sphere } from "./module/item-data";
import type { FromEntriesWithReadOnly } from "./module/ts-util";

export {};

declare global {
  interface CONFIG {
    PF1: PF1CONFIG & typeof PF1CONFIG_EXTRA;
    PF1SPHERES: typeof PF1S;
  }

  class RollPF extends Roll {
    static safeRoll(formula: string, rollData: RollData): RollPF;
    err?: Error;
  }

  const pf1: {
    documents: {
      actor: {
        changes: {
          getSourceInfo(
            sourceInfo: SourceInfo,
            key: ActorDataPath
          ): { positive: SourceEntry[]; negative: SourceEntry[] };
        };
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
      DicePF: typeof DicePF;
    };
    skipConfirmPrompt: boolean;
  };

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
