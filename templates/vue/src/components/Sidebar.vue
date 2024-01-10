<template>
  <div id="sidebar">
    <button class="simple-btn" @click="logModelCount">
      <span style="font-size: 18px;" class="material-icons">tag</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import * as OBC from "openbim-components"
import { useViewersManager } from 'vue-ifc-viewer'

const viewersManager = useViewersManager()
const viewer = viewersManager.get()

const logModelCount = () => {
  const fragmentManager = viewer.tools.get(OBC.FragmentManager)
  const modelsCount = fragmentManager.groups.length
  alert(`Your current model count is: ${modelsCount}. Try to load some more!`)
}

</script>

<style>
#sidebar {
  background-color: #222a32;
  border-right: 2px solid #3e4145;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.simple-btn {
  aspect-ratio: 1;
  height: 35px;
  border-radius: 10px;
  background-color: black;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.simple-btn:hover {
  background-color: var(--primary-color);
  cursor: pointer;
  color: black;
}
</style>