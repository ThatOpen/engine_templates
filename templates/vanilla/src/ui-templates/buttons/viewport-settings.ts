import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { appIcons } from "../../globals";

interface ViewportSettingsState {
  components: OBC.Components;
  world: OBC.SimpleWorld<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBF.PostproductionRenderer
  >;
}

export const viewportSettingsTemplate: BUI.StatefullComponent<
  ViewportSettingsState
> = (state) => {
  const { components, world } = state;

  const grids = components.get(OBC.Grids);

  const worldGrid = grids.list.get(world.uuid);
  let worldEnableCheckbox: BUI.TemplateResult | undefined;
  if (worldGrid) {
    const onToggleGrid = ({ target }: { target: BUI.Checkbox }) => {
      worldGrid.visible = target.checked;
      target.checked = worldGrid.visible;
    };

    worldEnableCheckbox = BUI.html`
      <bim-checkbox style="width: 15rem;" ?checked=${worldGrid.visible} label="Grid" @change=${onToggleGrid}></bim-checkbox>
    `;
  }

  const onProjectionChange = ({ target }: { target: BUI.Dropdown }) => {
    const [projection] = target.value;
    if (!projection) return;
    world.camera.projection.set(projection);
  };

  return BUI.html`
    <bim-button style="position: absolute; top: 0.5rem; right: 0.5rem; background-color: transparent;" icon=${appIcons.SETTINGS}>
      <bim-context-menu style="width: 15rem; gap: 0.25rem">
        ${worldEnableCheckbox}
        <bim-dropdown label="Camera Projection" @change=${onProjectionChange}>
          <bim-option label="Perspective" ?checked=${world.camera.projection.current === "Perspective"}></bim-option> 
          <bim-option label="Orthographic" ?checked=${world.camera.projection.current === "Orthographic"}></bim-option> 
        </bim-dropdown>
      </bim-context-menu> 
    </bim-button>
  `;
};
