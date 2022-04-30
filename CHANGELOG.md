# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/compare/v0.1.1...v0.2.0) (2022-04-30)


### Features

* add item rolling button to sphere tab talents ([8098dfe](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/8098dfedefb4f410b5399c7234994c8717ba4594))
* add journal entries for Spheres ([90f144b](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/90f144b9e84a60371d7b4661e3b92ec513a9abef))
* add MSB ability setting ([ae9a6a6](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/ae9a6a603160590a1a035126b658c7661a5bfda9))
* implement journal entry opening by clicking on sphere label in actor tab ([c891573](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/c8915736da1b3bc9a93f963de1615d5c6ee7a77f))


### Bug Fixes

* add caster progressions to classes in packs ([be879fb](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/be879fbaf333a4f76e28a51ae3b180673a64f5f7))
* correct general and spehere specific CL calculation ([a6922a0](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/a6922a06d6d78d4b6264883b4e9823ecc64d1491))
* enforce minimum level 1 for classAssociations, fix "med" BAB ([b40f85c](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/b40f85cc35a69f103fefc2bfd9d7e44521c6cf92))
* **packs:** migrate talents, remove incorrect entries, fix sphere tags ([577602a](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/577602af16eba131f0f239c032a122342293e53e))
* **packs:** re-add talents erroneously deleted by deduplication ([b863b6f](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/b863b6f53d52c162b50f9f6226e110798294690a))
* prevent arrow for expanded spheres not matching status ([b302fa0](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/b302fa098a36cf9f797f390bbada36475193f62c))
* re-enable Spheres tab ([3113bc2](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/3113bc287b29c2d790ed3902004157bf0aa88983))
* remove hover styling for attribute block headers ([f19abdf](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/f19abdf2230f95dadbba357c035e2aa1da37e4e8))
* render spheres tab body correctly in alt sheet ([a9976bd](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/a9976bd94a291c3bb2e2e44caa27cf299d94551e))
* use relative links for sphere icons, add bear sphere ([987bce8](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/987bce8f629aaf63e9e0f06a07d75bd62f5a0812))

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
