# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.1](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/compare/v0.1.0...v0.1.1) (2022-04-03)

## 0.1.0 (2022-04-03)


### Features

* add pack utilities ([0957940](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/095794016a350ad40c2092c0001af8a445b2208d))
* add packs ([c3dbd11](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/c3dbd1194ee6cc757b15ec4cc578594e5cb396d0))


### Bug Fixes

* correct combat talents being saved as magic talents ([af619d5](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/af619d572c867f4bbf89f0c539ef9b7237986173))
* dedupe class features packs and fix incorrect links ([95eed5b](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/95eed5bef961c21e00d5448f1c5b199399a0ffd1))
* import combat talents as such ([01108f1](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/01108f159afd6a2be439b7b8788c80160b08ed7b))

## 0.0.3

### Features

- Changed the way sphere CLs were calculated internally, making them now available in other Change formulas
- Added the Battered condition

## 0.0.2

### Features

- Added a modifier type for Changes, "Sphere CL (Capped at HD)", which grants a bonus to the general or a sphere specific CL up to the actor's number of Hit Dice

## 0.0.1

### Features

- Implements a general caster level, a caster level bonus from changes, and a resulting total general caster level
  - This data is available as `@spheres.cl.base`, `@spheres.cl.mod`, and `@spheres.cl.total` respectively
- Implements a sphere specific caster level bonus and total, calculated by adding the total general caster level to a sphere specific bonus created by Changes
  - This data is available as `@spheres.cl.{sphere}.mod` and `@spheres.cl.{sphere}.total`

## 0.0.0 (Initial Commit)
