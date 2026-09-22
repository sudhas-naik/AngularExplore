import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BoardService } from '../../../../core/services/board.service';
import { BOARD_TYPE_META, BoardType } from '../../models/board.model';

@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly board = inject(BoardService);
  readonly boardTypes = BOARD_TYPE_META;

  readonly creating = signal(false);
  readonly keyTaken = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    key: ['', [Validators.required, Validators.pattern(/^[A-Z][A-Z0-9]{1,9}$/)]],
    description: [''],
    boardType: this.fb.nonNullable.control<BoardType>('kanban'),
  });

  openCreate(): void {
    this.creating.set(true);
    this.keyTaken.set(false);
  }

  closeCreate(): void {
    this.creating.set(false);
    this.form.reset({ name: '', key: '', description: '', boardType: 'kanban' });
  }

  onName(value: string): void {
    if (!this.form.controls.key.dirty) {
      const key = value
        .toUpperCase()
        .replace(/[^A-Z0-9 ]/g, '')
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 4);
      this.form.controls.key.setValue(key);
    }
  }

  issueCount(key: string): number {
    return this.board.projectIssues(key).length;
  }

  submit(): void {
    this.form.controls.key.setValue(this.form.controls.key.value.trim().toUpperCase());
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const project = this.board.addProject(this.form.getRawValue());
    if (!project) {
      this.keyTaken.set(true);
      return;
    }

    this.closeCreate();
    void this.router.navigate(['/projects', project.key, 'board']);
  }
}
