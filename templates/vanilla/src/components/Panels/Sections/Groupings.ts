import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import customSelections from "../../Tables/CustomSelections";

export default (components: OBC.Components) => {
  const [customSelectionsTable, updateCustomSelections] = customSelections({
    components,
  });
  const highlighter = components.get(OBF.Highlighter);

  let newSelectionForm: HTMLDivElement;
  let groupNameInput: BUI.TextInput;
  let saveSelectionBtn: BUI.Button;

  const onFormCreated = (e?: Element) => {
    if (!e) return;
    newSelectionForm = e as HTMLDivElement;
    highlighter.events.select.onClear.add(() => {
      newSelectionForm.style.display = "none";
    });
  };

  const onGroupNameInputCreated = (e?: Element) => {
    if (!e) return;
    groupNameInput = e as BUI.TextInput;
    highlighter.events.select.onClear.add(() => {
      groupNameInput.value = "";
    });
  };

  const onSaveSelectionCreated = (e?: Element) => {
    if (!e) return;
    saveSelectionBtn = e as BUI.Button;
    highlighter.events.select.onHighlight.add(() => {
      saveSelectionBtn.style.display = "block";
    });
    highlighter.events.select.onClear.add(() => {
      saveSelectionBtn.style.display = "none";
    });
  };

  const onSaveGroupSelection = async () => {
    const groupName = groupNameInput.value;
    if (!(groupNameInput && groupName.trim() !== "")) return;
    newSelectionForm.style.display = "none";
    saveSelectionBtn.style.display = "none";
    const classifier = components.get(OBC.Classifier);
    const customSelections = classifier.list.CustomSelections;
    customSelections[groupName] = {
      name: groupName,
      map: highlighter.selection.select,
      id: null,
    };
    updateCustomSelections();
    groupNameInput.value = "";
  };

  const onNewSelection = () => {
    const selectionLength = Object.keys(highlighter.selection.select).length;
    if (!(newSelectionForm && selectionLength !== 0)) return;
    newSelectionForm.style.display = "flex";
  };

  const onCancelGroupCreation = () => {
    if (!newSelectionForm) return;
    newSelectionForm.style.display = "none";
    groupNameInput.value = "";
  };

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-panel-section label="Custom Selections" icon="clarity:blocks-group-solid">
        <div ${BUI.ref(onFormCreated)} style="display: none; gap: 0.5rem">
          <bim-text-input ${BUI.ref(onGroupNameInputCreated)} placeholder="Selection Name..." vertical></bim-text-input>
          <bim-button @click=${onSaveGroupSelection} icon="mingcute:check-fill" style="flex: 0" label="Accept"></bim-button>
          <bim-button @click=${onCancelGroupCreation} icon="mingcute:close-fill" style="flex: 0" label="Cancel"></bim-button>
        </div>
        ${customSelectionsTable}
        <bim-button style="display: none;" ${BUI.ref(onSaveSelectionCreated)} @click=${onNewSelection} label="Save Selection"></bim-button>
      </bim-panel-section>
    `;
  });
};
