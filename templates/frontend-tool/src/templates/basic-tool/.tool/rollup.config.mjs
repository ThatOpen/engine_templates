import { nodeResolve } from "@rollup/plugin-node-resolve";
import extensions from "./rollup-extensions.mjs";
import commonjs from "@rollup/plugin-commonjs";

// This creates the bundle used by the examples
export default {
  input: ".tool/temp/js/index.js",
  output: {
    file: ".tool/temp/tool/index.js",
    format: "esm",
  },
  external: ["three", "openbim-components"], // so it's not included
  plugins: [
    extensions({
      extensions: [".js"],
    }),
    nodeResolve(),
    commonjs(),
  ],
};
