/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

export {};

declare global {
  interface DocumentClassConfig {
    ChatMessage: typeof ChatMessagePF;
  }
  interface FlagConfig {
    ChatMessage: {
      pf1: PF1ChatMessageFlags;
    };
  }
}

interface PF1ChatMessageFlags {
  subject: { core: "concentration"; spellbook: string } | { pf1spheres: "msb" };
}

declare class ChatMessagePF extends ChatMessage {}
