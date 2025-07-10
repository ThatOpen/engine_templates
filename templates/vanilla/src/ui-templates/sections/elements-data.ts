import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { appIcons } from "../../globals";

export interface ElementsDataPanelState {
  components: OBC.Components;
}

export const elementsDataPanelTemplate: BUI.StatefullComponent<
  ElementsDataPanelState
> = (state) => {
  const { components } = state;

  // const fragments = components.get(OBC.FragmentsManager);
  const highlighter = components.get(OBF.Highlighter);

  const [propsTable, updatePropsTable] = CUI.tables.itemsData({
    components,
    modelIdMap: {},
  });

  propsTable.preserveStructureOnFilter = true;
  // fragments.onFragmentsDisposed.add(() => updatePropsTable());

  highlighter.events.select.onHighlight.add((modelIdMap) => {
    // const panel = document.getElementById("data")!;
    // panel.style.removeProperty("display");
    updatePropsTable({ modelIdMap });
  });

  highlighter.events.select.onClear.add(() => {
    // const panel = document.getElementById("data")!;
    // panel.style.display = "none";
    updatePropsTable({ modelIdMap: {} });
  });

  const search = (e: Event) => {
    const input = e.target as BUI.TextInput;
    propsTable.queryString = input.value;
  };

  const toggleExpanded = () => {
    propsTable.expanded = !propsTable.expanded;
  };

  const sectionId = BUI.Manager.newRandomId();

  return BUI.html`
    <bim-panel-section fixed id=${sectionId} icon=${appIcons.TASK} label="Selection Data">
      <div style="display: flex; gap: 0.375rem;">
        <bim-text-input @input=${search} vertical placeholder="Search..." debounce="200"></bim-text-input>
        <bim-button style="flex: 0;" @click=${toggleExpanded} icon=${appIcons.EXPAND}></bim-button>
        <bim-button style="flex: 0;" @click=${() => propsTable.downloadData("ElementData", "tsv")} icon=${appIcons.EXPORT} tooltip-title="Export Data" tooltip-text="Export the shown properties to TSV."></bim-button>
      </div>
      ${propsTable}
    </bim-panel-section> 
  `;
};
