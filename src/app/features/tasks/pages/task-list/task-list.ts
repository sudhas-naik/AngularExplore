import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { TaskStatus } from '../../models/task.model';
import { TaskItem } from '../../components/task-item/task-item';

@Component({
  selector: 'app-task-list',
  imports: [RouterLink, TaskItem],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})

export class TaskList {
  private readonly taskService = inject(TaskService);
  readonly tasks = this.taskService.tasks;
  onStatusChange(event: { id: number; status: TaskStatus }): void {
    this.taskService.updateStatus(event.id, event.status);
  }
  onRemove(id: number): void {
    this.taskService.remove(id);
  }
}
