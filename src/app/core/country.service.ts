import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { CountryDetail, CountrySummary } from './models';

/**
 * Country data ships with the app in public/data/countries.json, built from two open datasets
 * (see README → Data sources). It is still loaded with HttpClient, so it goes through the same
 * interceptors, loading bar and error handling as a real API — and is downloaded only once.
 */
const DATA_URL = 'data/countries.json';

@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly http = inject(HttpClient);

  private all$?: Observable<CountryDetail[]>;

  /** The full list, sorted by name. shareReplay(1) = one download, reused by every page. */
  getAll(): Observable<CountryDetail[]> {
    // If the request fails, shareReplay resets, so the next subscriber tries again.
    this.all$ ??= this.http.get<CountryDetail[]>(DATA_URL).pipe(
      map((list) => [...list].sort((a, b) => a.name.common.localeCompare(b.name.common))),
      shareReplay(1),
    );
    return this.all$;
  }

  /** One country by its 3-letter code. Unknown codes fail with a 404, like a real API would. */
  getByCode(code: string): Observable<CountryDetail> {
    const key = code.toUpperCase();
    return this.getAll().pipe(
      switchMap((list) => {
        const country = list.find((c) => c.cca3 === key);
        return country
          ? of(country)
          : throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: `${DATA_URL}#${key}` }));
      }),
    );
  }

  /** Small cards for a list of codes — used for a country's neighbours. */
  getByCodes(codes: string[]): Observable<CountrySummary[]> {
    if (codes.length === 0) return of([]);
    const wanted = new Set(codes);
    return this.getAll().pipe(map((list) => list.filter((c) => wanted.has(c.cca3))));
  }
}
