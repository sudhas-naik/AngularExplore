import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';
import {
  ISSUE_PRIORITIES,
  ISSUE_TYPES,
  ISSUE_TYPE_META,
  IssueStatus,
  PRIORITY_META,
  STORY_POINT_OPTIONS,
} from '../../models/board.model';

@Component({
  selector: 'app-create-issue-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './create-issue-dialog.html',
  styleUrl: './create-issue-dialog.css',
})
export class CreateIssueDialog {
  private readonly fb = inject(FormBuilder);
  readonly board = inject(BoardService);

  readonly projectKey = input.required<string>();
  readonly defaultStatus = input<IssueStatus>('todo');

  readonly types = ISSUE_TYPES;
  readonly priorities = ISSUE_PRIORITIES;
  readonly pointOptions = STORY_POINT_OPTIONS;
  readonly typeMeta = ISSUE_TYPE_META;
  readonly priorityMeta = PRIORITY_META;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    type: this.fb.nonNullable.control<(typeof ISSUE_TYPES)[number]>('story'),
    priority: this.fb.nonNullable.control<(typeof ISSUE_PRIORITIES)[number]>('medium'),
    assigneeId: [''],
    storyPoints: [''],
    destination: this.fb.nonNullable.control<'sprint' | 'backlog'>('sprint'),
  });

  close(): void {
    this.board.closeCreate();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const sprint = this.board.activeSprint(this.projectKey());
    const toSprint = value.destination === 'sprint' && sprint;

    this.board.addIssue({
      projectKey: this.projectKey(),
      title: value.title,
      description: value.description,
      type: value.type,
      status: toSprint ? this.defaultStatus() : 'todo',
      priority: value.priority,
      assigneeId: value.assigneeId || null,
      storyPoints: value.storyPoints ? Number(value.storyPoints) : null,
      labels: [],
      sprintId: toSprint ? sprint.id : null,
    });

    this.form.reset({
      title: '',
      description: '',
      type: 'story',
      priority: 'medium',
      assigneeId: '',
      storyPoints: '',
      destination: 'sprint',
    });
    this.close();
  }
}
