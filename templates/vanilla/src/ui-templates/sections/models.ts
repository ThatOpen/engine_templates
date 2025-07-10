import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import { appIcons } from "../../globals";

export interface ModelsPanelState {
  components: OBC.Components;
}

export const modelsPanelTemplate: BUI.StatefullComponent<ModelsPanelState> = (
  state,
) => {
  const { components } = state;

  const ifcLoader = components.get(OBC.IfcLoader);
  const fragments = components.get(OBC.FragmentsManager);

  const [modelsList] = CUI.tables.modelsList({
    components,
    actions: { download: false },
  });

  const onAddIfcModel = async ({ target }: { target: BUI.Button }) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = ".ifc";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      target.loading = true;
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      await ifcLoader.load(bytes, true, file.name.replace(".ifc", ""));
      target.loading = false;
      BUI.ContextMenu.removeMenus();
    });

    input.addEventListener("cancel", () => (target.loading = false));

    input.click();
  };

  const onAddFragmentsModel = async ({ target }: { target: BUI.Button }) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = ".frag";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      target.loading = true;
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      await fragments.core.load(bytes, {
        modelId: file.name.replace(".frag", ""),
      });
      target.loading = false;
      BUI.ContextMenu.removeMenus();
    });

    input.addEventListener("cancel", () => (target.loading = false));

    input.click();
  };

  const onSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    modelsList.queryString = input.value;
  };

  return BUI.html`
    <bim-panel-section fixed icon=${appIcons.MODEL} label="Models">
      <div style="display: flex; gap: 0.5rem;">
        <bim-text-input @input=${onSearch} vertical placeholder="Search..." debounce="200"></bim-text-input>
        <bim-button style="flex: 0;" icon=${appIcons.ADD}>
          <bim-context-menu style="gap: 0.25rem;">
            <bim-button label="IFC" @click=${onAddIfcModel}></bim-button>
            <bim-button label="Fragments" @click=${onAddFragmentsModel}></bim-button>
          </bim-context-menu> 
        </bim-button>
      </div>
      ${modelsList}
    </bim-panel-section> 
  `;
};
