import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as FRAGS from "@thatopen/fragments";

interface GroupingsUIState {
  components: OBC.Components;
}

const serializeFragmentIdMap = (fragmentIdMap: FRAGS.FragmentIdMap) => {
  const map: Record<string, number[]> = {};
  for (const fragmentID in fragmentIdMap) {
    map[fragmentID] = [...fragmentIdMap[fragmentID]];
  }
  return JSON.stringify(map);
};

export default (state: GroupingsUIState) => {
  const { components } = state;
  const classifier = state.components.get(OBC.Classifier);

  const computeTableData = (components: OBC.Components) => {
    const classifier = components.get(OBC.Classifier);
    const data: BUI.TableGroupData[] = [];
    if ("CustomSelections" in classifier.list) {
      const customSelections = classifier.list.CustomSelections;
      for (const group in customSelections) {
        const fragmentIdMap = customSelections[group].map;
        const groupRow: BUI.TableGroupData = {
          data: {
            Name: group,
            fragmentIdMap: serializeFragmentIdMap(fragmentIdMap),
          },
        };
        data.push(groupRow);
      }
    }
    return data;
  };

  const table = document.createElement("bim-table");
  table.headersHidden = true;
  table.hiddenColumns = ["fragmentIdMap"];

  table.dataTransform = {
    Name: (value) => {
      if (typeof value !== "string") return value;
      const onDeleteGroup = () => {
        if (!("CustomSelections" in classifier.list)) return;
        delete classifier.list.CustomSelections[value];
        table.data = computeTableData(state.components);
      };

      return BUI.html`
      <div style=" display: flex; justify-content: space-between; flex: 1; align-items: center;">
        <bim-label>${value}</bim-label>
        <bim-button @click=${onDeleteGroup} style="flex: 0" icon="majesticons:delete-bin"></bim-button>
      </div> 
      `;
    },
  };

  table.addEventListener("cellcreated", ({ detail }) => {
    const { cell } = detail;
    cell.style.padding = "0.25rem 0";
  });

  table.addEventListener("rowcreated", ({ detail }) => {
    const { row } = detail;
    const { fragmentIdMap } = row.data;
    if (typeof fragmentIdMap !== "string") return;
    const idMap = JSON.parse(fragmentIdMap);
    if (Object.keys(idMap).length === 0) return;
    const highlighter = components.get(OBF.Highlighter);
    row.onmouseover = () => {
      row.style.setProperty("--bim-label--c", "var(--bim-ui_accent-base)");
      row.style.cursor = "pointer";
      highlighter.highlightByID(
        "hover",
        idMap,
        true,
        false,
        highlighter.selection.select,
      );
    };

    row.onmouseleave = () => {
      row.style.removeProperty("--bim-label--c");
      row.style.cursor = "default";
      highlighter.clear("hover");
    };

    row.onclick = () => {
      highlighter.highlightByID("select", idMap, true);
    };
  });

  return BUI.Component.create<BUI.Table, GroupingsUIState>(
    (state: GroupingsUIState) => {
      table.data = computeTableData(state.components);
      return BUI.html`${table}`;
    },
    state,
  );
};
