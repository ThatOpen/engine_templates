/* eslint-disable no-alert */
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as FRAGS from "@thatopen/fragments";
import Zip from "jszip";

const input = document.createElement("input");
const askForFile = (extension: string) => {
  return new Promise<File | null>((resolve) => {
    input.type = "file";
    input.accept = extension;
    input.multiple = false;
    input.onchange = () => {
      const filesList = input.files;
      if (!(filesList && filesList[0])) {
        resolve(null);
        return;
      }
      const file = filesList[0];
      resolve(file);
    };
    input.click();
  });
};

export default (components: OBC.Components) => {
  const [loadBtn] = CUI.buttons.loadIfc({ components });
  loadBtn.label = "IFC";
  loadBtn.tooltipTitle = "Load IFC";
  loadBtn.tooltipText =
    "Loads an IFC file into the scene. The IFC gets automatically converted to Fragments.";

  const fragments = components.get(OBC.FragmentsManager);
  const indexer = components.get(OBC.IfcRelationsIndexer);

  const loadFragments = async () => {
    const fragmentsZip = await askForFile(".zip");
    if (!fragmentsZip) return;
    const zipBuffer = await fragmentsZip.arrayBuffer();
    const zip = new Zip();
    await zip.loadAsync(zipBuffer);
    const geometryBuffer = zip.file("geometry.frag");
    if (!geometryBuffer) {
      alert("No geometry found in the file!");
      return;
    }

    const geometry = await geometryBuffer.async("uint8array");

    let properties: FRAGS.IfcProperties | undefined;
    const propsFile = zip.file("properties.json");
    if (propsFile) {
      const json = await propsFile.async("string");
      properties = JSON.parse(json);
    }

    let relationsMap: OBC.RelationsMap | undefined;
    const relationsMapFile = zip.file("relations-map.json");
    if (relationsMapFile) {
      const json = await relationsMapFile.async("string");
      relationsMap = indexer.getRelationsMapFromJSON(json);
    }

    fragments.load(geometry, { properties, relationsMap });
  };

  const streamer = components.get(OBF.IfcStreamer) as OBF.IfcStreamer;

  // We are opening local files, so no cache use needed
  streamer.useCache = false;

  const streamedDirectories: { [name: string]: any } = {};

  const getStreamDirName = (name: string) => {
    return name.substring(0, name.indexOf(".ifc"));
  };

  streamer.fetch = async (path: string) => {
    const name = path.substring(path.lastIndexOf("/") + 1);
    const modelName = getStreamDirName(name);
    const directory = streamedDirectories[modelName];
    const fileHandle = await directory.getFileHandle(name);
    return fileHandle.getFile();
  };

  FRAGS.FragmentsGroup.fetch = async (name: string) => {
    const modelName = getStreamDirName(name);
    const directory = streamedDirectories[modelName];
    const fileHandle = await directory.getFileHandle(name);
    return fileHandle.getFile();
  };

  async function loadTiles() {
    let currentDirectory: any | null = null;
    const directoryInitialized = false;

    try {
      // @ts-ignore
      currentDirectory = await window.showDirectoryPicker();
    } catch (e) {
      return;
    }

    const geometryFilePattern = /-processed.json$/;
    const propertiesFilePattern = /-processed-properties.json$/;

    let geometryData: any | undefined;
    let propertiesData: any | undefined;

    for await (const entry of currentDirectory.values()) {
      if (!directoryInitialized) {
        const name = getStreamDirName(entry.name);
        streamedDirectories[name] = currentDirectory;
      }

      if (geometryFilePattern.test(entry.name)) {
        const file = (await entry.getFile()) as File;
        geometryData = await JSON.parse(await file.text());
        continue;
      }

      if (propertiesFilePattern.test(entry.name)) {
        const file = (await entry.getFile()) as File;
        propertiesData = await JSON.parse(await file.text());
      }
    }

    if (geometryData) {
      await streamer.load(geometryData, false, propertiesData);
    }
  }

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Import" icon="solar:import-bold">
        ${loadBtn}
        <bim-button @click=${loadFragments} label="Fragments" icon="fluent:puzzle-cube-piece-20-filled" tooltip-title="Load Fragments"
          tooltip-text="Loads a pre-converted IFC from a Fragments file. Use this option if you want to avoid the conversion from IFC to Fragments."></bim-button>
        <bim-button @click=${loadTiles} label="Tiles" icon="fe:tiled" tooltip-title="Load BIM Tiles"
        tooltip-text="Loads a pre-converted IFC from a Tiles file to stream the model. Perfect for big models."></bim-button>
      </bim-toolbar-section>
    `;
  });
};
