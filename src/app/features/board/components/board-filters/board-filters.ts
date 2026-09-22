import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';
import {
  ISSUE_PRIORITIES,
  ISSUE_TYPES,
  ISSUE_TYPE_META,
  PRIORITY_META,
} from '../../models/board.model';

@Component({
  selector: 'app-board-filters',
  imports: [FormsModule],
  templateUrl: './board-filters.html',
  styleUrl: './board-filters.css',
})
export class BoardFiltersBar {
  readonly board = inject(BoardService);
  readonly matched = input(0);
  readonly total = input(0);

  readonly types = ISSUE_TYPES;
  readonly priorities = ISSUE_PRIORITIES;
  readonly typeMeta = ISSUE_TYPE_META;
  readonly priorityMeta = PRIORITY_META;
}
