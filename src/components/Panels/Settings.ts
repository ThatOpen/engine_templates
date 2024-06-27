import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";

export default (components: OBC.Components) => {
  const html = document.querySelector("html")!;
  const onThemeChange = (event: Event) => {
    const selector = event.target as BUI.Selector;
    if (
      selector.value === undefined ||
      selector.value === null ||
      selector.value === 0
    ) {
      html.classList.remove("bim-ui-dark", "bim-ui-light");
    } else if (selector.value === 1) {
      html.className = "bim-ui-dark";
    } else if (selector.value === 2) {
      html.className = "bim-ui-light";
    }
  };

  const [worldsTable] = CUI.tables.worldsConfiguration({ components });

  const onWorldConfigSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    worldsTable.queryString = input.value;
  };

  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="Aspect" icon="mage:box-3d-fill">
          <bim-selector vertical @change=${onThemeChange}>
            <bim-option
              value="0"
              label="System"
              icon="majesticons:laptop"
              .checked=${
                !html.classList.contains("bim-ui-dark") &&
                !html.classList.contains("bim-ui-light")
              }>
            </bim-option>
            <bim-option value="1" label="Dark" icon="solar:moon-bold" .checked=${html.classList.contains("bim-ui-dark")}></bim-option>
            <bim-option value="2" label="Light" icon="solar:sun-bold" .checked=${html.classList.contains("bim-ui-light")}></bim-option>
          </bim-selector>
        </bim-panel-section>
        <bim-panel-section label="Worlds" icon="tabler:world">
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${onWorldConfigSearch} vertical placeholder="Search..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0;" @click=${() => (worldsTable.expanded = !worldsTable.expanded)} icon="eva:expand-fill"></bim-button>
          </div>
          ${worldsTable}
        </bim-panel-section>
      </bim-panel> 
    `;
  });
};
