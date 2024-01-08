import * as fs from "fs";
import * as path from "path";

function replace(filePath, searchText, replaceText) {
  // Read the file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }

    const modifiedData = data.replace(new RegExp(searchText, "g"), replaceText);

    fs.writeFile(filePath, modifiedData, "utf8", (err) => {
      if (err) {
        console.error(`Error writing file: ${err}`);
        return;
      }

      console.log("File has been successfully modified and saved.");
    });
  });
}

replace("dist/index.html", "/assets", "./assets");
