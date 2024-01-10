import { createApp } from 'vue'
import App from './App.vue'
import { ifcViewer, IfcPluginConfig } from 'vue-ifc-viewer'
import { viewer } from './bim-components/viewer'

const ifcViewerConfig: IfcPluginConfig = {
  defaultViewerSetup: viewer
}

createApp(App).use(ifcViewer, ifcViewerConfig).mount('#app')
