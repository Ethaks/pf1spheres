/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { getGame } from "../util";
import { registerLilHelperHooks } from "./little-helper";

export const initializeModuleIntegrations = () => {
  if (getGame().modules.get("koboldworks-pf1-little-helper")?.active) {
    registerLilHelperHooks();
  }
};
