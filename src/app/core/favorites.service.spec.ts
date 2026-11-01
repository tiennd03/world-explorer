import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

const KEY = 'world-explorer.favorites';

describe('FavoritesService', () => {
  beforeEach(() => localStorage.removeItem(KEY));
  afterEach(() => localStorage.removeItem(KEY));

  it('toggles a country on and off', () => {
    const favorites = TestBed.inject(FavoritesService);
    favorites.toggle('VNM');
    expect(favorites.has('VNM')).toBeTrue();
    expect(favorites.count()).toBe(1);
    favorites.toggle('VNM');
    expect(favorites.has('VNM')).toBeFalse();
  });

  it('saves to localStorage', () => {
    const favorites = TestBed.inject(FavoritesService);
    favorites.toggle('JPN');
    TestBed.tick(); // run the save effect
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['JPN']);
  });

  it('loads saved favourites and ignores bad data', () => {
    localStorage.setItem(KEY, JSON.stringify(['FRA', 42]));
    const favorites = TestBed.inject(FavoritesService);
    expect(favorites.has('FRA')).toBeTrue();
    expect(favorites.count()).toBe(1);
  });
});
