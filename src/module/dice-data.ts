/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import type { ChatSpeakerDataProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData";
import type { RollData } from "./item-data";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export declare class DicePF {
  static d20Roll(options: DicePFD20RollOptions): Promise<ChatMessage | Roll>;
}

export interface DicePFD20RollOptions {
  event?: JQuery.ClickEvent | Event;
  fastForward?: boolean;
  parts?: string | string[];
  dice?: string | undefined;
  data?: RollData | ActorDataProperties["data"];
  title?: string;
  speaker?: ChatSpeakerDataProperties;
  chatTemplate?: string;
  chatTemplateData?: { hasProperties: boolean; properties: { header: string; value: string[] }[] };
  label?: string;
  chatMessage?: boolean;
  noSound?: boolean;
  originalOptions?: DicePFD20RollOptions;
  subject?: Record<string, string>;
}
