import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-favorite-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="toggled.emit()"
      [attr.aria-pressed]="active()"
      [attr.aria-label]="(active() ? 'Remove ' : 'Add ') + label() + (active() ? ' from favourites' : ' to favourites')"
      class="grid size-9 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-slate-200 backdrop-blur
        transition hover:scale-110 dark:bg-slate-900/90 dark:ring-slate-700"
    >
      <svg viewBox="0 0 24 24" class="size-5" [class]="active() ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-slate-500'" stroke-width="2">
        <path
          stroke-linejoin="round"
          d="M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z"
        />
      </svg>
    </button>
  `,
})
export class FavoriteButtonComponent {
  readonly active = input(false);
  readonly label = input('');
  readonly toggled = output<void>();
}
