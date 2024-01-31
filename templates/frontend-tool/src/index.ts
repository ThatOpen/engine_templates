#!/usr/bin/env node

// src: https://medium.com/@pongsatt/how-to-build-your-own-project-templates-using-node-cli-c976d3109129

import * as inquirer from 'inquirer';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
const crypto = require('crypto');

// src: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function createUUIDv4() {
    // @ts-ignore
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const uuid = createUUIDv4();

let componentName = "";

const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));
const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'What project template would you like to generate?',
        choices: CHOICES
    },
    {
        name: 'name',
        type: 'input',
        message: 'Tool name:'
    }];

export interface CliOptions {
    projectName: string
    templateName: string
    templatePath: string
    tartgetPath: string
}

function createProject(projectPath: string) {
    if (fs.existsSync(projectPath)) {
        console.log(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`));
        return false;
    }
    fs.mkdirSync(projectPath);

    return true;
}

// list of file/folder that should not be copied
const SKIP_FILES = ['node_modules', '.template.json'];
function createDirectoryContents(templatePath: string, projectName: string) {
    // read all files/folders (1 level) from template folder
    const filesToCreate = fs.readdirSync(templatePath);

    // loop each file/folder
    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file);

        // get stats about the current file
        const stats = fs.statSync(origFilePath);

        // skip files that should not be copied
        if (SKIP_FILES.indexOf(file) > -1) return;

        if (stats.isFile()) {
            const isTextFile = origFilePath.match(/(\.json$)|(\.ts$)|(\.js$)/);
            if(isTextFile) {
                // Read file and process it
                let contents = fs.readFileSync(origFilePath, 'utf8');
                contents = contents.replaceAll(/\$\$\$NAME\$\$\$/g, componentName);
                contents = contents.replaceAll(/\$\$\$UUID\$\$\$/g, uuid);
                const writePath = path.join(CURR_DIR, projectName, file);
                fs.writeFileSync(writePath, contents, 'utf8');
            } else {
                // Just copy the file, without processing it
                const writePath = path.join(CURR_DIR, projectName, file);
                fs.copyFileSync(origFilePath, writePath);
            }
        } else if (stats.isDirectory()) {
            // create folder in destination folder
            fs.mkdirSync(path.join(CURR_DIR, projectName, file));
            // copy files/folder inside current folder recursively
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
        }
    });
}

const CURR_DIR = process.cwd();
inquirer.prompt(QUESTIONS)
    .then((answers: any) => {
        const projectChoice = answers['template'] as string;
        const projectName = answers['name'] as string;
        componentName = projectName;
        const templatePath = path.join(__dirname, 'templates', projectChoice);
        const tartgetPath = path.join(CURR_DIR, projectName);

        const options: CliOptions = {
            projectName,
            templateName: projectChoice,
            templatePath,
            tartgetPath
        }

        console.log(options);

        if (!createProject(tartgetPath)) {
            return;
        }

        createDirectoryContents(templatePath, projectName);

    });

