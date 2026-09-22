import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string): void {
    const id = crypto.randomUUID();
    this.toastsSignal.update((toasts) => [...toasts, { id, message }]);
    setTimeout(() => this.dismiss(id), 2800);
  }

  dismiss(id: string): void {
    this.toastsSignal.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
