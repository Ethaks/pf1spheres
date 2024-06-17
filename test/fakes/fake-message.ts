/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { getFakeActor } from "./fake-actor";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FakeChatMessage {
  static getSpeakerActor() {
    return getFakeActor();
  }
}
