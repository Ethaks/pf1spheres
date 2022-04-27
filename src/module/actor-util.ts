// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

import type { Ability, ActorDataPath, ActorPF } from "./actor-data";
import type { SourceEntry } from "./item-data";
import { getGame } from "./util";

/**
 * Returns a function that adds a SourceEntry to a given actor's sourceInfo
 *
 * @param actor - The actor to whose sourceInfo data is added
 */
const pushSourceInfo = (actor: ActorPF, modifierType: "positive" | "negative") => {
  const getSourceInfo = getGame().pf1.utils.getSourceInfo;
  /**
   * Adds a SourceEntry to this actor's sourceInfo. If the key ends in ".base",
   * a similar SourceEntry will also be pushed to the key's ".total".
   *
   * @param key - The data path for which the SourceEntry to be added applies
   * @param value - The SourceEntry to be added
   */
  return (key: ActorDataPath, value: SourceEntry): void => {
    const baseSource = key.endsWith(".base");
    getSourceInfo(actor.sourceInfo, key)[modifierType].push(value);
    if (baseSource)
      getSourceInfo(actor.sourceInfo, key.replace(".base", ".total") as ActorDataPath)[
        modifierType
      ].push(value);
  };
};

/**
 * Returns a function that looks up a given actor's ability modifiers
 *
 * @param actor - The actor whose ability modifiers should be returned
 */
const getActorAbility =
  (actor: ActorPF) =>
  /**
   * Returns an actor's ability modifier for a specific ability, or 0 if no modifier can be found
   *
   * @param ability - The ability whose modifier is to be returned
   * @returns The ability modifier
   */
  (ability: Ability | "" | undefined) =>
    ability !== undefined && ability !== "" ? actor.data.data.abilities[ability]?.mod : 0 ?? 0;

/**
 * Returns a collection of helper functions working with an actor
 *
 * @param actor - The actor to be used by the helper functions
 */
export const getActorHelpers = (actor: ActorPF) => {
  return {
    pushPSourceInfo: pushSourceInfo(actor, "positive"),
    pushNSourceInfo: pushSourceInfo(actor, "negative"),
    getAbilityMod: getActorAbility(actor),
  };
};
