#!/usr/bin/env node

import path from 'node:path';
import * as url from 'url';
import { execa } from 'execa';
import ci from 'ci-info';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const bin = path.join(__dirname, 'node_modules', '.bin', 'ember');

execa(bin, [...process.argv.slice(2)], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    CI: ci.isCI,
    FROM_DIR: process.cwd(),
  },
});
