/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

export class FakeCollection<V> {
  #map: Map<string, V>;

  constructor(entries: [string, V][] = []) {
    this.#map = new Map(entries);
    return this;
  }

  [Symbol.iterator](): IterableIterator<V> {
    return this.#map.values();
  }

  get size(): number {
    return this.#map.size;
  }

  get contents(): V[] {
    return Array.from(this.#map.values());
  }

  get(key: string): V | null {
    return this.#map.get(key) ?? null;
  }

  set(key: string, value: V): FakeCollection<V> {
    this.#map.set(key, value);
    return this;
  }

  has(key: string): boolean {
    return this.#map.has(key);
  }

  find(predicate: (value: V) => boolean): V | undefined {
    return Array.from(this.#map.values()).find(predicate);
  }

  some(predicate: (value: V) => boolean): boolean {
    return Array.from(this.#map.values()).some(predicate);
  }

  filter(predicate: (value: V) => boolean): V[] {
    return Array.from(this.#map.values()).filter(predicate);
  }

  map<T>(callbackfn: (value: V) => T): T[] {
    return Array.from(this.#map.values()).map(callbackfn);
  }

  delete(key: string): boolean {
    return this.#map.delete(key);
  }

  clear(): void {
    this.#map.clear();
  }

  toJSON() {
    return Array.from(this.#map.values());
  }
}
