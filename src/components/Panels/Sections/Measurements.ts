import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as OBCF from "@thatopen/components-front";
import measurementsTable from "../../Tables/MeasurementsTable";

export default (components: OBC.Components) => {
  const [MeasurementsTable, updateMeasurementsTable] = measurementsTable({
    components,
  });
  let newSelectionForm: HTMLDivElement;

  const onFormCreated = (e?: Element) => {
    if (!e) return;
    newSelectionForm = e as HTMLDivElement;
    newSelectionForm.style.display = "flex";
  };

  const onMeasurementsClicked = (e?: Element) => {
    if (!e) return;
    updateMeasurementsTable();
  };

  const onDeleteMeasurement = () => {
    const dimensions = components.get(OBCF.FaceMeasurement);
    dimensions.deleteAll();
    updateMeasurementsTable();
  };

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-panel-section @click=${onMeasurementsClicked} label="Medidas" icon="ri:ruler-line">
		<div ${BUI.ref(onFormCreated)} style="display: none; gap: 0.5rem">
			${MeasurementsTable}
		</div>
		<bim-button @click=${onDeleteMeasurement} style="flex: 1" icon="majesticons:delete-bin"></bim-button>
      </bim-panel-section>
    `;
  });
};
