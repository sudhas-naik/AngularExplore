import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="stack" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <p class="toast">{{ toast.message }}</p>
      }
    </div>
  `,
  styles: `
    .stack {
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      z-index: 80;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }

    .toast {
      margin: 0;
      padding: 0.7rem 0.95rem;
      border-radius: 0.5rem;
      background: rgba(12, 22, 42, 0.92);
      color: #eaf3ff;
      border: 1px solid rgba(142, 194, 255, 0.28);
      box-shadow: 0 12px 28px rgba(5, 10, 22, 0.35);
      font-size: 0.875rem;
      animation: pop-in 0.25s ease;
    }

    @keyframes pop-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class ToastHost {
  readonly toasts = inject(ToastService);
}
