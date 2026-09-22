import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { BoardService } from '../../../../core/services/board.service';
import {
  BOARD_COLUMNS,
  ISSUE_TYPE_META,
  IssueType,
  STATUS_META,
} from '../../models/board.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  private readonly route = inject(ActivatedRoute);
  readonly board = inject(BoardService);
  readonly columns = BOARD_COLUMNS;
  readonly statusMeta = STATUS_META;
  readonly typeMeta = ISSUE_TYPE_META;
  readonly types = Object.keys(ISSUE_TYPE_META) as IssueType[];

  readonly projectKey = toSignal(
    this.route.parent!.paramMap.pipe(map((params) => params.get('key') ?? '')),
    { initialValue: this.route.parent?.snapshot.paramMap.get('key') ?? '' },
  );

  readonly project = computed(() => this.board.getProject(this.projectKey()));
  readonly sprint = computed(() => this.board.activeSprint(this.projectKey()));
  readonly issues = computed(() => this.board.projectIssues(this.projectKey()));
  readonly sprintIssues = computed(() => {
    const sprint = this.sprint();
    return sprint
      ? this.board.issues().filter((issue) => issue.sprintId === sprint.id)
      : [];
  });

  readonly statusCounts = computed(() => {
    const issues = this.sprintIssues();
    return this.columns.map((column) => ({
      ...column,
      count: issues.filter((issue) => issue.status === column.id).length,
    }));
  });

  readonly typeCounts = computed(() => {
    const issues = this.issues();
    return this.types.map((type) => ({
      type,
      count: issues.filter((issue) => issue.type === type).length,
    }));
  });

  readonly assigneeCounts = computed(() => {
    const issues = this.issues();
    const rows = this.board.users.map((user) => ({
      name: user.name,
      color: user.color,
      count: issues.filter((issue) => issue.assigneeId === user.id).length,
    }));
    rows.push({
      name: 'Unassigned',
      color: '#6B778C',
      count: issues.filter((issue) => !issue.assigneeId).length,
    });
    return rows.filter((row) => row.count > 0);
  });

  readonly progress = computed(() => {
    const issues = this.sprintIssues();
    const done = issues.filter((issue) => issue.status === 'done').length;
    const total = issues.length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    const pointsTotal = issues.reduce((sum, issue) => sum + (issue.storyPoints ?? 0), 0);
    const pointsDone = issues
      .filter((issue) => issue.status === 'done')
      .reduce((sum, issue) => sum + (issue.storyPoints ?? 0), 0);
    return { done, total, percent, pointsDone, pointsTotal };
  });

  barWidth(count: number, max: number): string {
    return `${max ? Math.max(8, (count / max) * 100) : 0}%`;
  }

  maxCount(values: { count: number }[]): number {
    return Math.max(1, ...values.map((value) => value.count));
  }
}
