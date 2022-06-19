// SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
//
// SPDX-License-Identifier: EUPL-1.2

// The following types are only used to assert that the config extensions adhere to the expected shape.
// Should more in-depth type checks be required, "conditional-type-checks" or "tsd" might become necessary.
/* eslint-disable @typescript-eslint/no-unused-vars */ // Presence alone is sufficient to allow type checking
/** Asserts that one type can extend another */
export type _AssertExtends<T extends U, U> = T;
/* eslint-enable @typescript-eslint/no-unused-vars */

// For convenience
type Primitive = string | number | bigint | boolean | undefined | symbol;

/**
 * A type including only valid property paths of a given type.
 * If a property path could resolve to an undefined value, it will be excluded.
 * Paths are given in dot notations as `data.some.property`
 */
export type SafePropPath<T, Prefix = ""> = {
  [K in keyof T]: T[K] extends Primitive | Array<unknown>
    ? `${string & Prefix}${string & K}`
    : `${string & Prefix}${string & K}` | SafePropPath<T[K], `${string & Prefix}${string & K}.`>;
}[keyof T];

/**
 * A type including valid property paths of a given type, including possible undefined values.
 * Paths are given in dot notations as `data.some.property`
 */
export type PropPath<T, Prefix = ""> = {
  [K in keyof T]-?: T[K] extends Primitive | Array<unknown>
    ? `${string & Prefix}${string & K}`
    :
        | `${string & Prefix}${string & K}`
        | PropPath<NonNullable<T[K]>, `${string & Prefix}${string & K}.`>;
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

/**
 * A utility function acting as a type guard, ensuring an element is not null or undefined.
 *
 * @param value - Value that could be null or undefined
 */
export const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined;

/**
 * A utility type stripping a prefix from a string.
 * Assumes that the prefix is separated from the string by a period.
 *
 * @template TPrefix - The prefix to strip
 * @template T - The string to strip the prefix from
 */
export type StripPrefix<
  TPrefix extends string,
  T extends string // changed this constraint to string
> = T extends `${TPrefix}.${infer R}` ? R : never;
