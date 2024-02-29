import * as OBC from "openbim-components"
import * as THREE from "three"
import { ViewerSetup } from "vue-ifc-viewer"
import { ExampleTool } from "."

export const viewer: ViewerSetup = async (viewer: OBC.Components, container: HTMLDivElement) => {
  const sceneComponent = new OBC.SimpleScene(viewer)
  sceneComponent.setup()
  viewer.scene = sceneComponent

  const rendererComponent = new OBC.PostproductionRenderer(viewer, container)
  viewer.renderer = rendererComponent
  const postproduction = rendererComponent.postproduction

  const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
  viewer.camera = cameraComponent

  const raycasterComponent = new OBC.SimpleRaycaster(viewer)
  viewer.raycaster = raycasterComponent

  await viewer.init()
  postproduction.enabled = true

  const grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x666666))
  postproduction.customEffects.excludedMeshes.push(grid.get())

  const ifcLoader = new OBC.FragmentIfcLoader(viewer)
  await ifcLoader.setup()

  const highlighter = new OBC.FragmentHighlighter(viewer)
  await highlighter.setup()

  const culler = new OBC.ScreenCuller(viewer)
  await culler.setup()
  cameraComponent.controls.addEventListener("sleep", () => culler.needsUpdate = true)

  const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
  highlighter.events.select.onClear.add(() => {
    propertiesProcessor.cleanPropertiesList()
  })

  ifcLoader.onIfcLoaded.add(async model => {
    for (const fragment of model.items) { culler.add(fragment.mesh) }
    propertiesProcessor.process(model)
    highlighter.events.select.onHighlight.add((selection) => {
      const fragmentID = Object.keys(selection)[0]
      const expressID = Number([...selection[fragmentID]][0])
      propertiesProcessor.renderProperties(model, expressID)
    })
    highlighter.updateHighlight()
    culler.needsUpdate = true
  })

  const exampleTool = new ExampleTool(viewer)
  await exampleTool.setup({
    message: "Hi there from ExampleTool!",
    requiredSetting: 123
  })

  const mainToolbar = new OBC.Toolbar(viewer)
  mainToolbar.addChild(
    ifcLoader.uiElement.get("main"),
    propertiesProcessor.uiElement.get("main"),
    exampleTool.uiElement.get("activationBtn")
  )

  viewer.ui.addToolbar(mainToolbar)
}