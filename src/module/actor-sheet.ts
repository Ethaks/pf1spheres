/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { ActorPF, PF1ActorSpheresData, SpheresTalentsRecord } from "./actor-data";
import { SpheresActorSettings } from "./apps/SpheresActorSettings";
import { PF1S } from "./config";
import type { CombatSphere, ItemPF, MagicSphere, SourceEntry, Sphere } from "./item-data";
import { getSphereType } from "./item-util";
import { enforce, getGame, localize } from "./util";
import { renderPf1sTemplate } from "./preloadTemplates";

export const onActorSheetHeaderButtons = (
  sheet: ActorSheetPF,
  buttons: Application.HeaderButton[],
) => {
  if (sheet.isEditable) {
    const actor = sheet.actor;
    buttons.unshift({
      class: "pf1spheres-actor-settings",
      icon: "fas fa-spinner",
      label: localize("SpherePlural"),
      onclick: (_) => new SpheresActorSettings(actor).render(true),
    });
  }
};

export const onActorSheetRender: (
  app: ActorSheetPF,
  html: JQuery,
  options: ActorSheetPFData,
) => boolean = (app, html, _options) => {
  if (app.spheresTab == null) {
    app.spheresTab = { activateTab: false, expandedSpheres: {} };
  }
  addNavTab(app, html);

  const body = html.find("section.primary-body").first();

  const actor = app.actor as ActorPF;

  const renderData = getSpheresData(app, actor);
  const renderedTemplate = getRenderedSpheresTab(renderData);
  const spheresBody = body.append($(renderedTemplate));
  activateListeners(app, spheresBody, actor);

  // Re-focus spheres tab
  // NOTE: Can be expanded for multiple tabs
  if (app.spheresTab.activateTab === "spheres") {
    // @ts-expect-error Accessing tabs is necessary
    app._tabs[0].activate("spheres");
    app.setPosition();
  }

  return true;
};

const addNavTab = (app: ActorSheetPF, html: JQuery<HTMLElement>) => {
  // Handle tab in navigation TODO: Pure JS?
  const tabSelector = html.find("nav.sheet-navigation.tabs").first();
  const spheresTabTitle = `<a class="item" data-tab="spheres">${localize("SpherePlural")}</a>`;
  const newTab = tabSelector.append($(spheresTabTitle));
  newTab.on("click", (ev: JQuery.ClickEvent<HTMLElement>) => {
    const isSpheresTab = ev.target.dataset?.tab === "spheres";
    app.spheresTab.activateTab = isSpheresTab ? "spheres" : false;
  });
};

const getSpheresData = (app: ActorSheetPF, actor: ActorPF): SpheresTemplateData => {
  if (!actor.system.spheres) throw new Error("Spheres data missing!");
  const spheres = actor.system.spheres as PF1ActorSpheresData;

  const attributeGrid = (["cl", "msb", "msd"] as const).map(
    (attribute): AttributeData => ({
      attribute,
      total: spheres[attribute].total ?? 0,
      label: localize(attribute.toLocaleUpperCase() as Uppercase<typeof attribute>),
      path: `@spheres.${attribute}.total`,
      sources: (actor.sourceDetails[`system.spheres.${attribute}.total` as const] ?? []).filter(
        (info) => !(info.name in CONFIG.PF1.bonusModifiers), // TODO: Remove when Changes can opt out of sourceInfo
      ),
      cappedSources: (
        actor.sourceDetails[`system.spheres.${attribute}.modCap` as const] ?? []
      ).filter(
        (info) => !(info.name in CONFIG.PF1.bonusModifiers), // TODO: Remove when Changes can opt out of sourceInfo
      ),
      rollable: ["msb"].includes(attribute) ? "rollable" : "",
    }),
  );
  // Insert Concentration element between MSB and MSD
  attributeGrid.splice(2, 0, {
    attribute: "concentration",
    total: actor.system.spheres.concentration.total ?? 0,
    label: localize("PF1.Concentration"),
    path: "@spheres.concentration.total",
    sources: [...actor.sourceDetails["system.spheres.concentration.total"]],
    cappedSources: [],
    rollable: "rollable",
  });

  // const spellPool = actor.items.getName("Spell Pool");
  // attributeGrid.push({
  //   attribute: "spellPool",
  //   total: spellPool && "uses" in spellPool.data.data ? spellPool?.data.data.uses?.value ?? 0 : 0,
  //   label: "Spell Pool", // TODO: localise, or use item tag?
  //   path: spellPool
  //     ? spellPool.data.data.useCustomTag
  //       ? `@resources.${spellPool.data.data.tag}`
  //       : "@resources.spellPool.value"
  //     : "",
  //   sources: [],
  //   cappedSources: [],
  //   rollable: "",
  // });

  attributeGrid.push({
    attribute: "bab",
    total: actor.system.attributes.bab.total,
    label: localize("PF1.BABAbbr"),
    path: `@attributes.bab.total`,
    sources: (actor.sourceDetails["system.attributes.bab.total"] ?? []).filter(
      (info) => !(info.name in CONFIG.PF1.bonusModifiers), // TODO: Remove when Changes can opt out of sourceInfo
    ),
    cappedSources: [],
    rollable: "",
  });
  // const martialFocus = actor.items.getName("Martial Focus");
  // attributeGrid.push({
  //   attribute: "martialFocus",
  //   total:
  //     martialFocus && "uses" in martialFocus.data.data
  //       ? martialFocus?.data.data.uses?.value ?? 0
  //       : 0,
  //   label: "Martial Focus", // TODO: localise, or use item tag?
  //   path: martialFocus
  //     ? martialFocus?.data.data.useCustomTag
  //       ? `@resources.${martialFocus?.data.data.tag}.value`
  //       : "@resources.martialFocus.value"
  //     : "",
  //   sources: [],
  //   cappedSources: [],
  //   rollable: "",
  // });

  const levelLabels = {
    magic: localize("CL"),
    combat: localize("PF1.BABAbbr"),
  };

  // Get owned talents and collect info for every sphere regardless of talents
  const ownedTalents = actor.items.reduce((talents: TalentMap, item) => {
    const sphere = item.flags.pf1spheres?.sphere;
    if (
      item.type === "feat" &&
      ["combatTalent", "magicTalent"].includes(item.system.subType) &&
      sphere
    ) {
      talents[sphere] ??= [];
      talents[sphere]?.push(getTalentTemplateData(item));
    }
    return talents;
  }, {});
  const sphereCLs = Object.keys(PF1S.magicSpheres).map(
    (sphere): SphereData => ({
      sphere,
      label: PF1S.magicSpheres[sphere],
      levelLabel: levelLabels.magic,
      total: spheres.cl[sphere].total ?? 0,
      path: `@spheres.cl.${sphere}.total`,
      icon:
        PF1S.sphereIcons[sphere as keyof typeof PF1S.sphereIcons] ??
        CONFIG.Item.documentClass.DEFAULT_ICON,
      talents: ownedTalents[sphere] ?? [],
      talentCounts: spheres.talents[sphere],
      hasTalents: Boolean(ownedTalents[sphere]?.length),
      expandTalents: Boolean(app.spheresTab.expandedSpheres[sphere] ?? false),
      ...getSphereClSources(actor)(sphere),
    }),
  );
  const sphereBabs = Object.keys(PF1S.combatSpheres).map(
    (sphere): SphereData => ({
      sphere,
      label: PF1S.combatSpheres[sphere],
      levelLabel: levelLabels.combat,
      total: actor.system.spheres?.bab[sphere].total ?? 0,
      path: `@spheres.bab.${sphere}.total`,
      icon: PF1S.sphereIcons[sphere],
      talents: ownedTalents[sphere] ?? [],
      talentCounts: spheres.talents[sphere],
      hasTalents: Boolean(ownedTalents[sphere]?.length),
      expandTalents: Boolean(app.spheresTab.expandedSpheres[sphere] ?? false),
      ...getSphereBabSources(actor)(sphere),
    }),
  );

  return {
    dataGroup: "primary",
    attributeGrid,
    sphereCLs,
    sphereBabs,
    allSpheres: [...sphereCLs, ...sphereBabs].sort((a, b) => a.sphere.localeCompare(b.sphere)),
  };
};

const getRenderedSpheresTab = (data: SpheresTemplateData) =>
  renderPf1sTemplate("actor-spheres-tab", data);

const activateListeners = (app: ActorSheetPF, html: JQuery<HTMLElement>, actor: ActorPF) => {
  html.find(".msb>.attribute-name.rollable").on("click", _onMsbRoll(actor));
  html.find(".concentration>.attribute-name.rollable").on("click", _onConcentrationRoll(actor));

  html.find(".expand-sphere").on("click", _toggleSphereTalentsDisplay(app));

  html
    .find(".talent-name")
    // @ts-expect-error Weird contextmenu types?
    .on("contextmenu", pf1.applications.actor.ActorSheetPF.prototype._onItemEdit.bind(app));

  // TODO: Decide upon own solution for rolling – depends on how talents should be activated
  html
    .find(".talent-use>img")
    .on("click", pf1.applications.actor.ActorSheetPF.prototype._quickAction.bind(app));

  html.find(".sphere-label").on("click", _openSphereJournal);
};

const getTalentTemplateData = (item: ItemPF): TalentTemplateData => ({
  id: item.id ?? "",
  img: item.img ?? pf1.config.defaultIcons.items.feat,
  name: item.name ?? "",
  tags: item.system.tags.flat(),
  hasAction: item.hasAction,
  activationType: item.getLabels().activation,
});

interface TalentTemplateData {
  id: string;
  img: string;
  name: string;
  tags: string[];
  hasAction: boolean;
  activationType: string;
}

const _onMsbRoll = (actor: ActorPF) => (ev: JQuery.ClickEvent<HTMLElement>) => {
  ev.preventDefault();
  return actor.spheres.rollMsb({ skipDialog: pf1.documents.settings.getSkipActionPrompt() });
};

const _onConcentrationRoll = (actor: ActorPF) => (ev: JQuery.ClickEvent<HTMLElement>) => {
  ev.preventDefault();
  return actor.spheres.rollConcentration({
    skipDialog: pf1.documents.settings.getSkipActionPrompt(),
  });
};

/**
 * Opens a journal entry sheet for the clicked on sphere
 *
 * @param event - The click event for a sphere label
 */
const _openSphereJournal = async (event: JQuery.ClickEvent<HTMLElement>) => {
  event.preventDefault();

  const sphere = $(event.currentTarget).parents(".sphere").data("sphere") as Sphere | undefined;
  enforce(sphere);
  const sphereType = getSphereType(sphere);
  enforce(sphereType);

  const pack = getGame().packs.get(`pf1spheres.${sphereType}-spheres`);
  enforce(pack);
  const documents = (await pack.getDocuments()) as StoredDocument<JournalEntry>[];
  // @ts-expect-error v10 types, flags are top level property now
  const targetDocument = documents.find((d) => d.flags.pf1spheres?.sphere === sphere);
  targetDocument?.sheet?.render(true);
};

const _toggleSphereTalentsDisplay = (app: ActorSheetPF) => (ev: JQuery.ClickEvent<HTMLElement>) => {
  ev.preventDefault();

  // TODO: Look for pure JS alternative?
  const sphere = $(ev.currentTarget).parents(".sphere").data("sphere") as Sphere;
  const talents = $(ev.currentTarget).parents(".sphere").find(".sphere-talents");
  talents.slideToggle({
    duration: "fast",
    complete: function () {
      if ($(this).is(":visible")) {
        $(this).css("display", "grid");
        app.spheresTab.expandedSpheres[sphere] = true;
      } else {
        app.spheresTab.expandedSpheres[sphere] = false;
      }
    },
    start: function () {
      $(this).css("display", "grid");
    },
  });

  ev.currentTarget.querySelector("i").classList.toggle("rotate-arrow");
};

const getSphereClSources =
  (actor: ActorPF) =>
  (sphere: MagicSphere): { sources: SourceEntry[]; cappedSources: SourceEntry[] } => {
    const baseSources = actor.sourceDetails["system.spheres.cl.base"] ?? [];
    const cappedBaseSources = actor.sourceDetails["system.spheres.cl.modCap"] ?? [];
    const sphereSources = actor.sourceDetails[`system.spheres.cl.${sphere}.total` as const] ?? [];
    const cappedSources = actor.sourceDetails[`system.spheres.cl.${sphere}.modCap` as const] ?? [];
    return {
      sources: [...baseSources, ...sphereSources].filter(
        (info) => !(info.name in CONFIG.PF1.bonusModifiers), // TODO: Remove when Changes can opt out of sourceInfo
      ),
      cappedSources: [...cappedBaseSources, ...cappedSources].filter(
        (info) => !(info.name in CONFIG.PF1.bonusModifiers), // TODO: Remove when Changes can opt out of sourceInfo
      ),
    };
  };

const getSphereBabSources = (actor: ActorPF) => (sphere: CombatSphere) => {
  const baseSources = actor.sourceDetails["system.attributes.bab.total"] ?? [];
  const sphereSources = actor.sourceDetails[`system.spheres.bab.${sphere}.total` as const] ?? [];
  const cappedSources = actor.sourceDetails[`system.spheres.bab.${sphere}.modCap` as const] ?? [];
  return {
    sources: [...baseSources, ...sphereSources].filter(
      (info) => !(info.name in CONFIG.PF1.bonusModifiers), // TODO: Remove when Changes can opt out of sourceInfo
    ),
    cappedSources: cappedSources.filter(
      (info) => !(info.name in CONFIG.PF1.bonusModifiers), // TODO: Remove when Changes can opt out of sourceInfo
    ),
  };
};

interface ActorSheetPFData {
  actor: ActorPF;
}

export declare class ActorSheetPF extends ActorSheet {
  _onItemEdit: (ev: JQuery.ClickEvent<HTMLElement>) => void;
  _quickAction: (ev: JQuery.ClickEvent<HTMLElement>) => void;
  spheresTab: {
    activateTab: string | false;
    expandedSpheres: Partial<Record<Sphere, boolean>>;
  };
}

interface SpheresTemplateData {
  dataGroup: string;
  attributeGrid: AttributeData[];
  sphereCLs: SphereData[];
  sphereBabs: SphereData[];
  allSpheres: SphereData[];
}

interface SphereData {
  sphere: MagicSphere | CombatSphere;
  label: string;
  levelLabel: string;
  total: number;
  path: string;
  icon: string;
  talents: TalentTemplateData[];
  hasTalents: boolean;
  sources: SourceEntry[];
  expandTalents: boolean;
  talentCounts: SpheresTalentsRecord[Sphere];
}

type TalentMap = {
  [Key in Sphere]?: TalentTemplateData[];
};

//type ItemProperties = ToObjectFalseType<ItemPF["data"]>;

interface AttributeData {
  attribute?: "cl" | "msb" | "concentration" | "msd" | "bab" | "martialFocus" | "spellPool";
  sphere?: Sphere;
  total: number;
  label: string;
  path: string;
  sources: SourceEntry[];
  cappedSources: SourceEntry[];
  rollable: "rollable" | "";
}
