
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/tasks"
  },
  {
    "renderMode": 2,
    "route": "/tasks/new"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1661, hash: 'b7490da9b1c3585133e11009505309c8f124bea407133d436f6f0cc3284ab377', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 946, hash: 'a4766c8e1b15c5ac09b2c1d177a131c8cd9f5b836aca45e9a9995f7633000b31', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 7333, hash: 'dec35948de225421324a14715cade44e4fed469b169d637dcc9e08b9c33756aa', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'tasks/new/index.html': {size: 8410, hash: '5b68a049478515c9497dc1ad0e1c09503a0fb29779988404f665c553460aba11', text: () => import('./assets-chunks/tasks_new_index_html.mjs').then(m => m.default)},
    'tasks/index.html': {size: 10869, hash: '1ba0add828bd8161bfaa0be67c90ad80bc8c2f8f8f40a872afd59f41eba4f9d5', text: () => import('./assets-chunks/tasks_index_html.mjs').then(m => m.default)},
    'styles-ETTREP2Z.css': {size: 3816, hash: '0Hc0SYHWbSI', text: () => import('./assets-chunks/styles-ETTREP2Z_css.mjs').then(m => m.default)}
  },
};
