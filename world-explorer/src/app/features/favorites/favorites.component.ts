import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CountryService } from '../../core/country.service';
import { FavoritesService } from '../../core/favorites.service';
import { errorMessage } from '../../core/interceptors';
import { LOADING, Loadable, errorOf, toLoadable } from '../../core/loadable';
import { CountryDetail } from '../../core/models';
import { CountryCardComponent } from '../../shared/country-card.component';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, CountryCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-2 text-3xl font-bold tracking-tight">Favourites</h1>
    <p class="mb-8 text-slate-500 dark:text-slate-400">Saved in this browser — they'll still be here next time.</p>

    @let s = state();
    @if (s.status === 'loading') {
      <div class="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
    }
    @if (errorOf(s); as e) {
      <p class="panel">{{ errorMessage(e.error) }}</p>
    }
    @if (s.status === 'success' && list().length === 0) {
      <div class="panel text-center">
        <p class="text-4xl">🤍</p>
        <p class="mt-2 font-semibold">No favourites yet</p>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Tap the heart on any country to save it here.</p>
        <a routerLink="/" class="chip mt-4 inline-block">Browse countries</a>
      </div>
    }
    @if (list().length > 0) {
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        @for (country of list(); track country.cca3) {
          <app-country-card [country]="country" [favorite]="true" (toggleFavorite)="favorites.toggle($event)" />
        }
      </div>
    }
  `,
})
export class FavoritesComponent {
  protected readonly favorites = inject(FavoritesService);
  protected readonly errorMessage = errorMessage;
  protected readonly errorOf = errorOf;

  // Reuses the cached list from CountryService — no extra request if you came from the home page
  protected readonly state = toSignal(toLoadable(inject(CountryService).getAll()), {
    // Same type as getAll() — if they differ, toSignal() can't pick the initialValue overload and adds | undefined
    initialValue: LOADING as Loadable<CountryDetail[]>,
  });

  protected readonly list = computed(() => {
    const s = this.state();
    const codes = this.favorites.codes();
    return s.status === 'success' ? s.data.filter((c) => codes.has(c.cca3)) : [];
  });
}
