import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";

export default (components: OBC.Components, world: OBC.World) => {
  const { camera } = world;

  const onFitModel = () => {
    if (camera instanceof OBC.OrthoPerspectiveCamera && world.meshes.size > 0) {
      camera.fit(world.meshes, 0.5);
    }
  };

  const onFitSelected = () => {
    const highlighter = components.get(OBF.Highlighter);
    highlighter.zoomToSelection = !highlighter.zoomToSelection;
  };

  const onLock = (e: Event) => {
    const button = e.target as BUI.Button;
    camera.enabled = !camera.enabled;
    button.active = !camera.enabled;
    button.label = camera.enabled ? "Disable" : "Enable";
    button.icon = camera.enabled
      ? "tabler:lock-filled"
      : "majesticons:unlock-open";
  };

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
    <div class="Camara">
      <bim-toolbar-section label="Camara" icon="ph:camera-fill" style="pointer-events: auto">
        <bim-button label="Zoom a modelo" icon="material-symbols:fit-screen-rounded" tooltip-title="Zoom a modelo"
            tooltip-text="Hace zoom al modelo completo" @click=${onFitModel}></bim-button>
        <bim-button label="Zoom a seleccion" icon="material-symbols:fit-screen-rounded" tooltip-title="Zoom a seleccion"
            tooltip-text="Hace zoom a lo que se selecciona" @click=${onFitSelected}></bim-button>
        <bim-button label="Bloquear" icon="tabler:lock-filled" tooltip-title="Bloquear"
            tooltip-text="Bloquea la visualización" @click=${onLock} .active=${!camera.enabled}></bim-button>
        
        <bim-dropdown required label="Proyección de la camara" 
            @change="${({ target }: { target: BUI.Dropdown }) => {
              const selected = target.value[0] as OBC.CameraProjection;
              world.camera.projection.set(selected);
            }}">
          <bim-option checked label="Perspectiva"></bim-option>
          <bim-option label="Orthografica></bim-option>
        </bim-dropdown>
      </bim-toolbar-section>
      </div>
    `;
  });
};
