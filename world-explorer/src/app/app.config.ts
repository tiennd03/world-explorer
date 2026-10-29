import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { errorInterceptor, loadingInterceptor } from './core/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(), // route params & query params → component inputs
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), // scroll to top on navigation, restore on back
      withViewTransitions(), // smooth cross-fade between pages in supporting browsers
    ),
    // Order matters: the loading bar wraps the retries, so it stays visible while retrying
    provideHttpClient(withFetch(), withInterceptors([loadingInterceptor, errorInterceptor])),
  ],
};
