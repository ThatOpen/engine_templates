import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { appIcons, tooltips } from "../../globals";

export interface ViewerToolbarState {
  components: OBC.Components;
  world: OBC.World;
}

const originalColors = new Map<
  FRAGS.BIMMaterial,
  { color: number; transparent: boolean; opacity: number }
>();

const setModelTransparent = (components: OBC.Components) => {
  const fragments = components.get(OBC.FragmentsManager);

  const materials = [...fragments.core.models.materials.list.values()];
  for (const material of materials) {
    if (material.userData.customId) continue;
    // save colors
    let color: number | undefined;
    if ("color" in material) {
      color = material.color.getHex();
    } else {
      color = material.lodColor.getHex();
    }

    originalColors.set(material, {
      color,
      transparent: material.transparent,
      opacity: material.opacity,
    });

    // set color
    material.transparent = true;
    material.opacity = 0.05;
    material.needsUpdate = true;
    if ("color" in material) {
      material.color.setColorName("white");
    } else {
      material.lodColor.setColorName("white");
    }
  }
};

const restoreModelMaterials = () => {
  for (const [material, data] of originalColors) {
    const { color, transparent, opacity } = data;
    material.transparent = transparent;
    material.opacity = opacity;
    if ("color" in material) {
      material.color.setHex(color);
    } else {
      material.lodColor.setHex(color);
    }
    material.needsUpdate = true;
  }
  originalColors.clear();
};

export const viewerToolbarTemplate: BUI.StatefullComponent<
  ViewerToolbarState
> = (state) => {
  const { components, world } = state;

  const highlighter = components.get(OBF.Highlighter);
  const hider = components.get(OBC.Hider);

  const onToggleGhost = () => {
    if (originalColors.size) {
      restoreModelMaterials();
    } else {
      setModelTransparent(components);
    }
  };

  let focusBtn: BUI.TemplateResult | undefined;
  if (world.camera instanceof OBC.SimpleCamera) {
    const onFocus = async ({ target }: { target: BUI.Button }) => {
      if (!(world.camera instanceof OBC.SimpleCamera)) return;
      const selection = highlighter.selection.select;
      target.loading = true;
      await world.camera.fitToItems(
        OBC.ModelIdMapUtils.isEmpty(selection) ? undefined : selection,
      );
      target.loading = false;
    };

    focusBtn = BUI.html`<bim-button tooltip-title=${tooltips.FOCUS.TITLE} tooltip-text=${tooltips.FOCUS.TEXT} icon=${appIcons.FOCUS} label="Focus" @click=${onFocus}></bim-button>`;
  }

  const onHide = async ({ target }: { target: BUI.Button }) => {
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
    target.loading = true;
    await hider.set(false, selection);
    target.loading = false;
  };

  const onIsolate = async ({ target }: { target: BUI.Button }) => {
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
    target.loading = true;
    await hider.isolate(selection);
    target.loading = false;
  };

  const onShowAll = async ({ target }: { target: BUI.Button }) => {
    target.loading = true;
    await hider.set(true);
    target.loading = false;
  };

  const colorInputId = BUI.Manager.newRandomId();
  const getColorValue = () => {
    const input = document.getElementById(
      colorInputId,
    ) as BUI.ColorInput | null;
    if (!input) return null;
    return input.color;
  };

  const onApplyColor = async ({ target }: { target: BUI.Button }) => {
    const colorValue = getColorValue();
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection) || !colorValue) return;
    const color = new THREE.Color(colorValue);
    const style = [...highlighter.styles.entries()].find(([, definition]) => {
      if (!definition) return false;
      return definition.color.getHex() === color.getHex();
    });
    target.loading = true;
    if (style) {
      const name = style[0];
      if (name === "select") {
        target.loading = false;
        return;
      }
      await highlighter.highlightByID(name, selection, false, false);
    } else {
      highlighter.styles.set(colorValue, {
        color,
        renderedFaces: FRAGS.RenderedFaces.ONE,
        opacity: 1,
        transparent: false,
      });
      await highlighter.highlightByID(colorValue, selection, false, false);
    }
    await highlighter.clear("select");
    target.loading = false;
  };

  const numberInputId = BUI.Manager.newRandomId();
  const onMeasure = async ({ target }: { target: BUI.Button }) => {
    const input = document.getElementById(numberInputId) as BUI.NumberInput;
    const modelIdMap = highlighter.selection.select;
    if (!(input && !OBC.ModelIdMapUtils.isEmpty(modelIdMap))) return;

    target.loading = true;
    const maxDistance = input.value;
    const measurer = components.get(OBF.LengthMeasurement);
    measurer.list.clear();
    const fragments = components.get(OBC.FragmentsManager);
    for (const [modelId, localIds] of Object.entries(modelIdMap)) {
      if (localIds.size !== 2) continue;
      const model = fragments.list.get(modelId);
      if (!model) continue;
      const [boxA, boxB] = await model.getBoxes([...localIds]);

      const getClosestPoints = (boxA: THREE.Box3, boxB: THREE.Box3) => {
        const pointsA = [boxA.min, boxA.max];
        const pointsB = [boxB.min, boxB.max];

        let minDistance = Infinity;
        let closestPair: [THREE.Vector3, THREE.Vector3] | null = null;

        for (const pointA of pointsA) {
          for (const pointB of pointsB) {
            const distance = pointA.distanceTo(pointB);
            if (distance < minDistance) {
              minDistance = distance;
              closestPair = [pointA, pointB];
            }
          }
        }

        return closestPair;
      };

      const closestPoints = getClosestPoints(boxA, boxB);
      if (closestPoints) {
        const [pointA, pointB] = closestPoints;

        const line = new THREE.Line3(pointA, pointB);
        const direction = new THREE.Vector3();
        line.delta(direction);
        direction.normalize();

        direction.set(
          Math.abs(direction.x) >= Math.abs(direction.y) &&
            Math.abs(direction.x) >= Math.abs(direction.z)
            ? 1
            : 0,
          Math.abs(direction.y) >= Math.abs(direction.x) &&
            Math.abs(direction.y) >= Math.abs(direction.z)
            ? 1
            : 0,
          Math.abs(direction.z) >= Math.abs(direction.x) &&
            Math.abs(direction.z) >= Math.abs(direction.y)
            ? 1
            : 0,
        );

        const planeA = new THREE.Plane().setFromNormalAndCoplanarPoint(
          direction,
          boxA.min,
        );

        const targetA = new THREE.Vector3();
        planeA.projectPoint(boxB.min, targetA);
        const lineA = new THREE.Line3(boxB.min, targetA);
        const targetB = new THREE.Vector3();
        planeA.projectPoint(boxB.max, targetB);
        const lineB = new THREE.Line3(boxB.max, targetB);
        const closestBoundaryA =
          lineA.distance() < lineB.distance() ? lineA : lineB;

        const planeB = new THREE.Plane().setFromNormalAndCoplanarPoint(
          direction,
          boxA.max,
        );

        const targetC = new THREE.Vector3();
        planeB.projectPoint(boxB.min, targetC);
        const lineC = new THREE.Line3(boxB.min, targetC);
        const targetD = new THREE.Vector3();
        planeB.projectPoint(boxB.max, targetD);
        const lineD = new THREE.Line3(boxB.max, targetD);
        const closestBoundaryB =
          lineC.distance() < lineD.distance() ? lineC : lineD;

        const closestBoundary =
          closestBoundaryA.distance() < closestBoundaryB.distance()
            ? closestBoundaryA
            : closestBoundaryB;

        const measurer = components.get(OBF.LengthMeasurement);
        measurer.color =
          closestBoundary.distance() > maxDistance
            ? new THREE.Color("red")
            : new THREE.Color("green");

        measurer.list.add(
          new OBF.Line(closestBoundary.start, closestBoundary.end),
        );
      }
    }

    target.loading = false;
  };

  return BUI.html`
    <bim-toolbar>
      <bim-toolbar-section label="Visibility" icon=${appIcons.SHOW}>
        <bim-button tooltip-title=${tooltips.SHOW_ALL.TITLE} tooltip-text=${tooltips.SHOW_ALL.TEXT} icon=${appIcons.SHOW} label="Show All" @click=${onShowAll}></bim-button> 
        <bim-button tooltip-title=${tooltips.GHOST.TITLE} tooltip-text=${tooltips.GHOST.TEXT} icon=${appIcons.TRANSPARENT} label="Toggle Ghost" @click=${onToggleGhost}></bim-button>
      </bim-toolbar-section> 
      <bim-toolbar-section label="Selection" icon=${appIcons.SELECT}>
        ${focusBtn}
        <bim-button tooltip-title=${tooltips.HIDE.TITLE} tooltip-text=${tooltips.HIDE.TEXT} icon=${appIcons.HIDE} label="Hide" @click=${onHide}></bim-button> 
        <bim-button tooltip-title=${tooltips.ISOLATE.TITLE} tooltip-text=${tooltips.ISOLATE.TEXT} icon=${appIcons.ISOLATE} label="Isolate" @click=${onIsolate}></bim-button>
        <bim-button icon=${appIcons.RULER} label="Measure">
          <bim-context-menu>
            <div style="display: flex; gap: 0.5rem; width: 15rem;">
              <bim-number-input value=6 label="Max Distance" suffix="m" id=${numberInputId}></bim-number-input>
              <bim-button style="flex: 0;" label="Check" @click=${onMeasure}></bim-button>
            </div>
          </bim-context-menu>
        </bim-button>
        <bim-button icon=${appIcons.COLORIZE} label="Colorize">
          <bim-context-menu>
            <div style="display: flex; gap: 0.5rem; width: 10rem;">
              <bim-color-input id=${colorInputId}></bim-color-input>
              <bim-button label="Apply" @click=${onApplyColor}></bim-button>
            </div>
          </bim-context-menu>
        </bim-button>
      </bim-toolbar-section> 
    </bim-toolbar>
  `;
};
