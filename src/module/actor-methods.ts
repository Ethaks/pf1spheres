/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
/**
 * This namespace contains all functions added to an actor's `spheres` property,
 * where they act like regular methods available on the actor.
 *
 * Additionally, the namespace contains types related to an actor's `system.spheres` property,
 * documenting which properties are available and their types.
 * For a list of all paths the module is aware of, see {@link SpheresRollDataPaths}.
 *
 * @example Rolling a Magic Skill Check
 * ```js
 * const actor = game.actors.get("some-actor-id");
 * await actor.spheres.rollMsb();
 * ```
 * @module actor
 */

import type { ActorPF, ActorSpheresDataPath, PF1ActorSpheresData } from "./actor-data";
import type { ItemPF } from "./item-data";
import { localize } from "./util";
import type { ActorRollOptions } from "../pf1-types/d20roll";
import type { ChatMessageDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData";
import type { ExpandRecursively, PropType } from "./ts-util";

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
       * @param result - The resulting {@link ChatMessage} or its source data
       */
      pf1spheresActorRollMsb(actor: ActorPF, result: ActorRollResult): void;

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
       * @param result - The resulting {@link ChatMessage} or its source data
       */
      pf1spheresActorRollConcentration(actor: ActorPF, result: ActorRollResult): void;
    }
  }
}

/**
 * The result of calling one of an actor's roll functions.
 * It can be a
 *  - {@link ChatMessage} if the roll was executed, and `chatMessage` is `true`
 *  - {@link ChatMessageDataSource} if the roll was executed, and `chatMessage` is `false`
 *  - `void` if the roll was not executed
 */
export type ActorRollResult = ChatMessage | ChatMessageDataSource | void;

/**
 * Returns an object containing method-like functions scoped to work with an actor
 *
 * @ignore
 */
export const getActorMethods = (actor: ActorPF) => ({
  rollMsb: rollMsb.bind(actor),
  rollConcentration: rollConcentration.bind(actor),
  // TODO: Underscore or not?
  _getMsbNotes: _getMsbNotes.bind(actor),
  _getConcentrationNotes: _getConcentrationNotes.bind(actor),
});

/**
 * Rolls a Magic Skill Check
 *
 * @group Actor Methods
 * @param options - Additional options affecting the roll/chat message creation
 */
export async function rollMsb(
  this: ActorPF,
  options: ActorRollOptions = {},
): Promise<ActorRollResult> {
  if (!this.isOwner) {
    const msg = localize("PF1.ErrorNoActorPermissionAlt", { "0": this.name });
    console.warn(msg);
    return ui.notifications?.warn(msg);
  }

  const parts = this.sourceDetails["system.spheres.msb.total"]
    .filter((info) => !(info.name in CONFIG.PF1.bonusTypes)) // TODO: Remove when Changes can opt out of sourceInfo
    .map((info) => `${info.value}[${info.name}]`);

  const rollData = this.getRollData();
  const noteObjects = this.spheres._getMsbNotes();
  const notes = this.formatContextNotes(noteObjects, rollData);
  const props = notes.length > 0 ? [{ header: localize("PF1.Notes"), value: notes }] : [];

  const rollOptions = {
    ...options,
    parts,
    subject: { pf1spheres: "msb" },
    rollData: this.getRollData(),
    flavor: localize(`Checks.MSB`),
    speaker: ChatMessage.getSpeaker({ actor: this }),
    chatTemplateData: { hasProperties: props.length > 0, properties: props },
  };
  if (Hooks.call("pf1spheresPreActorRollMsb", this, rollOptions) === false) return;
  const result = await pf1.dice.d20Roll(rollOptions);
  Hooks.callAll("pf1spheresActorRollMsb", this, result);
  return result;
}

/**
 * Rolls a Concentration check
 *
 * @group Actor Methods
 * @param options - Additional options affecting the roll/chat message creation
 */
export async function rollConcentration(
  this: ActorPF,
  options: ActorRollOptions = {},
): Promise<ActorRollResult> {
  if (!this.isOwner) {
    const msg = localize("PF1.ErrorNoActorPermissionAlt", { "0": this.name });
    console.warn(msg);
    return ui.notifications?.warn(msg);
  }

  const parts = this.sourceDetails["system.spheres.concentration.total"]
    .filter((info) => !(info.name in CONFIG.PF1.bonusTypes)) // TODO: Remove when Changes can opt out of sourceInfo
    .map((info) => `${info.value}[${info.name}]`);

  const rollData = this.getRollData();
  const noteObjects = this.spheres._getConcentrationNotes();
  const notes = this.formatContextNotes(noteObjects, rollData);
  const props = notes.length > 0 ? [{ header: localize("PF1.Notes"), value: notes }] : [];

  const rollOptions = {
    ...options,
    parts,
    subject: { pf1spheres: "concentration" },
    rollData: this.getRollData(),
    flavor: localize("PF1.ConcentrationCheck"),
    speaker: ChatMessage.getSpeaker({ actor: this }),
    chatTemplateData: { hasProperties: props.length > 0, properties: props },
  };
  if (Hooks.call("pf1spheresPreActorRollConcentration", this, rollOptions) === false) return;
  const result = await pf1.dice.d20Roll(rollOptions);
  Hooks.callAll("pf1spheresActorRollConcentration", this, result);
  return result;
}

/**
 * Returns an array of objects containing an item and its Magic Skill Check Context Notes, if any
 *
 * @ignore
 */
export function _getMsbNotes(this: ActorPF): ContextNoteObject[] {
  return this.allNotes
    .map((no) => ({
      item: no.item,
      notes: no.notes.filter((n) => n.target === "msb").map((n) => n.text),
    }))
    .filter((no) => no.notes.length > 0);
}

/**
 * Returns an array of objects containing an item and its Concentration Context Notes, if any
 *
 * @ignore
 */
export function _getConcentrationNotes(this: ActorPF): ContextNoteObject[] {
  return [
    ...this.spheres._getMsbNotes(),
    ...this.allNotes.map((no) => ({
      item: no.item,
      notes: no.notes.filter((n) => ["concentration"].includes(n.target)).map((n) => n.text),
    })),
  ].filter((no) => no.notes.length > 0);
}

interface ContextNoteObject {
  item: ItemPF;
  notes: string[];
}

type SpheresFormulaPaths = {
  [Key in ActorSpheresDataPath as PropType<PF1ActorSpheresData, Key> extends number | string
    ? `@spheres.${Key}`
    : never]-?: PropType<PF1ActorSpheresData, `${Key}`> extends number
    ? PropType<PF1ActorSpheresData, `${Key}`>
    : never;
};
/**
 * These are the data paths available made available by the Spheres module in roll data.
 * Their values can be used in formulae.
 *
 * @group Roll Data
 * @example Accessing an actor's total MSB in a roll formula
 * ```markdown
 * @spheres.msb.total
 * ```
 */
interface SpheresRollDataPaths extends ExpandRecursively<SpheresFormulaPaths> {}
export { SpheresRollDataPaths };
