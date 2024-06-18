/*
 * SPDX-FileCopyrightText: 2024 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { ActorDataPath, ActorPF } from "./actor-data";
import { ActorSheetPF } from "./actor-sheet";
import { BonusType, CombatSphere, MagicSphere, SourceEntry, Sphere } from "./item-data";
import { getGame, localize } from "./util";

/**
 * Returns a function that activates a "spheres tooltip" for a given ID.
 */
export const activateSphereTooltip =
  (sheet: ActorSheetPF) =>
  /**
   * Activate a tooltip for Spheres info.
   *
   * @param event - The pointer event
   */
  async (event: PointerEvent): Promise<void> => {
    const el = event.currentTarget as HTMLElement;
    if (!el) return;
    const id = el.dataset.tooltipSphere;
    if (!id) return;

    const context = getTooltipContext(id as SphereTooltipId, sheet.actor);

    const template = document.createElement("template");
    template.innerHTML = Handlebars.partials["systems/pf1/templates/extended-tooltip.hbs"](
      context,
      {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true,
        preventIndent: true,
      },
    );
    // @ts-expect-error Missing types
    getGame().tooltip.activate(el, {
      content: template.content,
      cssClass: "pf1 extended",
      direction: el.dataset.tooltipDirection || undefined,
    });
  };

/**
 * Create a context object used to render a "spheres tooltip" (a tooltip using the system's extended template).
 *
 * @param tooltipId - The ID of the tooltip to render
 * @param actor - The ActorPF for which to render the tooltip
 */
const getTooltipContext = (tooltipId: SphereTooltipId, actor: ActorPF): TooltipContext => {
  const context: TooltipContext = {
    header: "",
    paths: [],
    sources: [],
    details: [],
    notes: [],
  };

  const [id, sphere] = tooltipId.split(":");

  switch (id) {
    case "concentration": {
      context.paths.push({
        path: "@spheres.concentration.total",
        value: actor.system.spheres?.concentration.total ?? 0,
      });
      context.sources.push({
        sources: actor.sourceDetails["system.spheres.concentration.total"].map((source) => ({
          ...source,
          value: source.value ?? 0,
          type: pf1.config.bonusTypes[(source.type as BonusType) || (source.modifier as BonusType)],
        })),
        untyped: false,
      });
      break;
    }
    case "msb": {
      context.paths.push({
        path: "@spheres.msb.total",
        value: actor.system.spheres?.msb.total ?? 0,
      });
      const { base, bonus, capped } = getSources(actor, "system.spheres.msb");
      if (base.length) context.sources.push({ sources: base, untyped: false });
      if (capped.length) context.sources.push({ sources: capped, untyped: false });
      if (bonus.length) context.sources.push({ sources: bonus, untyped: false });
      break;
    }
    case "msd": {
      context.paths.push({
        path: "@spheres.msd.total",
        value: actor.system.spheres?.msd.total ?? 0,
      });
      const { base, bonus, capped } = getSources(actor, "system.spheres.msd");
      if (base.length) context.sources.push({ sources: base, untyped: false });
      if (capped.length) context.sources.push({ sources: capped, untyped: false });
      if (bonus.length) context.sources.push({ sources: bonus, untyped: false });
      break;
    }
    case "bab": {
      const baseSources = actor.sourceDetails["system.attributes.bab.total"].map((source) => ({
        ...source,
        value: source.value ?? 0,
        type:
          pf1.config.bonusTypes[(source.type as BonusType) || (source.modifier as BonusType)] ||
          pf1.config.bonusTypes.untyped,
      }));

      if (sphere) {
        context.paths.push({
          path: `@spheres.bab.${sphere}.total`,
          value: actor.system.spheres?.bab[sphere as CombatSphere].total ?? 0,
        });
        const sphereSources = getSources(actor, `system.spheres.bab.${sphere}`);

        if (baseSources.length) context.sources.push({ sources: baseSources, untyped: false });
        if (sphereSources.base.length)
          context.sources.push({ sources: sphereSources.base, untyped: false });
        if (sphereSources.capped.length)
          context.sources.push({ sources: sphereSources.capped, untyped: false });
        if (sphereSources.bonus.length)
          context.sources.push({ sources: sphereSources.bonus, untyped: false });
      } else {
        context.paths.push({
          path: "@attributes.bab.total",
          value: actor.system.attributes.bab.total ?? 0,
        });
        context.sources.push({ sources: baseSources, untyped: false });
      }
      break;
    }
    case "cl": {
      const commonSources = getSources(actor, `system.spheres.cl`);
      if (sphere) {
        context.paths.push({
          path: `@spheres.cl.${sphere}.total`,
          value: actor.system.spheres?.cl[sphere as MagicSphere].total ?? 0,
        });
        const sphereSources = getSources(actor, `system.spheres.cl.${sphere}`);
        if (commonSources.base.length)
          context.sources.push({ sources: commonSources.base, untyped: false });
        if (sphereSources.base.length)
          context.sources.push({ sources: sphereSources.base, untyped: false });
        if (commonSources.capped.length)
          context.sources.push({ sources: commonSources.capped, untyped: false });
        if (sphereSources.capped.length)
          context.sources.push({ sources: sphereSources.capped, untyped: false });
        if (commonSources.bonus.length)
          context.sources.push({ sources: commonSources.bonus, untyped: false });
        if (sphereSources.bonus.length)
          context.sources.push({ sources: sphereSources.bonus, untyped: false });
      } else {
        context.paths.push({
          path: "@spheres.cl.total",
          value: actor.system.spheres?.cl.total ?? 0,
        });
        const { base, bonus, capped } = commonSources;
        if (base.length) context.sources.push({ sources: base, untyped: false });
        if (capped.length) context.sources.push({ sources: capped, untyped: false });
        if (bonus.length) context.sources.push({ sources: bonus, untyped: false });
      }
      break;
    }
  }

  return context;
};

/**
 * Get the sources for a given path from an actor
 * Sources are retrieved for the path's `total` and `modCap` properties;
 * the result contains sources separated into `base`, `bonus`, and `capped` categories.
 *
 * @param actor - The ActorPF from which to retrieve sources
 * @param path - The path for which to retrieve sources
 */
const getSources = (
  actor: ActorPF,
  path: string,
): Record<"base" | "bonus" | "capped", TooltipSource[]> => {
  const totalPath = `${path}.total` as ActorDataPath;
  const modCapPath = `${path}.modCap` as ActorDataPath;
  const base = actor.sourceDetails[totalPath]
    .filter(filterDummySources)
    .filter((source) => !source.modifier)
    .map((source) => ({
      ...source,
      value: formatValue(source.value),
      type:
        pf1.config.bonusTypes[(source.type as BonusType) || (source.modifier as BonusType)] ||
        pf1.config.bonusTypes.untyped,
    }));
  const bonus = actor.sourceDetails[totalPath]
    .filter(filterDummySources)
    .filter((source) => source.modifier)
    .map((source) => ({
      ...source,
      value: formatValue(source.value),
      type: pf1.config.bonusTypes[(source.type as BonusType) || (source.modifier as BonusType)],
    }));
  const capped = (actor.sourceDetails[modCapPath] ?? [])
    .filter(filterDummySources)
    .map((source) => ({
      ...source,
      value: formatValue(source.value),
      type: localize("CappedByHD"),
    }));
  return { base, bonus, capped };
};

/**
 * Filter out sources taken from another source (e.g. base CL to sphere CL), implied by the name being the bonus type.
 *
 * @param source - The source to filter
 */
const filterDummySources = (source: SourceEntry): boolean => {
  if (source.name in CONFIG.PF1.bonusTypes) return false;
  return true;
};

/**
 * Format a number value to be suitable for tooltip display.
 * If the value is a floating point number, it is formatted to one decimal place and returned as string;
 * this results in the tooltip display becoming uneven, but is necessary to display e.g. correct partial caster level parts.
 *
 * @param value - The value to format
 * @param options - Formatting options
 * @param options.sign - Whether to include a sign for positive values
 */
const formatValue = (value = 0, { sign = true } = {}): number | string => {
  const isFloat = value % 1 !== 0;
  if (!isFloat) return value;
  const fixed = parseFloat(`${value}`).toFixed(1);
  if (sign) return value >= 0 ? `+${fixed}` : fixed;
  return fixed;
};

type SphereTooltipId =
  | "cl"
  | "msb"
  | "msd"
  | "concentration"
  | "bab"
  | `cl:${Sphere}`
  | `bab:${CombatSphere}`;

interface TooltipContext {
  header: string;
  paths: { path: string; value: number }[];
  sources: { sources: TooltipSource[]; untyped?: boolean }[];
  details: string[];
  notes: string[];
}

interface TooltipSource {
  name: string;
  value: number | string;
  isBoolean?: boolean;
  type?: string;
}
