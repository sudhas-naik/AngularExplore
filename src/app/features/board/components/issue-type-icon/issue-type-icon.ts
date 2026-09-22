import { Component, input } from '@angular/core';
import { IssueType } from '../../models/board.model';

@Component({
  selector: 'app-issue-type-icon',
  template: `
    @switch (type()) {
      @case ('story') {
        <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="#22A06B"
            d="M3.5 1.5h9A1.5 1.5 0 0 1 14 3v11.2a.8.8 0 0 1-1.22.68L8 12.1l-4.78 2.78A.8.8 0 0 1 2 14.2V3A1.5 1.5 0 0 1 3.5 1.5Z"
          />
        </svg>
      }
      @case ('task') {
        <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 16 16" aria-hidden="true">
          <rect width="14" height="14" x="1" y="1" fill="#1D7AFC" rx="2" />
          <path
            fill="#fff"
            d="M6.7 10.6 4.4 8.3l.9-.9 1.4 1.4 3.9-3.9.9.9z"
          />
        </svg>
      }
      @case ('bug') {
        <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="#E34935" />
          <path
            fill="#fff"
            d="M8 4.2a.9.9 0 0 1 .9.9v3.4a.9.9 0 0 1-1.8 0V5.1A.9.9 0 0 1 8 4.2Zm0 7.6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          />
        </svg>
      }
      @case ('epic') {
        <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 16 16" aria-hidden="true">
          <rect width="14" height="14" x="1" y="1" fill="#6E5DC6" rx="2" />
          <path fill="#fff" d="M9.6 2.8 4.2 9.2h3.1L6.4 13.2 11.8 6.8H8.7z" />
        </svg>
      }
    }
  `,
})
export class IssueTypeIcon {
  readonly type = input.required<IssueType>();
  readonly size = input(16);
}
