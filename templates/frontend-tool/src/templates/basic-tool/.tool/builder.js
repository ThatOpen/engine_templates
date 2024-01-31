const fs = require("fs");
const { execSync } = require("child_process");
const archiver = require("archiver");

let distPath = "";

const remove = (files) => {
  try {
    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.rmSync(file, {
          recursive: true,
          force: true,
          maxRetries: 5,
        });
      }
    }
  } catch (e) {}
};

const cleanStart = () => {
  remove([".tool/temp", "dist"]);
};

const cleanEnd = () => {
  setTimeout(() => {
    remove([".tool/temp"]);
    // Copy file for local development
    fs.copyFileSync(distPath, ".tool/local/tool.zip");
    fs.copyFileSync("index.json", ".tool/local/index.json");
  }, 2000);
};

const bundle = () => {
  let source = fs.readFileSync(".tool/temp/tool/index.js", "utf8");
  source = source.replace("import * as THREE from 'three';", "");
  source = source.replace("import * as OBC from 'openbim-components';", "");
  source = source.replace(/export.*?{.*?};/, "");

  // Substitute explicit THREE.js imports by object destructuring

  let explicitThreeImports = source.match(
    /import *{.*} *from *['"`]three['"`];/
  );

  let threeExplicits = "";

  if (explicitThreeImports.length) {
    threeExplicits = explicitThreeImports[0];
    threeExplicits = threeExplicits.replace(/import *{/, "");
    threeExplicits = threeExplicits.replace(/} *from *['"`]three['"`];/, "");
  }

  source = source.replace(/import *{.*} *from *['"`]three['"`];/, "");

  if (threeExplicits.length) {
    threeExplicits = `const { ${threeExplicits} } = THREE;`;
  }

  const tool = `
window.ThatOpenTool = (OBC, THREE) => {
    ${threeExplicits}

    ${source}

    return HelloWorld;
};
`;

  fs.writeFileSync(".tool/temp/tool/index.js", tool, "utf8");
};

const zip = async () => {
  // Zip the types

  const typesOutput = fs.createWriteStream(".tool/temp/tool/types.zip");
  const typesArchive = archiver("zip");

  typesOutput.on("close", function () {
    console.log("Types successfully packed!");
  });

  typesArchive.on("error", function (err) {
    throw err;
  });

  typesArchive.pipe(typesOutput);
  typesArchive.directory(".tool/temp/types", false);

  await typesArchive.finalize();

  fs.copyFileSync("README.md", ".tool/temp/tool/index.md");

  const mediaSource = "resources";
  const mediaDestination = ".tool/temp/tool/resources";
  const localDestination = ".tool/local/resources";
  remove([mediaDestination]);
  fs.mkdirSync(mediaDestination);

  const mediaFiles = fs.readdirSync(mediaSource);
  for (const file of mediaFiles) {
    fs.copyFileSync(`${mediaSource}/${file}`, `${mediaDestination}/${file}`);
    fs.copyFileSync(`${mediaSource}/${file}`, `${localDestination}/${file}`);
  }

  // Transform and copy index.json

  const configText = fs.readFileSync("index.json", "utf8");
  const config = JSON.parse(configText);
  // console.log(config);

  for (const action of config.actions) {
    if (!fs.existsSync(action.icon)) {
      continue;
    }
    const svg = fs.readFileSync(action.icon, "utf8");
    const buffer = Buffer.from(svg);
    action.icon = `data:image/svg+xml;base64,${buffer.toString("base64")}`;
  }

  const serializedConfig = JSON.stringify(config);
  fs.writeFile(
    ".tool/temp/tool/index.json",
    serializedConfig,
    "utf8",
    function (err) {
      if (err) return console.log(err);
    }
  );

  // Create zip file
  // src: https://stackoverflow.com/a/18775083/14627620

  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
  }

  distPath = `dist/${config.name}.zip`;
  const output = fs.createWriteStream(distPath);
  const archive = archiver("zip");

  output.on("close", function () {
    remove([".tool/temp/tool"]);
    console.log("Tool successfully created!");
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(output);
  archive.directory(".tool/temp/tool", false);

  archive.finalize();
};

const build = async () => {
  console.log("Cleaning start...");
  cleanStart();
  console.log("Compiling typescript...");
  execSync("tsc");
  console.log("Compiling types...");
  execSync("tsc --p ./.tool/tsconfig-declarations.json");
  console.log("Bundling...");
  execSync("rollup -c .tool/rollup.config.mjs");
  console.log("Setting up tool...");
  bundle();
  console.log("Zipping...");
  zip();
  console.log("Ending...");
  cleanEnd();
};

module.exports = { build };


