import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SILENT_ERRORS, SKIP_GLOBAL_LOADING } from './http-context';
import { Weather } from './models';
import { WeatherService, describeWeather } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(WeatherService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify()); // fails if a test left an unexpected request

  it('requests the forecast and maps parallel arrays into one object per day', () => {
    let result: Weather | undefined;
    service.getForecast(21.03, 105.85).subscribe((w) => (result = w));

    const req = http.expectOne((r) => r.url === 'https://api.open-meteo.com/v1/forecast');
    expect(req.request.params.get('latitude')).toBe('21.03');
    expect(req.request.params.get('forecast_days')).toBe('5');
    // The weather card has its own loading and error UI
    expect(req.request.context.get(SKIP_GLOBAL_LOADING)).toBeTrue();
    expect(req.request.context.get(SILENT_ERRORS)).toBeTrue();

    req.flush({
      current: { time: '2026-10-27T14:00', temperature_2m: 28.6, relative_humidity_2m: 70, wind_speed_10m: 9.4, weather_code: 2 },
      daily: { time: ['2026-10-27', '2026-10-28'], weather_code: [2, 61], temperature_2m_max: [31.2, 29.5], temperature_2m_min: [24.1, 23.6] },
    });

    expect(result?.current.temperature).toBe(29);
    expect(result?.daily).toEqual([
      { date: '2026-10-27', code: 2, max: 31, min: 24 },
      { date: '2026-10-28', code: 61, max: 30, min: 24 },
    ]);
  });

  const FORECAST = {
    current: { time: 't', temperature_2m: 30, relative_humidity_2m: 60, wind_speed_10m: 5, weather_code: 0 },
    daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [] },
  };

  it('looks up the capital first, then fetches weather at its coordinates', () => {
    let result: Weather | undefined;
    service.getForecastForCity('Hanoi', 'VN', [16, 107]).subscribe((w) => (result = w));

    const geo = http.expectOne((r) => r.url.includes('geocoding-api'));
    expect(geo.request.params.get('name')).toBe('Hanoi');
    expect(geo.request.params.get('countryCode')).toBe('VN');
    geo.flush({ results: [{ name: 'Hanoi', latitude: 21.03, longitude: 105.85, country_code: 'VN' }] });

    const forecast = http.expectOne((r) => r.url.includes('/v1/forecast'));
    expect(forecast.request.params.get('latitude')).toBe('21.03');
    forecast.flush(FORECAST);
    expect(result?.current.temperature).toBe(30);
  });

  it('falls back to the country centre when the city is not found', () => {
    service.getForecastForCity('Nowhere', 'VN', [16, 107]).subscribe();
    http.expectOne((r) => r.url.includes('geocoding-api')).flush({});
    const forecast = http.expectOne((r) => r.url.includes('/v1/forecast'));
    expect(forecast.request.params.get('latitude')).toBe('16');
    forecast.flush(FORECAST);
  });
});

describe('describeWeather', () => {
  it('maps WMO codes to labels', () => {
    expect(describeWeather(0).label).toBe('Clear sky');
    expect(describeWeather(3).label).toBe('Overcast');
    expect(describeWeather(63).label).toBe('Rain');
    expect(describeWeather(95).label).toBe('Thunderstorm');
  });
});
