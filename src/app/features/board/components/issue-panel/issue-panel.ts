import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  BOARD_COLUMNS,
  ISSUE_PRIORITIES,
  ISSUE_TYPES,
  ISSUE_TYPE_META,
  Issue,
  IssuePriority,
  IssueStatus,
  IssueType,
  PRIORITY_META,
  STATUS_META,
  STORY_POINT_OPTIONS,
} from '../../models/board.model';
import { IssueTypeIcon } from '../issue-type-icon/issue-type-icon';

@Component({
  selector: 'app-issue-panel',
  imports: [DatePipe, FormsModule, IssueTypeIcon],
  templateUrl: './issue-panel.html',
  styleUrl: './issue-panel.css',
})
export class IssuePanel {
  readonly board = inject(BoardService);
  private readonly toast = inject(ToastService);

  readonly issue = input.required<Issue>();
  readonly closed = output<void>();

  readonly comment = signal('');
  readonly labelDraft = signal('');
  readonly copied = signal(false);

  readonly types = ISSUE_TYPES;
  readonly priorities = ISSUE_PRIORITIES;
  readonly statuses = BOARD_COLUMNS;
  readonly pointOptions = STORY_POINT_OPTIONS;
  readonly typeMeta = ISSUE_TYPE_META;
  readonly priorityMeta = PRIORITY_META;
  readonly statusMeta = STATUS_META;

  readonly assignee = computed(() => this.board.getUser(this.issue().assigneeId));
  readonly reporter = computed(() => this.board.getUser(this.issue().reporterId));
  readonly project = computed(() => this.board.getProject(this.issue().projectKey));
  readonly isKanban = computed(() => this.project()?.boardType === 'kanban');
  readonly sprints = computed(() =>
    this.board
      .sprints()
      .filter(
        (sprint) =>
          sprint.projectKey === this.issue().projectKey && sprint.status !== 'completed',
      ),
  );

  readonly dueValue = computed(() => toDateInput(this.issue().dueDate));

  patch<K extends 'title' | 'description' | 'type' | 'status' | 'priority' | 'assigneeId' | 'storyPoints' | 'sprintId' | 'dueDate'>(
    key: K,
    value: Issue[K],
  ): void {
    this.board.updateIssue(this.issue().id, { [key]: value });
  }

  copyKey(): void {
    const key = this.issue().key;
    void navigator.clipboard?.writeText(key).catch(() => undefined);
    this.copied.set(true);
    this.toast.show(`Copied ${key}`);
    setTimeout(() => this.copied.set(false), 1200);
  }

  onType(event: Event): void {
    this.patch('type', (event.target as HTMLSelectElement).value as IssueType);
  }

  onStatus(event: Event): void {
    this.patch('status', (event.target as HTMLSelectElement).value as IssueStatus);
  }

  onPriority(event: Event): void {
    this.patch('priority', (event.target as HTMLSelectElement).value as IssuePriority);
  }

  onAssignee(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.patch('assigneeId', value || null);
  }

  onPoints(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.patch('storyPoints', value ? Number(value) : null);
  }

  onSprint(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.board.setIssueSprint(this.issue().id, value || null);
  }

  onDue(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.patch('dueDate', value ? new Date(`${value}T00:00:00`) : null);
  }

  addLabel(): void {
    const label = this.labelDraft().trim();
    if (!label) {
      return;
    }
    const labels = [...new Set([...this.issue().labels, label])];
    this.board.updateIssue(this.issue().id, { labels });
    this.labelDraft.set('');
  }

  removeLabel(label: string): void {
    this.board.updateIssue(this.issue().id, {
      labels: this.issue().labels.filter((item) => item !== label),
    });
  }

  addComment(): void {
    this.board.addComment(this.issue().id, this.comment());
    this.comment.set('');
  }

  deleteIssue(): void {
    if (confirm(`Delete ${this.issue().key}? This cannot be undone.`)) {
      this.board.deleteIssue(this.issue().id);
      this.closed.emit();
    }
  }
}

function toDateInput(value: Date | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
