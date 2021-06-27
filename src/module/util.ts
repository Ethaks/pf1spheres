import { ActorPF } from "./actor-data";
import { SourceEntry } from "./item-data";

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

/**
 * Returns a function that adds a SourceEntry to a given actor's sourceInfo
 *
 * @param actor - The actor to whose sourceInfo data is added
 */
export const pushPositiveSourceInfo = (actor: ActorPF): PushPSourceInfo => {
  const getSourceInfo = game.pf1.utils.getSourceInfo;
  return function (key: string, value: SourceEntry): void {
    const baseSource = key.endsWith(".base");
    getSourceInfo(actor.sourceInfo, key).positive.push(value);
    if (baseSource)
      getSourceInfo(actor.sourceInfo, key.replace(".base", ".total")).positive.push(value);
  };
};
declare interface PushPSourceInfo {
  /**
   * Adds a SourceEntry to this actor's sourceInfo
   *
   * @param key - The data path for which the SourceEntry to be added applies
   * @param value - The SourceEntry to be added
   */
  (key: string, value: SourceEntry): void;
}
