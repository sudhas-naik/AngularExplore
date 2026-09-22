import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {
  private readonly taskService = inject(TaskService);

  readonly tasks = this.taskService.tasks;
  readonly pendingCount = this.taskService.pendingCount;
  readonly doneCount = this.taskService.doneCount;
}

