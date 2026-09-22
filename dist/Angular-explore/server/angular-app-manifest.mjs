
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
    "route": "/projects"
  },
  {
    "renderMode": 0,
    "redirectTo": "/projects/*/board",
    "route": "/projects/*"
  },
  {
    "renderMode": 0,
    "route": "/projects/*/board"
  },
  {
    "renderMode": 0,
    "route": "/projects/*/backlog"
  },
  {
    "renderMode": 0,
    "route": "/projects/*/reports"
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
    'index.csr.html': {size: 1553, hash: 'a7950f5395ff7266329534af305a563aa1d8f440b6e574693f3da0da2ac501c1', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 946, hash: 'efcd7caff40984e462e73519e84efaa7a42205e5797f32ca9ae14ddfced35c5e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 8125, hash: 'ac841bde6d18b8bf7706071739686eab4b986ab3342fbbf1a69ef9a75cf88aac', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'projects/index.html': {size: 9872, hash: 'fcbb24f709d9e4fe62ded17bccf5ab94036908e62bbd4bd6dd81f82545405844', text: () => import('./assets-chunks/projects_index_html.mjs').then(m => m.default)},
    'tasks/new/index.html': {size: 8784, hash: 'a51c4e4c36d2da79d10a2f075bcecf9b67233e645be9871f3a677ccd6c260bea', text: () => import('./assets-chunks/tasks_new_index_html.mjs').then(m => m.default)},
    'tasks/index.html': {size: 11252, hash: '2ebb794c8b2ee79c3687cc1cff82442c69c4f6fc3912471174fa2d2fb1d32202', text: () => import('./assets-chunks/tasks_index_html.mjs').then(m => m.default)},
    'styles-6YNONDIU.css': {size: 21514, hash: 'E2164Mt65DA', text: () => import('./assets-chunks/styles-6YNONDIU_css.mjs').then(m => m.default)}
  },
};
