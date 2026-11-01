import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountrySummary } from '../core/models';
import { FavoriteButtonComponent } from './favorite-button.component';

@Component({
  selector: 'app-country-card',
  imports: [RouterLink, DecimalPipe, FavoriteButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = country();
    <article
      class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white
        transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <a [routerLink]="['/country', c.cca3]" class="flex h-full flex-col">
        <div class="aspect-[3/2] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            [src]="c.flags.svg"
            [alt]="c.flags.alt || 'Flag of ' + c.name.common"
            width="300"
            height="200"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div class="flex flex-1 flex-col gap-1 p-4">
          <h3 class="pr-8 font-semibold leading-snug">{{ c.name.common }}</h3>
          <dl class="mt-1 space-y-0.5 text-sm text-slate-500 dark:text-slate-400">
            <div><dt class="inline">Capital: </dt><dd class="inline">{{ c.capital?.[0] ?? '—' }}</dd></div>
            <div><dt class="inline">Region: </dt><dd class="inline">{{ c.region }}</dd></div>
            <div><dt class="inline">Population: </dt><dd class="inline">{{ c.population ? (c.population | number) : '—' }}</dd></div>
          </dl>
        </div>
      </a>
      <app-favorite-button
        class="absolute right-3 top-3"
        [active]="favorite()"
        [label]="c.name.common"
        (toggled)="toggleFavorite.emit(c.cca3)"
      />
    </article>
  `,
})
export class CountryCardComponent {
  readonly country = input.required<CountrySummary>();
  readonly favorite = input(false);
  readonly toggleFavorite = output<string>();
}
