import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { of, switchMap, tap } from 'rxjs';
import { CountryService } from '../../core/country.service';
import { FavoritesService } from '../../core/favorites.service';
import { errorMessage } from '../../core/interceptors';
import { LOADING, Loadable, errorOf, successOf, toLoadable } from '../../core/loadable';
import { CountryDetail, CountrySummary, Weather } from '../../core/models';
import { WeatherService, describeWeather } from '../../core/weather.service';
import { FavoriteButtonComponent } from '../../shared/favorite-button.component';

@Component({
  selector: 'app-country-detail',
  imports: [RouterLink, DecimalPipe, DatePipe, FavoriteButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-detail.component.html',
})
export class CountryDetailComponent {
  private readonly countries = inject(CountryService);
  private readonly weatherService = inject(WeatherService);
  private readonly title = inject(Title);
  protected readonly favorites = inject(FavoritesService);
  protected readonly describeWeather = describeWeather;
  protected readonly errorMessage = errorMessage;
  protected readonly errorOf = errorOf;
  protected readonly successOf = successOf;

  /** From the route /country/:code — filled in by withComponentInputBinding(). */
  readonly code = input.required<string>();

  // switchMap: when the code changes (clicking a neighbour), the old request is cancelled
  protected readonly country = toSignal(
    toObservable(this.code).pipe(
      switchMap((code) => toLoadable(this.countries.getByCode(code))),
      tap((state) => {
        if (state.status === 'success') this.title.setTitle(`${state.data.name.common} · World Explorer`);
      }),
    ),
    { initialValue: LOADING as Loadable<CountryDetail> },
  );

  protected readonly neighbours = toSignal(
    toObservable(this.country).pipe(
      switchMap((state) =>
        state.status === 'success'
          ? toLoadable(this.countries.getByCodes(state.data.borders ?? []))
          : of(LOADING as Loadable<CountrySummary[]>),
      ),
    ),
    { initialValue: LOADING as Loadable<CountrySummary[]> },
  );

  protected readonly weather = toSignal(
    toObservable(this.country).pipe(
      switchMap((state) => {
        if (state.status !== 'success') return of(LOADING as Loadable<Weather>);
        const c = state.data;
        // Weather in the capital; if it can't be located, use the centre of the country
        return toLoadable(this.weatherService.getForecastForCity(c.capital?.[0], c.cca2, c.latlng));
      }),
    ),
    { initialValue: LOADING as Loadable<Weather> },
  );

  protected readonly facts = computed(() => {
    const state = this.country();
    if (state.status !== 'success') return [];
    const c = state.data;
    return [
      { label: 'Official name', value: c.name.official },
      { label: 'Capital', value: c.capital?.join(', ') || '—' },
      { label: 'Region', value: [c.region, c.subregion].filter(Boolean).join(' · ') },
      { label: 'Languages', value: Object.values(c.languages ?? {}).join(', ') || '—' },
      {
        label: 'Currencies',
        value:
          Object.values(c.currencies ?? {})
            .map((cur) => (cur.symbol ? `${cur.name} (${cur.symbol})` : cur.name))
            .join(', ') || '—',
      },
      { label: 'Time zones', value: c.timezones.join(', ') || '—' },
    ];
  });
}
