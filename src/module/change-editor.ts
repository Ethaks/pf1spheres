/*
 * SPDX-FileCopyrightText: 2024 Ethaks <ethaks@pm.me>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ItemChange, ItemPF } from "./item-data";

/**
 * Modify a ChangeEditor's html when it is rendered.
 *
 * @param app - The ChangeEditor instance
 * @param html - The rendered HTML element
 * @param _data - The data used to render the ChangeEditor
 */
export const onChangeEditorRender = (
  app: ChangeEditor,
  html: JQuery<HTMLElement>,
  _data: Record<string, unknown>,
) => {
  // Remove "Sphere Caster Level Capped at HD" bonus modifier choice from non-Sphere CL changes
  // @ts-expect-error ItemChange DataModels now have immediate properties; wait for DataModel types
  if (!app.change.type.startsWith("spherecl"))
    html[0]
      .querySelector("select.change-type")
      ?.querySelector(`option[value="sphereCLCap`)
      ?.remove();
};

declare abstract class ChangeEditor extends FormApplication<FormApplicationOptions, ItemPF> {
  change: ItemChange;
}
