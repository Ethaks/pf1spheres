/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

export class FakeRoll {
  _data: Partial<ReturnType<Roll["toJSON"]>>;

  constructor(data: Partial<typeof FakeRoll["prototype"]["_data"]>) {
    this._data = data;
  }

  toJSON() {
    return this._data;
  }

  static safeRoll() {
    return new FakeRoll({});
  }

  get total() {
    return this._data.total;
  }
}
