/*
 * SPDX-FileCopyrightText: 2023 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

/**
 * Hooks
 *
 * This namespace contains all the hooks fired by this module.
 * All hooks introduced by the module are prefixed with a `pf1spheres` scope.
 * Each hook contains a remark denoting whether it is called with [`Hooks.callAll`](https://foundryvtt.com/api/v10/classes/client.Hooks.html#callAll)
 * or [`Hooks.call`](https://foundryvtt.com/api/v10/classes/client.Hooks.html#callAll).
 * Only hooks that are called with `Hooks.call` can be stopped by returning `false` from the callback.
 *
 * @module hookEvents
 */

// Init
export declare const pf1spheresPreSetup: Hooks.StaticCallbacks["pf1spheresPreSetup"];

// Actor Rolls
export declare const pf1spheresPreActorRollMsb: Hooks.StaticCallbacks["pf1spheresPreActorRollMsb"];
export declare const pf1spheresActorRollMsb: Hooks.StaticCallbacks["pf1spheresActorRollMsb"];
export declare const pf1spheresPreActorRollConcentration: Hooks.StaticCallbacks["pf1spheresPreActorRollConcentration"];
export declare const pf1spheresActorRollConcentration: Hooks.StaticCallbacks["pf1spheresActorRollConcentration"];
