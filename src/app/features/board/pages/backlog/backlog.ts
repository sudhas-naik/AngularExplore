import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BoardService } from '../../../../core/services/board.service';
import { Issue, STATUS_META } from '../../models/board.model';
import { IssueTypeIcon } from '../../components/issue-type-icon/issue-type-icon';

@Component({
  selector: 'app-backlog',
  imports: [DatePipe, RouterLink, IssueTypeIcon],
  templateUrl: './backlog.html',
  styleUrl: './backlog.css',
})
export class Backlog {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly board = inject(BoardService);
  readonly statusMeta = STATUS_META;

  readonly projectKey = toSignal(
    this.route.parent!.paramMap.pipe(map((params) => params.get('key') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('key') ?? '' },
  );

  readonly draggedId = signal<string | null>(null);

  readonly project = computed(() => this.board.getProject(this.projectKey()));
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
