/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

/** The module's name/id */
export const MODULE_ID = "pf1spheres";

/**
 * Regular Expression which localisation keys are checked against.
 */
const regex = /^ACTOR\.|ITEM\.|PF1\.|PF1SPHERES\./;

/**
 * Returns a localised string from a localisation key.
 * If the key does not start with "ACTOR", "ITEM", or "PF1", a prefix of
 * "PF1SPHERES" will be used for the key.
 *
 * @param key - The localisation key
 * @param data - Data used for variables in the localisation string
 * @returns The localised string
 */
export const localize = (key: string, data?: Record<string, unknown>): string => {
  if (regex.test(key)) return getGame().i18n.format(key, data);
  else return getGame().i18n.format(`PF1SPHERES.${key}`);
};

/**
 * Returns the game global after checking that it is actually initialised
 */
export const getGame = (): Game => {
  if (!(game instanceof Game)) throw new Error("Game not initialised");
  return game;
};

/**
 * Tests if the given `value` is truthy.
 *
 * If it is not truthy, an {@link Error} is thrown, which depends on the given `message` parameter:
 * - If `message` is a string`, it is used to construct a new {@link Error} which then is thrown.
 * - If `message` is an instance of {@link Error}, it is thrown.
 * - If `message` is `undefined`, an {@link Error} with a default message is thrown.
 */
export function enforce(value: unknown, message?: string | Error): asserts value {
  if (!value) {
    if (!message) {
      message =
        "There was an unexpected error in the Spheres for Pathfinder 1e module. For more details, please take a look at the console (F12).";
    }
    throw message instanceof Error ? message : new Error(message);
  }
}
