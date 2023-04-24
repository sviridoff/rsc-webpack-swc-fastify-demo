import { createFromFetch } from 'react-server-dom-webpack/client';
import { createRoot, hydrateRoot } from 'react-dom/client';
import React, { use, useState } from 'react';

/*
window.__webpack_require__ = async (id) => {
  return import(id);
};
*/

const router = <Router />;
const root = createRoot(document.getElementById('root'));
root.render(router);

/*
const domNode = document.getElementById('root');
const root = hydrateRoot(domNode, <Router />);
*/

const initialCache = new Map();
const url = '/rsc';

function Router() {
  const [cache, setCache] = useState(initialCache);
  if (!cache.has(url)) {
    cache.set(url, createFromFetch(fetch(url)));
  }
  const lazyJsx = cache.get(url);
  return use(lazyJsx);
}
