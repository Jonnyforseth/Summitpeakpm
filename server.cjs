const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { randomUUID } = require('node:crypto');
const publicDirectory = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 4346);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' };
Object.assign(mime, { '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.md': 'text/markdown; charset=utf-8' });
const interests = new Set(['Property management', 'Leasing & placement', 'Owner support', 'Rental availability', 'Resident question', 'Something else']);

function json(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}

async function handleRequest(request, response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/api/inquiries') {
      if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return json(response, 405, { error: 'Use POST to submit an inquiry.' }); }
      if (!request.headers['content-type']?.startsWith('application/json')) return json(response, 415, { error: 'Expected a JSON inquiry.' });
      if (request.headers.origin && request.headers.origin !== `http://${request.headers.host}`) return json(response, 403, { error: 'Invalid request origin.' });
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (Buffer.byteLength(body) > 16384) return json(response, 413, { error: 'Your message is too long.' });
      }
      let input;
      try { input = JSON.parse(body); } catch { return json(response, 400, { error: 'Invalid inquiry.' }); }
      if (!input || typeof input !== 'object' || Array.isArray(input)) return json(response, 400, { error: 'Invalid inquiry.' });
      const clean = {};
      for (const [key, max] of Object.entries({ name: 100, email: 254, phone: 40, interest: 80, message: 4000 })) {
        if (key === 'phone' && input[key] === undefined) input[key] = '';
        if (typeof input[key] !== 'string' || input[key].length > max) return json(response, 400, { error: 'Please check the form fields and try again.' });
        clean[key] = input[key].trim();
      }
      if (!clean.name || !clean.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) || !interests.has(clean.interest)) return json(response, 400, { error: 'Enter your name, a valid email, and a message.' });
      const directory = process.env.INQUIRY_DIRECTORY || path.join(__dirname, 'data');
      await fs.promises.mkdir(directory, { recursive: true });
      const id = randomUUID();
      await fs.promises.appendFile(path.join(directory, 'inquiries.jsonl'), JSON.stringify({ id, receivedAt: new Date().toISOString(), ...clean }) + '\n');
      return json(response, 201, { received: true, id });
    }
    if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); return json(response, 405, { error: 'Method not allowed.' }); }
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { return json(response, 400, { error: 'Invalid URL.' }); }
    let filename = path.resolve(publicDirectory, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(publicDirectory, filename);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.includes(':')) return json(response, 404, { error: 'Not found.' });
    if (!path.extname(filename)) {
      let isDirectory = false;
      try { isDirectory = (await fs.promises.stat(filename)).isDirectory(); } catch {}
      if (isDirectory) {
        if (!url.pathname.endsWith('/')) {
          response.writeHead(301, { Location: url.pathname + '/' + url.search });
          return response.end();
        }
        filename = path.join(filename, 'index.html');
      }
    }
    const type = mime[path.extname(filename)];
    if (!type) return json(response, 404, { error: 'Not found.' });
    let contents;
    try { contents = await fs.promises.readFile(filename); } catch { return json(response, 404, { error: 'Not found.' }); }
    response.writeHead(200, { 'Content-Type': type, 'Content-Length': contents.length, 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : contents);
  } catch (error) {
    console.error('Request failed:', error.message);
    if (!response.headersSent) json(response, 500, { error: 'We could not save your inquiry. Please try again.' });
    else response.end();
  }
}

for (const host of ['127.0.0.1', '::1']) {
  const server = http.createServer(handleRequest);
  server.requestTimeout = 15000;
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use on ${host}. Stop the existing server before restarting.` : error.message);
    process.exit(1);
  });
  server.listen(port, host, () => console.log(`Summit Peak preview: http://localhost:${port} (${host})`));
}
