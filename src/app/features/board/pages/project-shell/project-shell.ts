import { Component, computed, HostListener, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { BoardService } from '../../../../core/services/board.service';
import { CreateIssueDialog } from '../../components/create-issue-dialog/create-issue-dialog';
import { IssuePanel } from '../../components/issue-panel/issue-panel';

@Component({
  selector: 'app-project-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IssuePanel, CreateIssueDialog],
  templateUrl: './project-shell.html',
  styleUrl: './project-shell.css',
})
export class ProjectShell {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly board = inject(BoardService);

  readonly projectKey = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('key') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('key') ?? '' },
  );

  readonly issueKey = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('issue'))),
    { initialValue: this.route.snapshot.queryParamMap.get('issue') },
  );

  readonly project = computed(() => this.board.getProject(this.projectKey()));
  readonly selectedIssue = computed(() => {
    const key = this.issueKey();
    return key ? this.board.getIssueByKey(key) : undefined;
  });
  readonly issueCount = computed(
    () => this.board.projectIssues(this.projectKey()).length,
  );

  closeIssue(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { issue: null },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy(): void {
    this.board.closeCreate();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.board.createOpen()) {
      this.board.closeCreate();
      return;
    }
    if (this.selectedIssue()) {
      this.closeIssue();
    }
  }
}
