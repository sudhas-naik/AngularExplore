import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BoardService } from '../../../../core/services/board.service';
import { BOARD_COLUMNS, Issue, IssueStatus, STATUS_META } from '../../models/board.model';
import { IssueTypeIcon } from '../../components/issue-type-icon/issue-type-icon';
import { BoardFiltersBar } from '../../components/board-filters/board-filters';

type QuickLane = 'active' | 'planned' | 'backlog';

@Component({
  selector: 'app-backlog',
  imports: [DatePipe, FormsModule, RouterLink, IssueTypeIcon, BoardFiltersBar],
  templateUrl: './backlog.html',
  styleUrl: './backlog.css',
})
export class Backlog {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly board = inject(BoardService);
  readonly statusMeta = STATUS_META;
  readonly statuses = BOARD_COLUMNS;

  readonly projectKey = toSignal(
    this.route.parent!.paramMap.pipe(map((params) => params.get('key') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('key') ?? '' },
  );

  readonly draggedId = signal<string | null>(null);
  readonly quickLane = signal<QuickLane | null>(null);
  readonly quickTitle = signal('');

  constructor() {
    effect(() => {
      if (this.project() && !this.isSprint()) {
        void this.router.navigate(['/projects', this.projectKey(), 'board']);
      }
    });
  }

  readonly project = computed(() => this.board.getProject(this.projectKey()));
  readonly isSprint = computed(() => this.project()?.boardType === 'sprint');
  readonly active = computed(() => this.board.activeSprint(this.projectKey()));
  readonly planned = computed(() => this.board.plannedSprint(this.projectKey()));
  readonly backlog = computed(() => this.board.backlogIssues(this.projectKey()));
  readonly activeIssues = computed(() => {
    const sprint = this.active();
    return sprint ? this.board.sprintIssues(sprint.id) : [];
  });
  readonly plannedIssues = computed(() => {
    const sprint = this.planned();
    return sprint ? this.board.sprintIssues(sprint.id) : [];
  });
  readonly matchedCount = computed(
    () => this.activeIssues().length + this.plannedIssues().length + this.backlog().length,
  );
  readonly totalCount = computed(() => {
    const active = this.active();
    const planned = this.planned();
    return (
      (active ? this.board.sprintIssues(active.id, false).length : 0) +
      (planned ? this.board.sprintIssues(planned.id, false).length : 0) +
      this.board.backlogIssues(this.projectKey(), false).length
    );
  });
  readonly points = computed(() => {
    const sum = (issues: Issue[]) =>
      issues.reduce((total, issue) => total + (issue.storyPoints ?? 0), 0);
    return {
      active: sum(this.activeIssues()),
      planned: sum(this.plannedIssues()),
      backlog: sum(this.backlog()),
    };
  });

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
  }

  onDrop(event: DragEvent, sprintId: string | null, index: number): void {
    event.preventDefault();
    const id = this.draggedId() ?? event.dataTransfer?.getData('text/plain');
    if (id) {
      this.board.setIssueSprint(id, sprintId, index);
    }
    this.onDragEnd();
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  onStatus(issue: Issue, event: Event): void {
    event.stopPropagation();
    const status = (event.target as HTMLSelectElement).value as IssueStatus;
    this.board.moveIssue(issue.id, status, Number.MAX_SAFE_INTEGER);
  }

  startQuick(lane: QuickLane): void {
    this.quickLane.set(lane);
    this.quickTitle.set('');
  }

  submitQuick(lane: QuickLane): void {
    const title = this.quickTitle().trim();
    if (!title) {
      return;
    }

    const sprintId =
      lane === 'active' ? (this.active()?.id ?? null) : lane === 'planned' ? (this.planned()?.id ?? null) : null;

    this.board.addIssue({
      projectKey: this.projectKey(),
      title,
      description: '',
      type: 'task',
      status: 'todo',
      priority: 'medium',
      assigneeId: null,
      storyPoints: null,
      labels: [],
      sprintId,
    });
    this.quickLane.set(null);
    this.quickTitle.set('');
  }

  completeActive(): void {
    const sprint = this.active();
    if (!sprint) {
      return;
    }
    if (
      confirm(
        `Complete ${sprint.name}? Done issues stay with the sprint. Everything else returns to the backlog.`,
      )
    ) {
      this.board.completeSprint(sprint.id);
    }
  }

  startPlanned(): void {
    const sprint = this.planned();
    if (sprint) {
      this.board.startSprint(sprint.id);
    }
  }

  createSprint(): void {
    this.board.createSprint(this.projectKey());
  }
}
