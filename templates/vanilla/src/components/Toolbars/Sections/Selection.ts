import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as FRAGS from "@thatopen/fragments";

export default (components: OBC.Components, world?: OBC.World) => {
  const highlighter = components.get(OBF.Highlighter);
  const hider = components.get(OBC.Hider);
  const fragments = components.get(OBC.FragmentsManager);
  const cullers = components.get(OBC.Cullers);
  const streamer = components.get(OBF.IfcStreamer);

  const onToggleVisibility = () => {
    const selection = highlighter.selection.select;
    if (Object.keys(selection).length === 0) {
      return;
    }
    const meshes = new Set<THREE.InstancedMesh>();

    const streamedFrags: FRAGS.FragmentIdMap = {};

    for (const fragmentID in selection) {
      const fragment = fragments.list.get(fragmentID);
      if (!fragment) continue;

      if (fragment.group?.isStreamed) {
        streamedFrags[fragmentID] = selection[fragmentID];
        continue;
      }

      meshes.add(fragment.mesh);
      const expressIDs = selection[fragmentID];
      for (const id of expressIDs) {
        const isHidden = fragment.hiddenItems.has(id);
        fragment.setVisibility(isHidden, [id]);
      }
    }

    if (meshes.size) {
      cullers.updateInstanced(meshes);
    }

    if (Object.keys(streamedFrags).length) {
      for (const fragmentID in streamedFrags) {
        const fragment = fragments.list.get(fragmentID);
        if (!fragment) continue;
        const ids = streamedFrags[fragmentID];

        for (const id of ids) {
          const isHidden = fragment.hiddenItems.has(id);
          streamer.setVisibility(isHidden, { [fragment.id]: new Set([id]) });
        }
      }
    }
  };

  const onIsolate = () => {
    const selection = highlighter.selection.select;
    if (Object.keys(selection).length === 0) return;

    const meshes = new Set<THREE.InstancedMesh>();

    const streamedFragsToHide: FRAGS.FragmentIdMap = {};
    const streamedFragsToShow: FRAGS.FragmentIdMap = {};
    const staticFragsToShow: FRAGS.FragmentIdMap = {};

    for (const [, fragment] of fragments.list) {
      if (fragment.group?.isStreamed) {
        streamedFragsToHide[fragment.id] = new Set(fragment.ids);
        continue;
      }

      fragment.setVisibility(false);
      meshes.add(fragment.mesh);
    }

    for (const fragmentID in selection) {
      const fragment = fragments.list.get(fragmentID);
      if (!fragment) {
        continue;
      }
      if (fragment.group?.isStreamed) {
        streamedFragsToShow[fragmentID] = selection[fragmentID];
      } else {
        staticFragsToShow[fragmentID] = selection[fragmentID];
      }
    }

    if (Object.keys(staticFragsToShow).length) {
      hider.set(true, selection);
      cullers.updateInstanced(meshes);
    }

    if (
      Object.keys(streamedFragsToHide).length ||
      Object.keys(streamedFragsToShow).length
    ) {
      streamer.setVisibility(false, streamedFragsToHide);
      streamer.setVisibility(true, streamedFragsToShow);
    }
  };

  const onShowAll = () => {
    const streamedFragsToShow: FRAGS.FragmentIdMap = {};

    for (const [, fragment] of fragments.list) {
      if (fragment.group?.isStreamed) {
        streamedFragsToShow[fragment.id] = new Set(fragment.ids);
        continue;
      }

      fragment.setVisibility(true);
      const cullers = components.get(OBC.Cullers);
      for (const [, culler] of cullers.list) {
        const culled = culler.colorMeshes.get(fragment.id);
        if (culled) culled.count = fragment.mesh.count;
      }
    }

    if (Object.keys(streamedFragsToShow).length) {
      streamer.setVisibility(true, streamedFragsToShow);
    }
  };

  const onFocusSelection = async () => {
    if (!world) return;
    if (!world.camera.hasCameraControls()) return;

    const bbox = components.get(OBC.BoundingBoxer);
    const fragments = components.get(OBC.FragmentsManager);
    bbox.reset();

    const selected = highlighter.selection.select;
    if (!Object.keys(selected).length) return;

    for (const fragID in selected) {
      const fragment = fragments.list.get(fragID);
      if (!fragment) continue;
      const ids = selected[fragID];
      bbox.addMesh(fragment.mesh, ids);
    }

    const sphere = bbox.getSphere();
    const i = Infinity;
    const mi = -Infinity;
    const { x, y, z } = sphere.center;
    const isInf = sphere.radius === i || x === i || y === i || z === i;
    const isMInf = sphere.radius === mi || x === mi || y === mi || z === mi;
    const isZero = sphere.radius === 0;
    if (isInf || isMInf || isZero) {
      return;
    }

    sphere.radius *= 1.2;
    const camera = world.camera;
    await camera.controls.fitToSphere(sphere, true);
  };

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Selection" icon="ph:cursor-fill">
        <bim-button @click=${onShowAll} label="Show All" icon="tabler:eye-filled" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
        <bim-button @click=${onToggleVisibility} label="Toggle Visibility" icon="tabler:square-toggle" tooltip-title="Toggle Visibility" tooltip-text="From the current selection, hides visible elements and shows hidden elements."></bim-button>
        <bim-button @click=${onIsolate} label="Isolate" icon="prime:filter-fill" tooltip-title="Isolate" tooltip-text="Isolates the current selection."></bim-button>
        <bim-button @click=${onFocusSelection} label="Focus" icon="ri:focus-mode" tooltip-title="Focus" tooltip-text="Focus the camera to the current selection."></bim-button>
      </bim-toolbar-section> 
    `;
  });
};
