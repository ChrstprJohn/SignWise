import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { createApiMiddleware } from './api.js';

const dist = resolve(import.meta.dirname, '../dist');
const api = createApiMiddleware();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  api(req, res, async () => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = resolve(dist, `.${pathname}`);
      if (file !== dist && !file.startsWith(`${dist}${sep}`)) throw new Error('Outside dist');
      let info = await stat(file);
      if (info.isDirectory()) { file = resolve(file, 'index.html'); info = await stat(file); }
      if (!info.isFile()) throw new Error('Not a file');
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': info.size, 'X-Content-Type-Options': 'nosniff' });
      if (req.method === 'HEAD') res.end();
      else createReadStream(file).on('error', () => res.destroy()).pipe(res);
    } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Page not found. Build the app with pnpm build first.'); }
  });
});
server.requestTimeout = 130_000;
const port = Number(process.env.PORT || 5173);
server.listen(port, '127.0.0.1', () => console.log(`SignWise: http://127.0.0.1:${port}`));
const stop = () => server.close(() => process.exit(0));
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
