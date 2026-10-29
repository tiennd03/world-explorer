import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'World Explorer',
    loadComponent: () =>
      import('./features/countries/country-list.component').then((m) => m.CountryListComponent),
  },
  {
    path: 'country/:code',
    title: 'Country · World Explorer',
    loadComponent: () =>
      import('./features/country-detail/country-detail.component').then((m) => m.CountryDetailComponent),
  },
  {
    path: 'favorites',
    title: 'Favourites · World Explorer',
    loadComponent: () => import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: '**',
    title: 'Not found · World Explorer',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
