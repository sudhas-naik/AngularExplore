import { Injectable, computed, signal } from '@angular/core';
import {
  BOARD_COLUMNS,
  BoardColumn,
  BoardFilters,
  BoardUser,
  EMPTY_FILTERS,
  Issue,
  IssueStatus,
  NewIssue,
  NewProject,
  Project,
  Sprint,
} from '../../features/board/models/board.model';
import {
  CURRENT_USER_ID,
  SEED_ISSUES,
  SEED_PROJECTS,
  SEED_SPRINTS,
  SEED_USERS,
} from '../../features/board/data/seed';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly projectsSignal = signal<Project[]>(SEED_PROJECTS);
  private readonly sprintsSignal = signal<Sprint[]>(SEED_SPRINTS);
  private readonly issuesSignal = signal<Issue[]>(SEED_ISSUES);
  private readonly filtersSignal = signal<BoardFilters>({ ...EMPTY_FILTERS });
  private readonly createOpenSignal = signal(false);

  readonly currentUserId = CURRENT_USER_ID;
  readonly users = SEED_USERS;
  readonly columns: BoardColumn[] = BOARD_COLUMNS;

  readonly projects = this.projectsSignal.asReadonly();
  readonly sprints = this.sprintsSignal.asReadonly();
  readonly issues = this.issuesSignal.asReadonly();
  readonly filters = this.filtersSignal.asReadonly();
  readonly createOpen = this.createOpenSignal.asReadonly();

  readonly currentUser = computed(
    () => this.users.find((user) => user.id === this.currentUserId) ?? this.users[0],
  );

  readonly projectCount = computed(() => this.projectsSignal().length);
  readonly issueCount = computed(() => this.issuesSignal().length);

  getUser(id: string | null | undefined): BoardUser | undefined {
    if (!id) {
      return undefined;
    }
    return this.users.find((user) => user.id === id);
  }

  getProject(key: string): Project | undefined {
    return this.projectsSignal().find((project) => project.key === key);
  }

  getIssueByKey(key: string): Issue | undefined {
    return this.issuesSignal().find((issue) => issue.key === key);
  }

  getIssueById(id: string): Issue | undefined {
    return this.issuesSignal().find((issue) => issue.id === id);
  }

  activeSprint(projectKey: string): Sprint | undefined {
    return this.sprintsSignal().find(
      (sprint) => sprint.projectKey === projectKey && sprint.status === 'active',
    );
  }

  plannedSprint(projectKey: string): Sprint | undefined {
    return this.sprintsSignal().find(
      (sprint) => sprint.projectKey === projectKey && sprint.status === 'planned',
    );
  }

  projectIssues(projectKey: string): Issue[] {
    return this.issuesSignal().filter((issue) => issue.projectKey === projectKey);
  }

  matchesFilters(issue: Issue): boolean {
    const filters = this.filtersSignal();
    const query = filters.query.trim().toLowerCase();

    if (query) {
      const haystack = `${issue.key} ${issue.title} ${issue.labels.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (filters.onlyMine && issue.assigneeId !== this.currentUserId) {
      return false;
    }

    if (filters.assigneeId === 'unassigned' && issue.assigneeId) {
      return false;
    }

    if (
      filters.assigneeId &&
      filters.assigneeId !== 'unassigned' &&
      issue.assigneeId !== filters.assigneeId
    ) {
      return false;
    }

    if (filters.type && issue.type !== filters.type) {
      return false;
    }

    if (filters.priority && issue.priority !== filters.priority) {
      return false;
    }

    return true;
  }

  columnIssues(projectKey: string, status: IssueStatus): Issue[] {
    const sprint = this.activeSprint(projectKey);
    if (!sprint) {
      return [];
    }

    return this.issuesSignal()
      .filter(
        (issue) =>
          issue.projectKey === projectKey &&
          issue.sprintId === sprint.id &&
          issue.status === status &&
          this.matchesFilters(issue),
      )
      .sort((a, b) => a.rank - b.rank);
  }

  sprintIssues(sprintId: string): Issue[] {
    return this.issuesSignal()
      .filter((issue) => issue.sprintId === sprintId && this.matchesFilters(issue))
      .sort((a, b) => a.rank - b.rank);
  }

  backlogIssues(projectKey: string): Issue[] {
    return this.issuesSignal()
      .filter(
        (issue) =>
          issue.projectKey === projectKey &&
          issue.sprintId === null &&
          this.matchesFilters(issue),
      )
      .sort((a, b) => a.rank - b.rank);
  }

  setFilters(patch: Partial<BoardFilters>): void {
    this.filtersSignal.update((filters) => ({ ...filters, ...patch }));
  }

  resetFilters(): void {
    this.filtersSignal.set({ ...EMPTY_FILTERS });
  }

  openCreate(): void {
    this.createOpenSignal.set(true);
  }

  closeCreate(): void {
    this.createOpenSignal.set(false);
  }

  addProject(input: NewProject): Project | null {
    const key = input.key.trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9]{1,9}$/.test(key) || this.getProject(key)) {
      return null;
    }

    const project: Project = {
      key,
      name: input.name.trim(),
      description: input.description.trim(),
      leadId: this.currentUserId,
      color: this.nextProjectColor(),
    };

    this.projectsSignal.update((projects) => [...projects, project]);
    this.ensureSprint(key);
    return project;
  }

  addIssue(input: NewIssue): Issue {
    const issue: Issue = {
      id: crypto.randomUUID(),
      key: this.nextIssueKey(input.projectKey),
      projectKey: input.projectKey,
      title: input.title.trim(),
      description: input.description.trim(),
      type: input.type,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId,
      reporterId: this.currentUserId,
      storyPoints: input.storyPoints,
      labels: input.labels,
      sprintId: input.sprintId,
      rank: this.nextRank(input.projectKey, input.status, input.sprintId),
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.issuesSignal.update((issues) => [...issues, issue]);
    return issue;
  }

  updateIssue(id: string, patch: Partial<Omit<Issue, 'id' | 'key' | 'projectKey' | 'createdAt'>>): void {
    this.issuesSignal.update((issues) =>
      issues.map((issue) =>
        issue.id === id ? { ...issue, ...patch, updatedAt: new Date() } : issue,
      ),
    );
  }

  deleteIssue(id: string): void {
    this.issuesSignal.update((issues) => issues.filter((issue) => issue.id !== id));
  }

  addComment(issueId: string, body: string): void {
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }

    this.issuesSignal.update((issues) =>
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              updatedAt: new Date(),
              comments: [
                ...issue.comments,
                {
                  id: crypto.randomUUID(),
                  authorId: this.currentUserId,
                  body: trimmed,
                  createdAt: new Date(),
                },
              ],
            }
          : issue,
      ),
    );
  }

  moveIssue(id: string, status: IssueStatus, index: number): void {
    this.issuesSignal.update((issues) => {
      const issue = issues.find((item) => item.id === id);
      if (!issue) {
        return issues;
      }

      const column = issues
        .filter(
          (item) =>
            item.id !== id &&
            item.projectKey === issue.projectKey &&
            item.sprintId === issue.sprintId &&
            item.status === status,
        )
        .sort((a, b) => a.rank - b.rank);

      const insertAt = Math.max(0, Math.min(index, column.length));
      const reordered = [
        ...column.slice(0, insertAt),
        { ...issue, status },
        ...column.slice(insertAt),
      ];
      const ranks = new Map(reordered.map((item, rank) => [item.id, rank]));

      return issues.map((item) => {
        const rank = ranks.get(item.id);
        if (rank === undefined) {
          return item;
        }
        if (item.id === id) {
          return { ...item, status, rank, updatedAt: new Date() };
        }
        return { ...item, rank };
      });
    });
  }

  setIssueSprint(id: string, sprintId: string | null, index = Number.MAX_SAFE_INTEGER): void {
    this.issuesSignal.update((issues) => {
      const issue = issues.find((item) => item.id === id);
      if (!issue) {
        return issues;
      }

      const status: IssueStatus = sprintId ? issue.status : 'todo';
      const bucket = issues
        .filter(
          (item) =>
            item.id !== id &&
            item.projectKey === issue.projectKey &&
            item.sprintId === sprintId,
        )
        .sort((a, b) => a.rank - b.rank);

      const insertAt = Math.max(0, Math.min(index, bucket.length));
      const reordered = [
        ...bucket.slice(0, insertAt),
        { ...issue, sprintId, status },
        ...bucket.slice(insertAt),
      ];
      const ranks = new Map(reordered.map((item, rank) => [item.id, rank]));

      return issues.map((item) => {
        const rank = ranks.get(item.id);
        if (rank === undefined) {
          return item;
        }
        if (item.id === id) {
          return { ...item, sprintId, status, rank, updatedAt: new Date() };
        }
        return { ...item, rank };
      });
    });
  }

  createSprint(projectKey: string, name?: string, goal = ''): Sprint {
    const count =
      this.sprintsSignal().filter((sprint) => sprint.projectKey === projectKey).length + 1;
    const sprint: Sprint = {
      id: crypto.randomUUID(),
      projectKey,
      name: name?.trim() || `${projectKey} Sprint ${count}`,
      goal,
      status: 'planned',
      startDate: null,
      endDate: null,
    };
    this.sprintsSignal.update((sprints) => [...sprints, sprint]);
    return sprint;
  }

  startSprint(sprintId: string): void {
    const sprint = this.sprintsSignal().find((item) => item.id === sprintId);
    if (!sprint || this.activeSprint(sprint.projectKey)) {
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14);

    this.sprintsSignal.update((sprints) =>
      sprints.map((item) =>
        item.id === sprintId ? { ...item, status: 'active', startDate, endDate } : item,
      ),
    );
  }

  completeSprint(sprintId: string): void {
    const sprint = this.sprintsSignal().find((item) => item.id === sprintId);
    if (!sprint) {
      return;
    }

    this.issuesSignal.update((issues) =>
      issues.map((issue) =>
        issue.sprintId === sprintId && issue.status !== 'done'
          ? { ...issue, sprintId: null, status: 'todo', updatedAt: new Date() }
          : issue,
      ),
    );

    this.sprintsSignal.update((sprints) =>
      sprints.map((item) => (item.id === sprintId ? { ...item, status: 'completed' } : item)),
    );

    this.ensureSprint(sprint.projectKey);
  }

  private ensureSprint(projectKey: string): void {
    const open = this.sprintsSignal().some(
      (sprint) =>
        sprint.projectKey === projectKey &&
        (sprint.status === 'active' || sprint.status === 'planned'),
    );
    if (!open) {
      this.createSprint(projectKey);
    }
  }

  private nextIssueKey(projectKey: string): string {
    const max = this.issuesSignal()
      .filter((issue) => issue.projectKey === projectKey)
      .map((issue) => Number(issue.key.split('-')[1]) || 0)
      .reduce((highest, value) => Math.max(highest, value), 0);
    return `${projectKey}-${max + 1}`;
  }

  private nextRank(projectKey: string, status: IssueStatus, sprintId: string | null): number {
    const ranks = this.issuesSignal()
      .filter(
        (issue) =>
          issue.projectKey === projectKey &&
          issue.status === status &&
          issue.sprintId === sprintId,
      )
      .map((issue) => issue.rank);
    return ranks.length ? Math.max(...ranks) + 1 : 0;
  }

  private nextProjectColor(): string {
    const palette = ['#0C66E4', '#216E4E', '#6E5DC6', '#E56910', '#C9372C', '#0D8A8A'];
    return palette[this.projectsSignal().length % palette.length];
  }
}
