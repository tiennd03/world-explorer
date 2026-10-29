import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FavoritesService } from './core/favorites.service';
import { LoadingService } from './core/loading.service';
import { ThemeService } from './core/theme.service';
import { ToastsComponent } from './shared/toasts.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading.isLoading()) {
      <div class="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-indigo-100 dark:bg-indigo-950" role="progressbar" aria-label="Loading">
        <div class="h-full w-1/4 bg-indigo-600 [animation:loading-bar_1s_ease-in-out_infinite]"></div>
      </div>
    }

    <header
      class="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80"
    >
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <a routerLink="/" class="mr-auto flex items-center gap-2 font-semibold">
          <img src="favicon.svg" alt="" width="28" height="28" />
          <span>World Explorer</span>
        </a>

        <nav class="flex items-center gap-1 text-sm font-medium">
          <a
            routerLink="/"
            routerLinkActive="bg-slate-100 dark:bg-slate-800"
            [routerLinkActiveOptions]="{ exact: true }"
            class="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Explore
          </a>
          <a
            routerLink="/favorites"
            routerLinkActive="bg-slate-100 dark:bg-slate-800"
            class="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Favourites
            @if (favorites.count() > 0) {
              <span class="rounded-full bg-rose-500 px-1.5 text-xs text-white">{{ favorites.count() }}</span>
            }
          </a>
        </nav>

        <button
          type="button"
          (click)="theme.toggle()"
          class="grid size-9 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          [attr.aria-label]="theme.dark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ theme.dark() ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <router-outlet />
    </main>

    <footer class="mx-auto max-w-7xl px-4 pb-10 pt-4 text-sm text-slate-400 sm:px-6">
      Country data:
      <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener" class="underline hover:text-slate-600">mledoze/countries</a>
      and
      <a href="https://github.com/dr5hn/countries-states-cities-database" target="_blank" rel="noopener" class="underline hover:text-slate-600">dr5hn/countries-states-cities-database</a>
      (ODbL) · Flags:
      <a href="https://flagcdn.com" target="_blank" rel="noopener" class="underline hover:text-slate-600">Flagpedia</a>
      · Weather:
      <a href="https://open-meteo.com" target="_blank" rel="noopener" class="underline hover:text-slate-600">Open-Meteo</a>
    </footer>

    <app-toasts />
  `,
})
export class App {
  protected readonly loading = inject(LoadingService);
  protected readonly favorites = inject(FavoritesService);
  protected readonly theme = inject(ThemeService);
}
