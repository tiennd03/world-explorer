import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { quietRequest } from './http-context';
import { Weather } from './models';

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface GeocodingResponse {
  results?: Array<{ name: string; latitude: number; longitude: number; country_code: string }>;
}

/** Free weather + geocoding APIs, no key needed: https://open-meteo.com */
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  /**
   * Weather for a city: first look up the city's coordinates (geocoding), then fetch the forecast.
   * Two requests chained with switchMap. If the city can't be found, use the fallback coordinates.
   */
  getForecastForCity(city: string | undefined, countryCode: string, fallback: [number, number]): Observable<Weather> {
    const coordinates$ = city ? this.findCity(city, countryCode) : of(null);
    return coordinates$.pipe(
      catchError(() => of(null)), // geocoding failed → still show weather for the fallback point
      switchMap((coords) => {
        const [lat, lon] = coords ?? fallback;
        return this.getForecast(lat, lon);
      }),
    );
  }

  /** Coordinates of a city inside a country (ISO-2 code), or null if not found. */
  findCity(name: string, countryCode: string): Observable<[number, number] | null> {
    return this.http
      .get<GeocodingResponse>('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name, count: 1, countryCode, language: 'en', format: 'json' },
        context: quietRequest(),
      })
      .pipe(
        map((res) => {
          const place = res.results?.[0];
          return place ? ([place.latitude, place.longitude] as [number, number]) : null;
        }),
      );
  }

  getForecast(lat: number, lon: number): Observable<Weather> {
    return this.http
      .get<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min',
          timezone: 'auto',
          forecast_days: 5,
        },
        // The weather card shows its own skeleton and error message
        context: quietRequest(),
      })
      .pipe(map(toWeather));
  }
}

/** Map the API's parallel arrays into one object per day — easier to loop over in a template. */
function toWeather(res: OpenMeteoResponse): Weather {
  return {
    current: {
      time: res.current.time,
      temperature: Math.round(res.current.temperature_2m),
      humidity: res.current.relative_humidity_2m,
      windSpeed: Math.round(res.current.wind_speed_10m),
      code: res.current.weather_code,
    },
    daily: res.daily.time.map((date, i) => ({
      date,
      code: res.daily.weather_code[i],
      max: Math.round(res.daily.temperature_2m_max[i]),
      min: Math.round(res.daily.temperature_2m_min[i]),
    })),
  };
}

/** WMO weather interpretation codes → label + emoji. */
export function describeWeather(code: number): { label: string; icon: string } {
  if (code === 0) return { label: 'Clear sky', icon: '☀️' };
  if (code <= 2) return { label: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { label: 'Overcast', icon: '☁️' };
  if (code <= 48) return { label: 'Fog', icon: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { label: 'Rain', icon: '🌧️' };
  if (code <= 77) return { label: 'Snow', icon: '🌨️' };
  if (code <= 82) return { label: 'Rain showers', icon: '🌦️' };
  if (code <= 86) return { label: 'Snow showers', icon: '🌨️' };
  return { label: 'Thunderstorm', icon: '⛈️' };
}
