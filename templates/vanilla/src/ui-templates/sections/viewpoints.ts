import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { appIcons } from "../../globals";

export interface ViewpointsPanelState {
  components: OBC.Components;
  world?: OBC.World;
}

export const viewpointsPanelTemplate: BUI.StatefullComponent<
  ViewpointsPanelState
> = (state) => {
  const { components, world } = state;

  const [viewpoints] = CUI.tables.viewpointsList({ components });

  const onCreate = async ({ target }: { target: BUI.Button }) => {
    target.loading = true;
    const manager = components.get(OBC.Viewpoints);
    const highlighter = components.get(OBF.Highlighter);
    const fragments = components.get(OBC.FragmentsManager);

    const viewpoint = manager.create();
    viewpoint.world = world ?? null;
    await viewpoint.updateCamera();

    // Add elements from current selection
    const selection = highlighter.selection.select;
    if (!OBC.ModelIdMapUtils.isEmpty(selection)) {
      const guids = await fragments.modelIdMapToGuids(selection);
      viewpoint.selectionComponents.add(...guids);
    }

    // Update the viewpoint colors based on the highlighter
    for (const [style, definition] of highlighter.styles) {
      if (!definition) continue;
      const map = highlighter.selection[style];
      if (OBC.ModelIdMapUtils.isEmpty(map)) continue;
      const guids = await fragments.modelIdMapToGuids(map);
      viewpoint.componentColors.set(definition.color.getHexString(), guids);
    }

    target.loading = false;
  };

  return BUI.html`
    <bim-panel-section fixed icon=${appIcons.CAMERA} label="Viewpoints">
      <bim-button style="flex: 0;" label="Add" icon=${appIcons.ADD} @click=${onCreate}></bim-button> 
      ${viewpoints}
    </bim-panel-section>
  `;
};
