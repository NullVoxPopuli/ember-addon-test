#!/usr/bin/env node

import path from 'node:path';
import * as url from 'url';
import { execa } from 'execa';
import ci from 'ci-info';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const bin = path.join(__dirname, 'node_modules', '.bin', 'vite');
const config = path.join(__dirname, 'config', 'vite.config.mts');

execa(bin, ['--config', config, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    VITE_CI: ci.isCI,
  },
});
