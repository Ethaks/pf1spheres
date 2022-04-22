/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

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
