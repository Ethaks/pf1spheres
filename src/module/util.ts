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
 * @returns The localised string
 */
export const localize = (key: string): string => {
  if (regex.test(key)) return game.i18n.localize(key);
  else return game.i18n.localize(`PF1SPHERES.${key}`);
};
