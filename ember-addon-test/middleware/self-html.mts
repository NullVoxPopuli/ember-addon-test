import { Connect } from "vite";

import * as fs from 'node:fs';
import * as url from 'node:url';
import { join } from 'node:path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const html = join(__dirname, 'index.html');

export const selfHtml: Connect.NextHandleFunction = (req, res, next) => {

  if (req.url === '/' && req.method === 'GET') {

    let stream = fs.createReadStream(html);
    stream.pipe(res);
    stream.on('end', () => {
      stream.destroy();
    });

    return;
  }

  next();
};
