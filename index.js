#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import inquirer from 'inquirer';
import ncp from 'ncp';

const require = createRequire(import.meta.url);
const templatesPath = join(dirname(fileURLToPath(import.meta.url)), 'templates');

const chooseTemplateMsg = "Choose a template for your new OpenBIM project:"
const completedMsg = `
Project created successfully inside the current directory! Now execute the following in terminal:

/* NPM */
npm i
npm run dev

/* Yarn */
yarn install
yarn dev
`

const templateChoices = require('fs').readdirSync(templatesPath);
inquirer
  .prompt([
    {
      type: 'list',
      name: 'template',
      message: chooseTemplateMsg,
      choices: templateChoices,
    },
  ])
  .then((answers) => {
    const templatePath = join(templatesPath, answers.template);

    ncp.ncp(templatePath, process.cwd(), (err) => {
      if (err) {
        console.error('Failed to create project:', err);
        return;
      }
      console.log(completedMsg);
    });
  });