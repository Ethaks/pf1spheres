/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export class D20RollPF extends RollPF {
  DIALOG_TEMPLATE: string;
}

export interface D20RollConstructorOptions extends RollTerm.EvaluationOptions {
  /**
   * The number on the d20 that is considered a critical success.
   *
   * @defaultValue `20`
   */
  critical?: number;
  /**
   * The number on the d20 that is considered a critical failure.
   *
   * @defaultValue `1`
   */
  fumble?: number;
  /**
   * The flavor of the roll
   */
  flavor?: string;
  /**
   * An additional bonus to be added to the roll.
   */
  bonus?: string | number;
  /**
   * A number used as a static roll result of the d20.
   * If null, the d20 is rolled normally and the result is used.
   *
   * @defaultValue `null`
   */
  staticRoll?: number | null;
}

export interface D20RollOptions
  extends D20RollConstructorOptions,
    Pick<D20RollChatOptions, "rollMode"> {}

export interface D20RollDialogOptions extends Pick<D20RollConstructorOptions, "bonus"> {
  /**
   * The title of the dialog window.
   *
   * @defaultValue {@link D20RollConstructorOptions.flavor}
   */
  title?: string;
  /**
   * The template used to render the dialog's content.
   *
   * @defaultValue {@link D20RollPF.DIALOG_TEMPLATE}
   */
  template?: string;
  /**
   * Additional options passed to the dialog's creation.
   */
  dialogOptions?: object;
  /**
   * The rollMode that is preselected in the dialog
   *
   * @defaultValue `game.settings.get("core", "rollMode")`
   */
  rollMode?: string;
}

export interface D20RollChatOptions {
  /**
   * The template used to render the chat message.
   *
   * @defaultValue {@link D20RollPF.CHAT_TEMPLATE}
   */
  chatTemplate?: string;
  /**
   * Additional data passed to the chat message's content's {@link renderTemplate}.
   */
  chatTemplateData?: object;
  /**
   * The speaker of the chat message.
   */
  speaker?: foundry.data.ChatMessageData["_source"]["speaker"];
  /**
   * Whether no dice sound should be played when the chat message is created.
   *
   * @defaultValue `false`
   */
  noSound?: boolean;
  /**
   * The rollMode with which the chat message is created.
   *
   * @defaultValue `game.settings.get("core", "rollMode")`
   */
  rollMode?: string;
  /**
   * Whether a chat message should be created.
   *
   * @defaultValue `true`
   */
  create?: boolean;
  /**
   * Data used to create a link to a compendium entry in the chat message.
   */
  compendium?: { entry: string; type: string };
  /**
   * Data stored in the chat message's flags to allow for easier identification of the message's subject.
   */
  subject?: object;
}

export interface D20ActorRollOptions
  extends Pick<D20RollConstructorOptions, "flavor" | "bonus" | "staticRoll">,
    Pick<
      D20RollChatOptions,
      "noSound" | "compendium" | "rollMode" | "chatTemplateData" | "subject" | "speaker"
    > {
  /**
   * Data object the roll is evaluated against.
   *
   * @defaultValue `{}`
   */
  rollData?: object;
  /**
   * An array of strings from which the roll's formula is created.
   *
   * @defaultValue `[]`
   */
  parts?: string[];
  /**
   * The roll's d20 die (replacement), or the static result the d20 should have.
   *
   * @defaultValue `"1d20"`
   */
  dice?: string;
  /**
   * Whether a chat message should be created.
   *
   * @defaultValue `true`
   */
  chatMessage?: boolean;
  /**
   * Whether a user facing dialog should be shown.
   *
   * @defaultValue `true`
   */
  skipDialog?: boolean;
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface ActorRollOptions
  extends Omit<
    D20ActorRollOptions,
    "rollData" | "parts" | "subject" | "flavor" | "chatTemplateData" | "compendium" | "speaker"
  > {}
