import Fastify from 'fastify';
import { createElement } from 'react';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { renderToReadableStream } from 'react-server-dom-webpack/server.browser';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(
  new URL('.', import.meta.url),
);

const fastify = Fastify({
  logger: true,
});

fastify.get('/', async (request, reply) => {
  const html = await readFile(
    resolve(__dirname, '../public/page.html'),
  );
  return reply.type('text/html').send(html);
});

fastify.get('/dist/*', async (request, reply) => {
  const js = await readFile(
    resolve(__dirname, `..${request.url}`),
    'utf-8',
  );
  return reply.type('application/javascript').send(js);
});

fastify.get('/rsc', async (request, reply) => {
  const ReactApp = await import('../dist/App.js');
  const clientComponentMap = JSON.parse(
    await readFile(
      resolve(
        __dirname,
        '../dist/react-client-manifest.json',
      ),
    ),
  );
  const stream = renderToReadableStream(
    createElement(ReactApp.default, {}),
    clientComponentMap,
  );
  const buffers = [];
  for await (const data of stream) {
    buffers.push(data);
  }
  const finalBuffer = Buffer.concat(buffers);
  return reply.type('text/x-component').send(finalBuffer);
});

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
