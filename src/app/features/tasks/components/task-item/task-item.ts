import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Task, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  imports: [DatePipe],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
})
export class TaskItem {
  readonly task = input.required<Task>();
  readonly statusChange = output<{ id: number; status: TaskStatus }>();
  readonly remove = output<number>();

  readonly statuses: TaskStatus[] = ['pending', 'in-progress', 'done'];

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusChange.emit({
      id: this.task().id,
      status: select.value as TaskStatus,
    });
  }

  onRemove(): void {
    this.remove.emit(this.task().id);
  }
}
