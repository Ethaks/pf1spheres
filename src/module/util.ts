import type { ActorDataPath, ActorPF, PF1ActorData } from "./actor-data";
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
  return function (key: ActorDataPath, value: SourceEntry): void {
    const baseSource = key.endsWith(".base");
    getSourceInfo(actor.sourceInfo, key).positive.push(value);
    if (baseSource)
      getSourceInfo(
        actor.sourceInfo,
        key.replace(".base", ".total") as ActorDataPath
      ).positive.push(value);
  };
};
declare interface PushPSourceInfo {
  /**
   * Adds a SourceEntry to this actor's sourceInfo
   *
   * @param key - The data path for which the SourceEntry to be added applies
   * @param value - The SourceEntry to be added
   */
  (key: ActorDataPath, value: SourceEntry): void;
}

/**
 * Returns a function that sets a given actor's data
 *
 * @param actor - The actor whose data the function will set
 */
const setActorData = (actor: ActorPF) => {
  return function <K extends ActorDataPath>(
    key: ActorDataPath,
    value: PropType<PF1ActorData, K>
  ): boolean {
    return setProperty(actor.data, key, value);
  };
};
interface SetActorData {
  /**
   * Sets a property of an Actor instance.
   * There is no check for whether the type of value and the type of the expected data match!
   *
   * @param key - The property path
   * @param value - The value to be set
   * @returns Whether the value was set
   */
  <K extends ActorDataPath>(key: K, value: PropType<PF1ActorData, K>): boolean;
}

/**
 * A collection of helper functions working with an actor
 */
interface ActorHelpers {
  pushPSourceInfo: PushPSourceInfo;
  setActorData: SetActorData;
}
/**
 * Returns a collection of helper functions working with an actor
 *
 * @param actor - The actor to be used by the helper functions
 */
export const getActorHelpers = (actor: ActorPF): ActorHelpers => {
  return {
    pushPSourceInfo: pushPositiveSourceInfo(actor),
    setActorData: setActorData(actor),
  };
};

// For convenience
type Primitive = string | number | bigint | boolean | undefined | symbol;

/**
 * A type including only valid property paths of a given type.
 * Paths are given in dot notations as `data.some.property`
 */
export type PropPath<T, Prefix = ""> = {
  [K in keyof T]: T[K] extends Primitive | Array<unknown>
    ? `${string & Prefix}${string & K}`
    : `${string & Prefix}${string & K}` | PropPath<T[K], `${string & Prefix}${string & K}.`>;
}[keyof T];

export type PropType<T, Path extends string> = string extends Path
  ? unknown
  : Path extends keyof T
  ? T[Path]
  : Path extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PropType<T[K], R>
    : unknown
  : unknown;
