/*
 * SPDX-FileCopyrightText: 2022 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { JournalEntryDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/journalEntryData";
import type { Sphere } from "../../item-data";
import { getAllSpheres, getSphereConfig, getSphereType } from "../../item-util";
import { getGame } from "../../util";
import { isBannedTalent } from "./items";
import { importData } from "./pack-util";
import type { BasePackConfig, DataImportOptions } from "./pack-util-data";
import { RawSphereJournalData } from "./pack-util-data";

export const importSpheres = async (options: DataImportOptions = {}) => {
  const talents = [
    ...((await getGame().packs.get("pf1spheres.combat-talents")?.getDocuments()) ?? []),
    ...((await getGame().packs.get("pf1spheres.magic-talents")?.getDocuments()) ?? []),
  ] as StoredDocument<Item>[];

  const config: BasePackConfig<RawSphereJournalData, "JournalEntry", JournalEntryDataSource> = {
    docType: "JournalEntry",
    packNames: ["Magic Spheres", "Combat Spheres"],
    fileNames: ["spheres.json"],
    transformFunction: getSphereJournalDataWithContext({ talents }),
    decoder: RawSphereJournalData,
    orderByFunction: orderSphereJournal,
  };

  return importData(config, options);
};

const stripTocRegex = /\s(\[|\().*/gm;

const getTalent = (talents: StoredDocument<Item>[]) => (sphere: Sphere, talent: string) =>
  talents.find((t) => t.data.flags.pf1spheres?.sphere === sphere && t.name?.startsWith(talent));

const isHeader = (text: string) => ["Talents", "Archetypes", "Feats"].some((s) => text.endsWith(s));

const getSphereJournalDataWithContext =
  (context: { talents: StoredDocument<Item>[] }) =>
  (entry: RawSphereJournalData): DeepPartial<JournalEntryDataSource> => {
    const { name: sphere, text, toc } = entry;
    const name = getAllSpheres()[sphere];
    const sphereData = getSphereConfig(sphere);
    const icon = sphereData.icon || CONFIG.Item.documentClass.DEFAULT_ICON;

    const cleanToc = toc.replace(stripTocRegex, "");

    const tocList = cleanToc
      .split("\n")
      .filter(isBannedTalent)
      .map((talent) => {
        const item = getTalent(context.talents)(sphere, talent);
        if (isHeader(talent)) return `</ul><br><b>${talent}</b><br><ul>`;
        else if (item) return `<li>${item.link}</li>`;
        else return `<li>${talent}</li>`;
      })
      .join("\n");

    const journalText = text + "<br>\n" + tocList + "</ul>";
    return { name, img: icon, content: journalText, flags: { pf1spheres: { sphere: sphere } } };
  };

const orderSphereJournal = (journal: DeepPartial<JournalEntryDataSource>) => {
  const sphere = journal.flags?.pf1spheres?.sphere;
  if (sphere === undefined) throw new Error(`No sphere was found in data for ${journal.name}`);
  return `${getSphereType(sphere)}-spheres`;
};
