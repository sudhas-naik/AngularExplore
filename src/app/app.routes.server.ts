import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects/:key',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:key/board',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:key/backlog',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:key/reports',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
