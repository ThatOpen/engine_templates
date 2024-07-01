import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';
import * as OBCF from '@thatopen/components-front';

interface GroupingsUIState {
  components: OBC.Components;
}

export default (state: GroupingsUIState) => {
  const { components } = state;
  const computeTableData = (components: OBC.Components) => {
    const dimensions = components.get(OBCF.FaceMeasurement);

    const data: BUI.TableGroupData[] = [];

    if (dimensions.selection.length > 0) {
      for (const selection of dimensions.selection) {
        const groupRow: BUI.TableGroupData = {
          data: { area: selection.area },
        };
        data.push(groupRow);
      }
    }
    return data;
  };

  const table = document.createElement('bim-table');
  table.headersHidden = true;

  table.dataTransform = {
    area: (area) => {
      return BUI.html`
      <div style=" display: flex; justify-content: space-between; flex: 1; align-items: center;">
	  <bim-label>Área - ${area} m2</bim-label>
      </div> 
      `;
    },
  };

  return BUI.Component.create<BUI.Table, GroupingsUIState>((state: GroupingsUIState) => {
    table.data = computeTableData(state.components);
    return BUI.html`${table}`;
  }, state);
};
