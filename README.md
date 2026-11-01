# World Explorer

Browse every country in the world, filter by region, and open any country to see its key facts, neighbouring countries and the live weather in its capital.

Built with **Angular 20** and **Tailwind CSS 4**, with country data bundled as an open dataset and live weather from a free public API — no backend and no API keys.

> **Live demo:** [https://tiennd-world-explorer.web.app](https://tiennd-world-explorer.web.app)

<!-- Screenshots: docs/screenshots/list.png, detail.png, dark.png -->

## Features

- **Search as you type** — by country name or capital, accent-insensitive, debounced so it doesn't run on every keystroke.
- **Filter and sort** — region chips and sort by name, population or area.
- **Shareable URLs** — search, region and sort live in the query string (`/?q=viet&region=Asia&sort=population`), so any view can be bookmarked or sent to someone. Back/forward buttons work.
- **Infinite scroll** — renders 24 cards at a time and loads more as you scroll (IntersectionObserver), with a "Show more" fallback.
- **Country detail** — flag, population, area, languages, currencies, time zones, link to Google Maps.
- **Live weather** — current conditions and a 5-day forecast for the capital from Open-Meteo.
- **Neighbours** — clickable border countries; navigating between them cancels any in-flight request.
- **Favourites** — saved in localStorage, with a counter in the header.
- **Dark mode** — follows the OS on first visit, then remembers your choice, with no flash on load.
- **Resilient networking** — automatic retry with backoff on network/server errors, a global loading bar, error toasts, skeleton loaders and a "Try again" button.
- **Responsive and accessible** — mobile-first layout, keyboard focus styles, ARIA labels and live regions.

## Tech highlights

| Area | What's used |
| --- | --- |
| Angular | Standalone components, signals (`signal`, `computed`, `linkedSignal`, `effect`), `input()` / `output()`, `@let` and new control flow, `OnPush` everywhere |
| HTTP | `HttpClient` with `withFetch()`, functional interceptors (loading + retry/error), `HttpContextToken` to opt out per request |
| RxJS | `debounceTime`, `distinctUntilChanged`, `switchMap` (cancels stale requests), `shareReplay` (in-memory cache), `retry` with exponential backoff |
| State pattern | A `Loadable<T>` union (`loading` / `success` / `error`) so templates handle every state explicitly |
| Routing | Lazy-loaded routes, route + query params bound to inputs (`withComponentInputBinding`), view transitions, scroll restoration, dynamic page titles |
| Styling | Tailwind CSS 4 with a class-based dark variant and small component classes |
| Custom directive | `appInViewport` — wraps `IntersectionObserver` and cleans up with `DestroyRef` |
| Testing | 22 Jasmine tests: services with `HttpTestingController`, interceptor retry/backoff with `fakeAsync`, caching, `Loadable`, favourites |

## Project structure

```
src/app
├── core/                       # Services, models, interceptors — no UI
│   ├── country.service.ts      # loads data/countries.json once, lookups by code
│   ├── weather.service.ts      # Open-Meteo geocoding + forecast, WMO weather codes
│   ├── interceptors.ts         # loading bar, retry, error toasts
│   ├── loadable.ts             # Loadable<T> + toLoadable()
│   ├── favorites.service.ts    # localStorage-backed signal
│   └── theme.service.ts        # dark mode
├── shared/                     # Reusable UI: country card, favourite button, toasts, in-viewport directive
└── features/                   # Lazy-loaded pages: countries, country-detail, favorites, not-found
```

## Getting started

```bash
npm install
npm start
```

Open http://localhost:4200. No configuration is needed.

```bash
npm test         # unit tests (watch mode)
npm run test:ci  # single headless run, as in CI
```

## Deploy

```bash
npm run build
npx firebase-tools deploy --only hosting   # after `firebase use --add`
```

The `rewrites` rule in `firebase.json` sends every URL to `index.html` so deep links like `/country/VNM` work on reload.

## Data sources

- **Countries** — `public/data/countries.json` (250 countries), merged from
  [mledoze/countries](https://github.com/mledoze/countries) (names, capitals, borders, languages, currencies, area)
  and [dr5hn/countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database)
  (population, time zones). Both are published under the
  [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).
- **Flags** — [Flagpedia / flagcdn.com](https://flagpedia.net).
- **Weather** — [Open-Meteo](https://open-meteo.com) forecast and geocoding APIs (free, no key).

The app originally used the REST Countries API. In 2026 its old versions were shut down and the new one
requires an API key, so the data is now shipped with the app: it loads instantly, works offline-first and can't
break because a third-party API changes.

## Roadmap

- Compare two countries side by side
- Map view with country outlines
- Component tests for the list filtering
- Vietnamese translation (i18n)

## License

MIT
