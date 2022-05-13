/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorPF } from "./actor-data";
import type { DicePFD20RollOptions } from "./dice-data";
import type { ItemPF } from "./item-data";
import { getGame, localize } from "./util";

/** Various functions working like methods for a single actor */
export interface SpheresActorMethods {
  rollMsb: (
    options?: DicePFD20RollOptions & RollMethodOptions
  ) => Promise<ChatMessage | Roll> | void;
  getMsbNotes: () => ContextNoteObject[];
}

/** Returns an object containing method-like functions scoped to work with an actor */
export const getActorMethods = (actor: ActorPF): SpheresActorMethods => ({
  rollMsb: rollMsb(actor),
  getMsbNotes: getMsbNotes(actor),
});

/** Returns a function that rolls a Magic Skill Check for an actor */
const rollMsb =
  (actor: ActorPF) =>
  /**
   * Rolls a Magic Skill Check
   *
   * @param options - Additional options affecting the roll/chat message creation
   */
  (options: DicePFD20RollOptions & RollMethodOptions = {}): Promise<ChatMessage | Roll> | void => {
    if (!actor.isOwner) {
      const msg = localize("PF1.ErrorNoActorPermissionAlt", { "0": actor.name });
      console.warn(msg);
      return ui.notifications?.warn(msg);
    }

    const allowed = Hooks.call("actorRoll", actor, "msb", null, options);
    if (allowed === false) return;

    const parts = actor.sourceDetails["data.spheres.msb.total"]
      .map((info) => `${info.value}[${info.name}]`)
      .join("+");

    const rollData = actor.getRollData();
    const noteObjects = getMsbNotes(actor)();
    const notes = actor.formatContextNotes(noteObjects, rollData);
    const props = notes.length > 0 ? [{ header: localize("PF1.Notes"), value: notes }] : [];

    return getGame().pf1.DicePF.d20Roll({
      event: options.event ?? new MouseEvent(""),
      fastForward: getGame().pf1.skipConfirmPrompt,
      parts,
      subject: { pf1spheres: "msb" },
      dice: options.dice,
      data: actor.getRollData(),
      title: options.label ?? localize(`Checks.MSB`),
      speaker: ChatMessage.getSpeaker({ actor }),
      chatTemplate: "systems/pf1/templates/chat/roll-ext.hbs",
      chatTemplateData: { hasProperties: props.length > 0, properties: props },
      chatMessage: options.chatMessage ?? true,
      noSound: options.noSound ?? false,
      originalOptions: options,
    });
  };

/** Returns a function that returns an actor's Magic Skill Check Context Notes */
const getMsbNotes =
  (actor: ActorPF) =>
  /** Returns an array of objects containing an item and its Magic Skill Check Context Notes, if any */
  (): ContextNoteObject[] =>
    actor.allNotes.map((no) => ({
      item: no.item,
      notes: no.notes.filter((n) => n.subTarget === "msb").map((n) => n.text),
    }));

interface ContextNoteObject {
  item: ItemPF;
  notes: string[];
}

interface RollMethodOptions {
  chatMessage?: boolean;
  noSound?: boolean;
  dice?: string;
}
