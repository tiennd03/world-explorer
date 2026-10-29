import { Injectable, computed, effect, signal } from '@angular/core';

const STORAGE_KEY = 'world-explorer.favorites';

function readSaved(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/** Favourite countries (by cca3 code), saved in the browser so they survive a reload. */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly _codes = signal<ReadonlySet<string>>(new Set(readSaved()));

  readonly codes = this._codes.asReadonly();
  readonly count = computed(() => this._codes().size);

  constructor() {
    // Runs once at start and again whenever the set changes
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._codes()]));
      } catch {
        // Storage can be blocked (private mode); favourites then just last for this visit
      }
    });
  }

  has(code: string): boolean {
    return this._codes().has(code);
  }

  toggle(code: string): void {
    // Build a new Set instead of mutating — a signal only notifies when it gets a new value
    this._codes.update((current) => {
      const next = new Set(current);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }
}
