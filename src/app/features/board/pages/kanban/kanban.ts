import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { BoardService } from '../../../../core/services/board.service';
import {
  ISSUE_PRIORITIES,
  ISSUE_TYPES,
  ISSUE_TYPE_META,
  Issue,
  IssueStatus,
  PRIORITY_META,
} from '../../models/board.model';
import { IssueCard } from '../../components/issue-card/issue-card';

@Component({
  selector: 'app-kanban',
  imports: [FormsModule, IssueCard, RouterLink],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css',
})
export class Kanban {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly board = inject(BoardService);

  readonly projectKey = toSignal(
    this.route.parent!.paramMap.pipe(map((params) => params.get('key') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('key') ?? '' },
  );

  readonly types = ISSUE_TYPES;
  readonly priorities = ISSUE_PRIORITIES;
  readonly typeMeta = ISSUE_TYPE_META;
  readonly priorityMeta = PRIORITY_META;

  readonly draggedId = signal<string | null>(null);
  readonly dragOver = signal<{ status: IssueStatus; index: number } | null>(null);
  readonly quickCreate = signal<IssueStatus | null>(null);
  readonly quickTitle = signal('');

  readonly project = computed(() => this.board.getProject(this.projectKey()));
  readonly sprint = computed(() => this.board.activeSprint(this.projectKey()));
  readonly columns = this.board.columns;

  issuesFor(status: IssueStatus): Issue[] {
    return this.board.columnIssues(this.projectKey(), status);
  }

  filteredCount(): number {
    return this.columns.reduce((sum, column) => sum + this.issuesFor(column.id).length, 0);
  }

  sprintCount(): number {
    const sprint = this.sprint();
    return sprint ? this.board.sprintIssues(sprint.id).length : 0;
  }

  openIssue(issue: Issue): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { issue: issue.key },
      queryParamsHandling: 'merge',
    });
  }

  onDragStart(event: DragEvent, issue: Issue): void {
    this.draggedId.set(issue.id);
    event.dataTransfer?.setData('text/plain', issue.id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd(): void {
    this.draggedId.set(null);
    this.dragOver.set(null);
  }

  onDragOver(event: DragEvent, status: IssueStatus, index: number): void {
    event.preventDefault();
    this.dragOver.set({ status, index });
  }

  onDrop(event: DragEvent, status: IssueStatus, index: number): void {
    event.preventDefault();
    const id = this.draggedId() ?? event.dataTransfer?.getData('text/plain');
    if (id) {
      this.board.moveIssue(id, status, index);
    }
    this.onDragEnd();
  }

  startQuick(status: IssueStatus): void {
    this.quickCreate.set(status);
    this.quickTitle.set('');
  }

  submitQuick(status: IssueStatus): void {
    const title = this.quickTitle().trim();
    const sprint = this.sprint();
    if (!title || !sprint) {
      return;
    }

    this.board.addIssue({
      projectKey: this.projectKey(),
      title,
      description: '',
      type: 'task',
      status,
      priority: 'medium',
      assigneeId: null,
      storyPoints: null,
      labels: [],
      sprintId: sprint.id,
    });
    this.quickCreate.set(null);
    this.quickTitle.set('');
  }

  wipExceeded(status: IssueStatus, limit?: number): boolean {
    return !!limit && this.issuesFor(status).length > limit;
  }
}
