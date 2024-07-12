import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";

export default (components: OBC.Components) => {
  const html = document.querySelector("html")!;
  const onThemeChange = () => {
    // Siempre establece el tema claro, independientemente de la selección
    html.className = "bim-ui-light";
  };

  const [worldsTable] = CUI.tables.worldsConfiguration({ components });

  const onWorldConfigSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    worldsTable.queryString = input.value;
  };

  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="Aspecto" icon="mage:box-3d-fill">
          <bim-selector vertical @change=${onThemeChange}>
            <!-- Solo opción para tema claro -->
            <bim-option value="1" label="Claro" icon="solar:sun-bold" .checked=${true}></bim-option>
          </bim-selector>
        </bim-panel-section>
        <bim-panel-section label="General" icon="tabler:world">
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${onWorldConfigSearch} vertical placeholder="Buscar..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0;" @click=${() =>
              (worldsTable.expanded =
                !worldsTable.expanded)} icon="eva:expand-fill"></bim-button>
          </div>
          ${worldsTable}
        </bim-panel-section>
      </bim-panel> 
    `;
  });
};
