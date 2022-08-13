
import { createServer } from 'vite'
// import { IstanbulPlugin } from 'vite-plugin-istanbul';

import { plugins } from '../vite-plugin.mjs';

const options = {};

// const istanbulPlugin = IstanbulPlugin(options.istanbul || {});

const server = await createServer({
  plugins: [].concat(
    // options.coverage ? [istanbulPlugin] : [],
    ...plugins(),
  ),
  server: {
    port: port,
  },
  clearScreen: false,
}, false);

await server.listen();
