/* eslint-disable import/no-extraneous-dependencies */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { defineConfig } from "vite";

// web-ifc's JS and its .wasm must be the same version. Read the version of
// the web-ifc actually installed, so the wasm URL in main.ts follows it.
const webIfcDir = dirname(createRequire(import.meta.url).resolve("web-ifc"));
const webIfcVersion: string = JSON.parse(
  readFileSync(join(webIfcDir, "package.json"), "utf8"),
).version;

export default defineConfig({
  base: "./",
  define: {
    __WEB_IFC_VERSION__: JSON.stringify(webIfcVersion),
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
});
