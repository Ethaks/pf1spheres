# Changelog

## 0.0.1 (Initial commit)

- Implements a general caster level, a caster level bonus from changes, and a resulting total general caster level
  - This data is available as `@spheres.cl.base`, `@spheres.cl.mod`, and `@spheres.cl.total` respectively
- Implements a sphere specific caster level bonus and total, calculated by adding the total general caster level to a sphere specific bonus created by Changes
  - This data is available as `@spheres.cl.{sphere}.mod` and `@spheres.cl.{sphere}.total`
