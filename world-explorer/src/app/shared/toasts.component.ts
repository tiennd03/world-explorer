import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          role="status"
          class="flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg"
          [class]="toast.kind === 'error' ? 'bg-rose-600' : 'bg-slate-800'"
        >
          <span class="flex-1">{{ toast.text }}</span>
          <button type="button" class="opacity-80 hover:opacity-100" aria-label="Dismiss" (click)="toasts.dismiss(toast.id)">
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastsComponent {
  protected readonly toasts = inject(ToastService);
}
