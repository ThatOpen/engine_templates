import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import { ViewerToolbarState, viewerToolbarTemplate } from "..";
import { appIcons } from "../../globals";

type BottomToolbar = { name: "bottomToolbar"; state: ViewerToolbarState };
type LeftToolbar = { name: "leftToolbar"; state: {} };

type ViewportGridElements = [BottomToolbar, LeftToolbar];

type ViewportGridLayouts = ["main"];

interface ViewportGridState {
  components: OBC.Components;
  world: OBC.World;
}

export const viewportGridTemplate: BUI.StatefullComponent<ViewportGridState> = (
  state,
) => {
  const { components, world } = state;

  const leftToolbarTemplate: BUI.StatefullComponent = (_: {}, update) => {
    const highlighter = components.get(OBF.Highlighter);
    const lengthMeasurer = components.get(OBF.LengthMeasurement);
    const areaMeasurer = components.get(OBF.AreaMeasurement);
    const clipper = components.get(OBC.Clipper);

    const areMeasurementsEnabled =
      lengthMeasurer.enabled || areaMeasurer.enabled;

    const disableAll = (exceptions?: ("clipper" | "length" | "area")[]) => {
      BUI.ContextMenu.removeMenus();
      highlighter.clear("select");
      highlighter.enabled = false;
      if (!exceptions?.includes("length")) lengthMeasurer.enabled = false;
      if (!exceptions?.includes("area")) areaMeasurer.enabled = false;
      if (!exceptions?.includes("clipper")) clipper.enabled = false;
    };

    const onLengthMeasurement = () => {
      disableAll(["length"]);
      lengthMeasurer.enabled = !lengthMeasurer.enabled;
      highlighter.enabled = !lengthMeasurer.enabled;
      update();
    };

    const onAreaMeasurement = () => {
      disableAll(["area"]);
      areaMeasurer.enabled = !areaMeasurer.enabled;
      highlighter.enabled = !areaMeasurer.enabled;
      update();
    };

    const onModelSection = () => {
      disableAll(["clipper"]);
      clipper.enabled = !clipper.enabled;
      highlighter.enabled = !clipper.enabled;
      update();
    };

    const onMeasurementsClick = () => {
      lengthMeasurer.enabled = false;
      areaMeasurer.enabled = false;
      update();
    };

    return BUI.html`
      <bim-toolbar style="align-self: start;" vertical>
        <bim-toolbar-section>
          <bim-button @click=${onMeasurementsClick} ?active=${areMeasurementsEnabled} label="Measurements" tooltip-title="Measurements" icon=${appIcons.RULER}>
            <bim-context-menu>
              <bim-button ?active=${lengthMeasurer.enabled} label="Length" @click=${onLengthMeasurement}></bim-button>
              <bim-button ?active=${areaMeasurer.enabled} label="Area" @click=${onAreaMeasurement}></bim-button>
            </bim-context-menu>
          </bim-button>
          <bim-button ?active=${clipper.enabled} @click=${onModelSection} label="Section" tooltip-title="Model Section" icon=${appIcons.CLIPPING}></bim-button> 
        </bim-toolbar-section>
      </bim-toolbar>
    `;
  };

  const elements: BUI.GridComponents<ViewportGridElements> = {
    leftToolbar: { template: leftToolbarTemplate, initialState: {} },
    bottomToolbar: {
      template: viewerToolbarTemplate,
      initialState: { components, world },
    },
  };

  const onCreated = (e?: Element) => {
    if (!e) return;
    const grid = e as BUI.Grid<ViewportGridLayouts, ViewportGridElements>;
    grid.elements = elements;

    grid.layouts = {
      main: {
        template: `
          "leftToolbar messages rightToolbar" auto
          "leftToolbar empty rightToolbar" 1fr
          "bottomToolbar bottomToolbar bottomToolbar" auto
          /auto 1fr auto
        `,
      },
    };
  };

  return BUI.html`<bim-grid ${BUI.ref(onCreated)} layout="main" floating></bim-grid>`;
};
