import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-20 text-center">
      <p class="text-6xl">🧭</p>
      <h1 class="mt-4 text-2xl font-bold">Page not found</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400">This page wandered off the map.</p>
      <a routerLink="/" class="chip mt-6 inline-block">Back to all countries</a>
    </div>
  `,
})
export class NotFoundComponent {}
