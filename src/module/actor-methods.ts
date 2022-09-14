/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorPF } from "./actor-data";
import type { ItemPF } from "./item-data";
import { localize } from "./util";
import type { ActorRollOptions } from "../pf1-types/d20roll";
import type { ChatMessageDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Hooks {
    interface StaticCallbacks {
      /**
       * A hook event fired by the module when an actor rolls a Magic Skill Check.
       *
       * @group Actor Rolls
       * @remarks Called by {@link Hooks.call}
       * @param actor - The actor rolling the Magic Skill Check
       * @param options - The options used to roll the Magic Skill Check
       * @returns Explicitly return `false` to prevent the roll from being executed
       */
      pf1spheresPreActorRollMsb(actor: ActorPF, options: ActorRollOptions): boolean;

      /**
       * A hook event fired by the module after an actor rolled a Magic Skill Check.
       *
       * @group Actor Rolls
       * @remarks Called by {@link Hooks.callAll}
       * @param actor - The actor that rolled the Magic Skill Check
       * @param result - The resulting {@link ChatMessage} or it source data
       */
      pf1spheresActorRollMsb(
        actor: ActorPF,
        result: ChatMessage | ChatMessageDataSource | void
      ): void;

      /**
       * A hook event fired by the module when an actor rolls a Spheres Concentration check.
       *
       * @group Actor Rolls
       * @remarks Called by {@link Hooks.call}
       * @param actor - The actor rolling the Spheres Concentration check
       * @param options - The options used to roll the Spheres Concentration check
       * @returns Explicitly return `false` to prevent the roll from being executed
       */
      pf1spheresPreActorRollConcentration(actor: ActorPF, options: ActorRollOptions): boolean;

      /**
       * A hook event fired by the module after an actor rolled a Spheres Concentration check.
       *
       * @group Actor Rolls
       * @remarks Called by {@link Hooks.callAll}
       * @param actor - The actor that rolled the Spheres Concentration check
       * @param result - The resulting {@link ChatMessage} or it source data
       */
      pf1spheresActorRollConcentration(
        actor: ActorPF,
        result: ChatMessage | ChatMessageDataSource | void
      ): void;
    }
  }
}

type ActorRollMethod = (
  options?: ActorRollOptions
) => Promise<ChatMessage | ChatMessage["data"]["_source"] | void>;

/** Returns an object containing method-like functions scoped to work with an actor */
export const getActorMethods = (actor: ActorPF) => ({
  /** Rolls a Magic Skill check */
  rollMsb: rollMsb(actor),
  /** Rolls a Concentration check */
  rollConcentration: rollConcentration(actor),
  /** Returns an array of objects containing an item and its Magic Skill Check Context Notes, if any */
  getMsbNotes: getMsbNotes(actor),
  /** Returns an array of objects containing an item and its Magic Skill/Concentration Check Context Notes, if any */
  getConcentrationNotes: getConcentrationNotes(actor),
});

/** Returns a function that rolls a Magic Skill Check for an actor */
const rollMsb =
  (actor: ActorPF): ActorRollMethod =>
  /**
   * Rolls a Magic Skill Check
   *
   * @param options - Additional options affecting the roll/chat message creation
   */
  async (options = {}) => {
    if (!actor.isOwner) {
      const msg = localize("PF1.ErrorNoActorPermissionAlt", { "0": actor.name });
      console.warn(msg);
      return ui.notifications?.warn(msg);
    }

    const parts = actor.sourceDetails["system.spheres.msb.total"]
      .filter((info) => !(info.name in CONFIG.PF1.bonusModifiers)) // TODO: Remove when Changes can opt out of sourceInfo
      .map((info) => `${info.value}[${info.name}]`);

    const rollData = actor.getRollData();
    const noteObjects = getMsbNotes(actor)();
    const notes = actor.formatContextNotes(noteObjects, rollData);
    const props = notes.length > 0 ? [{ header: localize("PF1.Notes"), value: notes }] : [];

    const rollOptions = {
      ...options,
      parts,
      subject: { pf1spheres: "msb" },
      rollData: actor.getRollData(),
      flavor: localize(`Checks.MSB`),
      speaker: ChatMessage.getSpeaker({ actor }),
      chatTemplateData: { hasProperties: props.length > 0, properties: props },
    };
    if (Hooks.call("pf1spheresPreActorRollMsb", actor, rollOptions) === false) return;
    const result = await pf1.dice.d20Roll(rollOptions);
    Hooks.callAll("pf1spheresActorRollMsb", actor, result);
    return result;
  };

/** Returns a function that rolls a Concentration check for an actor */
const rollConcentration =
  (actor: ActorPF): ActorRollMethod =>
  /**
   * Rolls a Concentration check
   *
   * @param options - Additional options affecting the roll/chat message creation
   */
  async (options = {}) => {
    if (!actor.isOwner) {
      const msg = localize("PF1.ErrorNoActorPermissionAlt", { "0": actor.name });
      console.warn(msg);
      return ui.notifications?.warn(msg);
    }

    const parts = actor.sourceDetails["system.spheres.concentration.total"]
      .filter((info) => !(info.name in CONFIG.PF1.bonusModifiers)) // TODO: Remove when Changes can opt out of sourceInfo
      .map((info) => `${info.value}[${info.name}]`);

    const rollData = actor.getRollData();
    const noteObjects = getConcentrationNotes(actor)();
    const notes = actor.formatContextNotes(noteObjects, rollData);
    const props = notes.length > 0 ? [{ header: localize("PF1.Notes"), value: notes }] : [];

    const rollOptions = {
      ...options,
      parts,
      subject: { pf1spheres: "concentration" },
      rollData: actor.getRollData(),
      flavor: localize("PF1.ConcentrationCheck"),
      speaker: ChatMessage.getSpeaker({ actor }),
      chatTemplateData: { hasProperties: props.length > 0, properties: props },
    };
    if (Hooks.call("pf1spheresPreActorRollConcentration", actor, rollOptions) === false) return;
    const result = await pf1.dice.d20Roll(rollOptions);
    Hooks.callAll("pf1spheresActorRollConcentration", actor, result);
    return result;
  };
/** Returns a function that returns an actor's Magic Skill Check Context Notes */
const getMsbNotes =
  (actor: ActorPF) =>
  /** Returns an array of objects containing an item and its Magic Skill Check Context Notes, if any */
  (): ContextNoteObject[] =>
    actor.allNotes
      .map((no) => ({
        item: no.item,
        notes: no.notes.filter((n) => n.subTarget === "msb").map((n) => n.text),
      }))
      .filter((no) => no.notes.length > 0);

const getConcentrationNotes = (actor: ActorPF) => (): ContextNoteObject[] =>
  [
    ...getMsbNotes(actor)(),
    ...actor.allNotes.map((no) => ({
      item: no.item,
      notes: no.notes.filter((n) => ["concentration"].includes(n.subTarget)).map((n) => n.text),
    })),
  ].filter((no) => no.notes.length > 0);

interface ContextNoteObject {
  item: ItemPF;
  notes: string[];
}
