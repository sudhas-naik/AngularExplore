import { Routes } from '@angular/router';
import { Projects } from './features/board/pages/projects/projects';
import { ProjectShell } from './features/board/pages/project-shell/project-shell';
import { Kanban } from './features/board/pages/kanban/kanban';
import { Backlog } from './features/board/pages/backlog/backlog';
import { Reports } from './features/board/pages/reports/reports';

export const routes: Routes = [
  { path: '', redirectTo: 'projects/ANG/board', pathMatch: 'full' },
  { path: 'projects', component: Projects },
  {
    path: 'projects/:key',
    component: ProjectShell,
    children: [
      { path: '', redirectTo: 'board', pathMatch: 'full' },
      { path: 'board', component: Kanban },
      { path: 'backlog', component: Backlog },
      { path: 'reports', component: Reports },
    ],
  },
  { path: '**', redirectTo: 'projects/ANG/board' },
];
