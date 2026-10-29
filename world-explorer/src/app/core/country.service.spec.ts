import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CountryService } from './country.service';
import { CountryDetail, CountrySummary } from './models';

const country = (name: string, cca3: string, borders: string[] = []): CountryDetail => ({
  cca3,
  cca2: cca3.slice(0, 2),
  name: { common: name, official: name },
  flags: { svg: '', png: '' },
  region: 'Asia',
  population: 1,
  area: 1,
  borders,
  timezones: [],
  latlng: [0, 0],
  maps: { googleMaps: '' },
});

const DATA = [country('Vietnam', 'VNM', ['LAO']), country('Laos', 'LAO', ['VNM']), country('Albania', 'ALB')];

describe('CountryService', () => {
  let service: CountryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CountryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify()); // fails if a test left an unexpected request

  it('loads the bundled data file and sorts by name', () => {
    let names: string[] = [];
    service.getAll().subscribe((list) => (names = list.map((c) => c.name.common)));
    http.expectOne('data/countries.json').flush(DATA);
    expect(names).toEqual(['Albania', 'Laos', 'Vietnam']);
  });

  it('downloads the file only once (cache)', () => {
    service.getAll().subscribe();
    http.expectOne('data/countries.json').flush(DATA);

    let count = 0;
    service.getAll().subscribe((list) => (count = list.length));
    service.getByCode('VNM').subscribe();
    http.expectNone('data/countries.json');
    expect(count).toBe(3);
  });

  it('finds a country by code, case-insensitive', () => {
    let found: CountryDetail | undefined;
    service.getByCode('vnm').subscribe((c) => (found = c));
    http.expectOne('data/countries.json').flush(DATA);
    expect(found?.name.common).toBe('Vietnam');
  });

  it('fails with a 404 for an unknown code', () => {
    let error: unknown;
    service.getByCode('XYZ').subscribe({ error: (e) => (error = e) });
    http.expectOne('data/countries.json').flush(DATA);
    expect(error instanceof HttpErrorResponse && error.status).toBe(404);
  });

  it('returns neighbours from the same data without another request', () => {
    let result: CountrySummary[] = [];
    service.getByCodes(['LAO']).subscribe((r) => (result = r));
    http.expectOne('data/countries.json').flush(DATA);
    expect(result.map((c) => c.cca3)).toEqual(['LAO']);
  });

  it('does not touch the network when there are no neighbours', () => {
    let result: CountrySummary[] | undefined;
    service.getByCodes([]).subscribe((r) => (result = r));
    http.expectNone(() => true);
    expect(result).toEqual([]);
  });
});
