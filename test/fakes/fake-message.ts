/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { getFakeActor } from "./fake-actor";

export class FakeChatMessage {
  static getSpeakerActor() {
    return getFakeActor();
  }
}
