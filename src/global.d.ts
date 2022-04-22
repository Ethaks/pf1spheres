/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import type { ActorDataPath } from "./module/actor-data";
import type { ActorSheetPF } from "./module/actor-sheet";
import type { PF1CONFIG_EXTRA, PF1CONFIG, PF1S } from "./module/config";
import type { ItemChange, RollData, SourceEntry, SourceInfo } from "./module/item-data";
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
      skipConfirmPrompt: boolean;
    };
  }

  namespace ClientSettings {
    interface Values {
      // PF1 system settings
      "pf1.useFractionalBaseBonuses": boolean;
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
  dice?: string | undefined;
  data?: RollData | ActorDataProperties["data"];
  title?: string;
  speaker?: ChatSpeakerDataProperties;
  chatTemplate?: string;
}
