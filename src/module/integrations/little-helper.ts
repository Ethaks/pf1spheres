/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { getHighestCl } from "../actor-util";
import { enrichRoll, localize } from "../util";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Hooks {
    interface StaticCallbacks {
      "little-helper.checks.hints": (tags: Tag[], options: LilHelperCheckHintsOptions) => void;
      "little-helper.i18n": (i18n: { conditions: Record<string, string> }) => void;
    }
  }
}

export const registerLilHelperHooks = (): void => {
  Hooks.on("little-helper.checks.hints", onLilHelperCheckHints);
  Hooks.on("little-helper.i18n", onLilHelperI18n);
};

/** A class used by Little Helper to ensure the presence of some properties */
declare class Tag {
  check: number;
  success: boolean;
  failure: boolean;
  possible: boolean;
  content: string;
  hint: string | null;
  constructor(label: string, options: Omit<Partial<Tag>, "content">);
}

interface LilHelperCheckHintsOptions {
  subject: ChatMessage["data"]["flags"]["pf1"]["subject"];
  cm: ChatMessage;
  roll: Roll;
  result: number;
  element: HTMLElement;
  cls: typeof Tag;
}

export const onLilHelperCheckHints = (
  tags: Tag[],
  { subject, cm, result, cls }: LilHelperCheckHintsOptions,
): void => {
  if (typeof subject === "object" && "pf1spheres" in subject) {
    if (subject.pf1spheres === "concentration") {
      const check = result ?? 0;
      const formulaDefensiveCasting = "@check[Result] - 15[Base DC]";
      const formulaEntangledCasting = "1 + (@check[Result] - 15[Base DC]) * 2";
      const defensiveRoll = RollPF.safeRoll(formulaDefensiveCasting, { check });
      const entangledRoll = RollPF.safeRoll(formulaEntangledCasting, { check });
      const enrichedDefensiveRoll = enrichRoll(
        defensiveRoll,
        formulaDefensiveCasting,
        defensiveRoll.total ?? "",
      ).outerHTML;
      const enrichedEntangledRoll = enrichRoll(
        entangledRoll,
        formulaEntangledCasting,
        entangledRoll.total ?? "",
      ).outerHTML;
      let defensiveSuccess = false,
        entangleSuccess = false;
      // @ts-expect-error TODO: v10 types
      const actor = ChatMessage.getSpeakerActor(cm.speaker);
      if (actor) {
        const { cl = 0 } = getHighestCl(actor)();
        if (check - 15 >= cl) defensiveSuccess = true;
        if (check - 15 >= Math.floor(cl / 2)) entangleSuccess = true;
      }

      tags.push(
        new cls(localize("Checks.ConcentrationDefensiveMaxCL") + enrichedDefensiveRoll, {
          hint: "DC 15+CL",
          check,
          failure: check <= 15,
          possible: check > 15,
          success: defensiveSuccess,
        }),
        new cls(localize("Checks.ConcentrationDamagedDC"), {
          hint: localize("Checks.ConcentrationContinuousHalf"),
          check,
          failure: check < 10,
          possible: check >= 10,
        }),
        new cls(localize("Checks.ConcentrationGrappledDC"), {
          check,
          failure: check < 10,
          possible: check >= 10,
        }),
        new cls(localize("Checks.ConcentrationEntangledDC") + enrichedEntangledRoll, {
          hint: "DC 15+½CL",
          check,
          failure: check < 15,
          possible: check >= 15,
          success: entangleSuccess,
        }),
      );
    }
  }
};

/**
 * Adds a condition hint for the Battered condition.
 *
 * @param i18n - The i18n object from Little Helper
 */
export const onLilHelperI18n = (
  i18n: Parameters<Hooks.StaticCallbacks["little-helper.i18n"]>[0],
): void => {
  i18n.conditions.battered = "PF1SPHERES.BatteredHint";
};
