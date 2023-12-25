import Fastify from 'fastify';
import { createElement } from 'react';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { finished } from "node:stream/promises";
import ReactServerDOMWebpackServer from 'react-server-dom-webpack/server';

const { renderToPipeableStream } = ReactServerDOMWebpackServer;

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(
  new URL('.', import.meta.url),
);
const clientComponentMap = JSON.parse(
  await readFile(
    resolve(
      __dirname,
      '../dist/react-client-manifest.json',
    ),
  ),
);

function renderReactTree(writable, component, props) {
  const { pipe } = renderToPipeableStream(
    createElement(component, props),
    clientComponentMap,
  );
  pipe(writable);
}

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

fastify.get('/rsc', (request, reply) => {
  import('../dist/App.js').then((ReactAppDefault) => {
    const ReactApp = ReactAppDefault.default;
    reply.header("content-type", "application/octet-stream");
    renderReactTree(reply.raw, ReactApp, {});
  });
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
