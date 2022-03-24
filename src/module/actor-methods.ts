/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorPF } from "./actor-data";
import { getGame, localize } from "./util";

// TODO: Clean up interfaces

export const getActorMethods = (actor: ActorPF): ActorMethods => ({
  rollSpheresAttribute: rollSpheresAttribute(actor),
});

const rollSpheresAttribute =
  (actor: ActorPF) =>
  (attribute: RollAttribute, options: RollOptions = {}) => {
    const parts = actor.sourceDetails[`data.spheres.${attribute}.total` as const]
      .map((info) => `${info.value}[${info.name}]`)
      .join("+");

    return getGame().pf1.DicePF.d20Roll({
      event: options.event ?? new MouseEvent(""),
      fastForward: options.skipDialog === true,
      parts,
      dice: options.dice,
      data: actor.getRollData(),
      title: options.label ?? localize(`Checks.${attribute}`),
      speaker: ChatMessage.getSpeaker({ actor }),
      chatTemplate: "systems/pf1/templates/chat/roll-ext.hbs",
    });
  };

type RollAttribute = "cl" | "msb";
interface RollOptions {
  skipDialog?: boolean;
  event?: JQuery.ClickEvent;
  dice?: string;
  label?: string;
}

interface ActorMethods {
  rollSpheresAttribute: (attribute: RollAttribute, options: RollOptions) => Roll | ChatMessage;
}
