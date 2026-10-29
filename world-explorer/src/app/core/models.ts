/** A country as stored in public/data/countries.json (the fields the list needs). */
export interface CountrySummary {
  cca3: string;
  cca2: string;
  name: { common: string; official: string };
  flags: { svg: string; png: string; alt?: string };
  capital?: string[];
  region: string;
  population: number;
  area: number;
}

/** All fields of a country. */
export interface CountryDetail extends CountrySummary {
  subregion?: string;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
  borders?: string[];
  timezones: string[];
  /** Centre of the country — used for the weather if the capital can't be found. */
  latlng: [number, number];
  maps: { googleMaps: string };
}

export interface Weather {
  current: {
    time: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    code: number;
  };
  daily: Array<{ date: string; code: number; max: number; min: number }>;
}

export const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'] as const;

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'population', label: 'Population' },
  { value: 'area', label: 'Area' },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]['value'];

/** Lowercase and strip accents so "cote" matches "Côte d'Ivoire". */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
