import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { CountryService } from '../../core/country.service';
import { FavoritesService } from '../../core/favorites.service';
import { errorMessage } from '../../core/interceptors';
import { LOADING, Loadable, errorOf, successOf, toLoadable } from '../../core/loadable';
import { CountryDetail, REGIONS, SORT_OPTIONS, SortKey, normalizeText } from '../../core/models';
import { CountryCardComponent } from '../../shared/country-card.component';
import { InViewportDirective } from '../../shared/in-viewport.directive';

const PAGE_SIZE = 24;

@Component({
  selector: 'app-country-list',
  imports: [ReactiveFormsModule, DecimalPipe, CountryCardComponent, InViewportDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-list.component.html',
})
export class CountryListComponent {
  private readonly router = inject(Router);
  private readonly countryService = inject(CountryService);
  protected readonly favorites = inject(FavoritesService);

  // Filters live in the URL (?q=viet&region=Asia&sort=population), so a filtered view can be
  // bookmarked or shared. withComponentInputBinding() copies query params into these inputs.
  readonly q = input<string>();
  readonly region = input<string>();
  readonly sort = input<string>();

  protected readonly regions = REGIONS;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly errorMessage = errorMessage;
  protected readonly errorOf = errorOf;
  protected readonly successOf = successOf;

  protected readonly search = new FormControl('', { nonNullable: true });

  /** Bumping this re-runs the request (the "Try again" button). */
  private readonly reloadTrigger = signal(0);
  protected readonly state = toSignal(
    toObservable(this.reloadTrigger).pipe(switchMap(() => toLoadable(this.countryService.getAll()))),
    { initialValue: LOADING as Loadable<CountryDetail[]> },
  );

  protected readonly activeSort = computed<SortKey>(() => {
    const sort = this.sort();
    return sort === 'population' || sort === 'area' ? sort : 'name';
  });

  protected readonly filtered = computed(() => {
    const state = this.state();
    if (state.status !== 'success') return [];

    const query = normalizeText(this.q() ?? '');
    const region = this.region();
    const list = state.data.filter(
      (c) =>
        (!region || c.region === region) &&
        (!query ||
          normalizeText(c.name.common).includes(query) ||
          normalizeText(c.name.official).includes(query) ||
          (c.capital ?? []).some((capital) => normalizeText(capital).includes(query))),
    );

    switch (this.activeSort()) {
      case 'population':
        return list.sort((a, b) => b.population - a.population);
      case 'area':
        return list.sort((a, b) => b.area - a.area);
      default:
        return list; // already sorted by name in the service
    }
  });

  /** How many cards are rendered. Resets to one page whenever the filtered list changes. */
  protected readonly visibleCount = linkedSignal({
    source: this.filtered,
    computation: () => PAGE_SIZE,
  });

  protected readonly visible = computed(() => this.filtered().slice(0, this.visibleCount()));
  protected readonly remaining = computed(() => this.filtered().length - this.visible().length);

  constructor() {
    // URL → search box (on first load, and when the user navigates back/forward)
    effect(() => {
      const q = this.q() ?? '';
      if (q !== this.search.value) this.search.setValue(q, { emitEvent: false });
    });

    // Search box → URL, at most once per 300 ms of typing
    this.search.valueChanges
      .pipe(
        debounceTime(300),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((q) => this.updateParams({ q: q || null }));
  }

  protected setRegion(region: string | null): void {
    this.updateParams({ region });
  }

  protected setSort(sort: string): void {
    this.updateParams({ sort: sort === 'name' ? null : sort });
  }

  protected clearFilters(): void {
    this.search.setValue('', { emitEvent: false });
    this.updateParams({ q: null, region: null, sort: null });
  }

  protected loadMore(): void {
    if (this.remaining() > 0) this.visibleCount.update((n) => n + PAGE_SIZE);
  }

  protected retry(): void {
    // A failed request isn't cached (shareReplay resets on error), so subscribing again re-requests
    this.reloadTrigger.update((n) => n + 1);
  }

  /** `null` removes a param from the URL. replaceUrl keeps typing from filling the back-button history. */
  private updateParams(params: Record<string, string | null>): void {
    void this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
