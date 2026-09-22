import { Injectable, signal, computed } from '@angular/core';
import { NewTask, Task, TaskStatus } from '../../features/tasks/models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly tasksSignal = signal<Task[]>([
    {
      id: 1,
      title: 'Learn Angular basics',
      description: 'Components, templates, and data binding',
      status: 'done',
      createdAt: new Date('2026-09-01'),
    },
    {
      
      id: 2,
      title: 'Build a small app',
      description: 'Use routing, services, and forms together',
      status: 'in-progress',
      createdAt: new Date('2026-09-05'),
    },
    
    {
      id: 3,
      title: 'Explore signals',
      description: 'Practice reactive state with Angular signals',
      status: 'pending',
      createdAt: new Date('2026-09-07'),
    },
  ]);

  private nextId = 4;

  readonly tasks = this.tasksSignal.asReadonly();

  readonly pendingCount = computed(
    () => this.tasksSignal().filter((t) => t.status === 'pending').length,
  );

  readonly doneCount = computed(
    () => this.tasksSignal().filter((t) => t.status === 'done').length,
  );

  getById(id: number): Task | undefined {
    return this.tasksSignal().find((task) => task.id === id);
  }

  add(task: NewTask): void {
    this.tasksSignal.update((tasks) => [
      ...tasks,
      {
        ...task,
        id: this.nextId++,
        createdAt: new Date(),
      },
    ]);
  }

  updateStatus(id: number, status: TaskStatus): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }

  remove(id: number): void {
    this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
  }
}
