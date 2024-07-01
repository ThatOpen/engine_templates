import * as OBC from '@thatopen/components';
import * as OBF from '@thatopen/components-front';
import * as BUI from '@thatopen/ui';
import * as OBCF from '@thatopen/components-front';

export default (components: OBC.Components, world?: OBC.World) => {
  const highlighter = components.get(OBF.Highlighter);

  const Volumen = async () => {
    const selected = highlighter.selection.select;
    if (!Object.keys(selected).length) return;

    const volumeMeasurement = components.get(OBCF.VolumeMeasurement);
    volumeMeasurement.world = world;
    volumeMeasurement.enabled = true;

    const volume = volumeMeasurement.getVolumeFromFragments(selected);
    console.log(volume);
  };

  // Función para manejar la medición de ángulos
  const Angulos = () => {
    const angles = components.get(OBCF.AngleMeasurement);
    angles.world = world;
    angles.enabled = true;
    // Aquí puedes añadir lógica adicional para la creación de mediciones de ángulos
    console.log('Medición de ángulos activada');
  };

  // Función para manejar la medición de áreas
  const Areas = () => {
    const areas = components.get(OBCF.AreaMeasurement);
    areas.world = world;
    areas.enabled = true;
    // Aquí puedes añadir lógica adicional para la creación de mediciones de áreas
    console.log('Medición de áreas activada');
  };

  // Añadir la funcionalidad de medición de bordes mediante un botón
  const EdgeMeasurement = () => {
    const dimensions = components.get(OBCF.EdgeMeasurement);
    dimensions.world = world;
    dimensions.enabled = true;
    dimensions.create();

    console.log('Medición de bordes activada mediante botón');
  };

  const FaceMeasurement = () => {
    const dimensions = components.get(OBCF.FaceMeasurement);
    dimensions.world = world;
    dimensions.enabled = true;
    dimensions.create();
    console.log('Medición de caras activada mediante botón');
  };
  const LengthMeasurement = () => {
    const dimensions = components.get(OBCF.LengthMeasurement);
    dimensions.world = world;
    dimensions.enabled = true;
    dimensions.create();
    console.log('Medición de longitud activada mediante botón');
  };

  // Update the toolbar component to include the LengthMeasurement button
  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
    <div class="Medidas">
      <bim-toolbar-section label="Medidas" icon="ph:cursor-fill">
        <bim-button @click=${Volumen} label="Volumen" icon="ri:cube-line" tooltip-title="Volumen" tooltip-text="Mide el volumen de los objetos."></bim-button>
        <bim-button @click=${Angulos} label="Ángulos" icon="ri:compasses-2-line" tooltip-title="Ángulos" tooltip-text="Mide ángulos entre elementos."></bim-button>
        <bim-button @click=${Areas} label="Áreas" icon="ri:shape-line" tooltip-title="Áreas" tooltip-text="Mide áreas de superficies."></bim-button>
        <bim-button @click=${FaceMeasurement} label="Medir Caras" icon="ri:shape-2-line" tooltip-title="Medir Caras" tooltip-text="Activa la medición de caras de los objetos."></bim-button>
        <bim-button @click=${EdgeMeasurement} label="Bordes" icon="ri:ruler-line" tooltip-title="Bordes" tooltip-text="Mide los bordes de los objetos."></bim-button>
        <bim-button @click=${LengthMeasurement} label="Longitud" icon="ri:ruler-2-line" tooltip-title="Longitud" tooltip-text="Mide la longitud de los objetos."></bim-button>
      </bim-toolbar-section> 
    </div>
`;
  });
};
