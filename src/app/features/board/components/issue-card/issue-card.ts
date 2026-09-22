import { Component, computed, inject, input, output, signal } from '@angular/core';
import { BoardService } from '../../../../core/services/board.service';
import { Issue, PRIORITY_META } from '../../models/board.model';
import { IssueTypeIcon } from '../issue-type-icon/issue-type-icon';

@Component({
  selector: 'app-issue-card',
  imports: [IssueTypeIcon],
  templateUrl: './issue-card.html',
  styleUrl: './issue-card.css',
})
export class IssueCard {
  private readonly board = inject(BoardService);

  readonly issue = input.required<Issue>();
  readonly open = output<Issue>();
  readonly dragStart = output<DragEvent>();
  readonly dragEnd = output<DragEvent>();

  readonly assignee = computed(() => this.board.getUser(this.issue().assigneeId));
  readonly priority = computed(() => PRIORITY_META[this.issue().priority]);
  readonly dueLabel = computed(() => {
    const due = this.issue().dueDate;
    if (!due) {
      return null;
    }
    return new Date(due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });
  readonly overdue = computed(() => {
    const due = this.issue().dueDate;
    if (!due || this.issue().status === 'done') {
      return false;
    }
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDay < today;
  });

  readonly dragging = signal(false);

  onOpen(): void {
    if (this.dragging()) {
      return;
    }
    this.open.emit(this.issue());
  }

  onDragStart(event: DragEvent): void {
    this.dragging.set(true);
    this.dragStart.emit(event);
  }

  onDragEnd(event: DragEvent): void {
    this.dragEnd.emit(event);
    setTimeout(() => this.dragging.set(false));
  }
}
