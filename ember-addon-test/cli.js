#!/usr/bin/env node

import path from 'node:path';
import * as url from 'url';
import { execa } from 'execa';
import ci from 'ci-info';


const PORT = process.env.PORT || 5137;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const bin = path.join(__dirname, 'node_modules/.bin/vite');
const testem = path.join(__dirname, 'node_modules/.bin/testem');
const config = path.join(__dirname, 'config/vite.config.mts');
const testemConfig = path.join(process.cwd(), 'tests/testem.cjs');
const entry = path.join(__dirname, 'middleware/');

let args = process.argv.slice(2);

let command = args[0];

if (command === 'test') {
  let tsNode = path.join(__dirname, 'node_modules/.bin/ts-node');
  let launcher = path.join(__dirname, 'cli/launcher.mts');

  await execa(tsNode, ['--esm', launcher]);

} else {
  // Dev mode!
  execa(bin, ['--config', config, '--port', PORT, ...args], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      VITE_CI: false
    },
  });
}

