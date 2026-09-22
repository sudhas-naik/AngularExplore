import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { TaskList } from './features/tasks/pages/task-list/task-list';
import { TaskForm } from './features/tasks/pages/task-form/task-form';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tasks', component: TaskList },
  { path: 'tasks/new', component: TaskForm },
  { path: '**', redirectTo: '' },
];
