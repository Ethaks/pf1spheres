/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorDataPath, ActorPF, PF1ActorDataProperties } from "./actor-data";
import type { SourceEntry } from "./item-data";

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
 * Returns a function that adds a SourceEntry to a given actor's sourceInfo
 *
 * @param actor - The actor to whose sourceInfo data is added
 */
export const pushSourceInfo = (
  actor: ActorPF,
  modifierType: "positive" | "negative"
): PushSourceInfo => {
  const getSourceInfo = getGame().pf1.utils.getSourceInfo;
  return (key: ActorDataPath, value: SourceEntry): void => {
    const baseSource = key.endsWith(".base");
    getSourceInfo(actor.sourceInfo, key)[modifierType].push(value);
    if (baseSource)
      getSourceInfo(actor.sourceInfo, key.replace(".base", ".total") as ActorDataPath)[
        modifierType
      ].push(value);
  };
};
declare interface PushSourceInfo {
  /**
   * Adds a SourceEntry to this actor's sourceInfo. If the key ends in ".base",
   * a similar SourceEntry will also be pushed to the key's ".total".
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
const setActorData =
  (actor: ActorPF) =>
  <K extends ActorDataPath>(
    key: ActorDataPath,
    value: PropType<PF1ActorDataProperties, K>
  ): boolean =>
    setProperty(actor.data, key, value);

interface SetActorData {
  /**
   * Sets a property of an Actor instance.
   * There is no check for whether the type of value and the type of the expected data match!
   *
   * @param key - The property path
   * @param value - The value to be set
   * @returns Whether the value was set
   */
  <K extends ActorDataPath>(key: K, value: PropType<PF1ActorDataProperties, K>): boolean;
}

/**
 * A collection of helper functions working with an actor
 */
export interface ActorHelpers {
  pushPSourceInfo: PushSourceInfo;
  pushNSourceInfo: PushSourceInfo;
  setActorData: SetActorData;
}
/**
 * Returns a collection of helper functions working with an actor
 *
 * @param actor - The actor to be used by the helper functions
 */
export const getActorHelpers = (actor: ActorPF): ActorHelpers => {
  return {
    pushPSourceInfo: pushSourceInfo(actor, "positive"),
    pushNSourceInfo: pushSourceInfo(actor, "negative"),
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

/** Recursively sets every property NonNullable */
export type DeepNonNullable<T> = {
  /* eslint-disable-next-line @typescript-eslint/ban-types */
  [P in keyof T]: T[P] extends object ? DeepNonNullable<T[P]> : NonNullable<T[P]>;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type Cast<X, Y> = X extends Y ? X : Y;
export type FromEntries<T> = T extends [infer Key, any][]
  ? { [K in Cast<Key, string>]: Extract<T[number], [K, any]>[1] }
  : { [key in string]: any };

export type FromEntriesWithReadOnly<T> = FromEntries<DeepWriteable<T>>;
