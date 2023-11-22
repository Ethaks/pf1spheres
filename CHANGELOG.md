# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.6.1](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/compare/v0.6.0...v0.6.1) (2023-11-22)


### Bug Fixes

* allow modifying pf1s.config ([ed0dac9](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/ed0dac92e66ab699454cf1a2be8b7dcd4148c5a7))

## [0.6.0](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/compare/v0.5.1...v0.6.0) (2023-07-17)


### ⚠ BREAKING CHANGES

* increase required system version to 9.0

### Features

* add battered description ([1aaae65](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/1aaae650d4363bc0b0aa73fd5535c56543d4aff6)), closes [#23](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/23)
* add skill talent subtype and skill sphere field ([3cbc039](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/3cbc03970b9d31d88653a763910bd6cef46cbe31)), closes [#27](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/27)
* track number of talents ([3f5ef1e](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/3f5ef1e5d300525490b0ca7436f6f8f2a6d792cb)), closes [#3](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/3)


### Bug Fixes

* restore ability to roll talents from actor tab ([117f3a1](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/117f3a1bfedfcac98751ab09b13c3cd989bedb6f))


* increase required system version to 9.0 ([e030750](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/e030750733736a4c84d6add52bb7cdb5547fdedb))

### [0.5.1](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/compare/v0.5.0...v0.5.1) (2023-01-06)


### Bug Fixes

* fix spheres tab in actor sheets not being rendered ([5cead7e](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/5cead7e7d580f528aba95603fc4d41b0d6b50435))

## [0.5.0](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/compare/v0.4.0...v0.5.0) (2022-09-15)


### ⚠ BREAKING CHANGES

* remove `actorRoll` hooks provided by the module
* increase minimum system version

### Features

* add `pf1spheresPreSetup` hook and deprecate `pf1spheres.preSetup` ([7a0a074](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/7a0a074f04330388b438170390894889013f9fdd))
* update actor roll hooks to PF1 v0.82.2 format ([a4ef245](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/a4ef245ad1f678b64aaef2f0c1c7a1aba1d236ff))


### Bug Fixes

* remove duplicate sources for concentration and battered changes ([d50d0b0](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/d50d0b01ed48737326e968c4a6e2d45b1ad41881))
* remove duplicated sources for concentration and MSB rolls ([0e1c4c3](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/0e1c4c36a973364ce645b93772b0d5ea0ab511e7))
* respect user settings for dialog skipping ([91c4360](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/91c4360a935bef1240d0e9262b321b9119bf3bbb))


* increase minimum system version ([74d2624](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/74d2624502716e978cc0ac5651045ea8f4591102))

## [0.4.0](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/compare/v0.3.1...v0.4.0) (2022-09-11)


### ⚠ BREAKING CHANGES

* make module Foundry v10 and PF1 0.82 compatible

### Bug Fixes

* make module Foundry v10 and PF1 0.82 compatible ([2a4ec33](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/2a4ec3306c669a2c1f3455f071e00829ab2a9df0))

### [0.3.1](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/compare/v0.3.0...v0.3.1) (2022-06-19)


### Bug Fixes

* move sphere select under details header in feat sheets ([81d3eb3](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/81d3eb36ec29f1f95f8b0ad2cc6a751ab71ce0a1))

## [0.3.0](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/compare/v0.2.1...v0.3.0) (2022-06-16)


### ⚠ BREAKING CHANGES

* increase minimum system version
* remove `changeFlatTargets` dictionary from API
* msbAbility is replaced by Casting Ability

### Features

* add `@spheres.cam` data shortcut, separate MSB and concentration ([255eaef](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/255eaefa98367fe4650bd400299aa6ce115b0fcf)), closes [#17](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/17) [#18](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/18)
* add `pf1spheres.preSetup` hook to allow custom Sphere registration ([05c7728](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/05c7728d6313f07ac57ceaca95e0146276b82118)), closes [#20](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/20)
* add Context Note target for Magic Skill Checks ([148f522](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/148f522801e67e433901bc05610b6714a59a90c7)), closes [#10](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/10)
* add Little Helper integration to add tags to Magic Skill checks ([4f9d824](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/4f9d824d3b20f8975c6c2a50305a7b46c531c04d)), closes [#16](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/16)
* add method like Spheres functions to actors ([d2d4a2b](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/d2d4a2b6ce05125e881912c8487109042310a369)), closes [#15](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/15)


### Bug Fixes

* add msb to concentration sources even if no casting ability is set ([64c847a](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/64c847a5ce70eaf4f478997597fd273e549bac2e))
* fix spheres data not being available in Change formulas ([5648e62](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/5648e62fdca69700f367e0bb3af005abb86c5787))
* **packs:** fix Equipment Sphere's journal entry name ([8b38030](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/8b38030c80adde6efd5be69f94a434a68a135222)), closes [#21](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/issues/21)


* increase minimum system version ([32ba921](https://gitlab.com/ethaks-fvtt/foundryvtt-pf1-spheres/commit/32ba9211cb366b2fcadbd5687e3bac213a71db0e))

### [0.2.1](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/compare/v0.2.0...v0.2.1) (2022-04-30)


### Bug Fixes

* actually include packs again ([1b06d82](https://gitlab.com/Ethaks/foundryvtt-pf1-spheres/commit/1b06d82a6f49222e99a6116fc43a643702e9a846))

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
