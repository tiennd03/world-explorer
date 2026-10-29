import { Observable, catchError, map, of, startWith } from 'rxjs';

/**
 * One value that describes a request in every state it can be in.
 * Templates switch on `status` instead of juggling separate loading / error / data variables.
 */
export type Loadable<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: unknown };

export const LOADING = { status: 'loading' } as const;

/** Wraps a request: emits `loading` first, then `success` with the data or `error`. Never errors itself. */
export function toLoadable<T>(source: Observable<T>): Observable<Loadable<T>> {
  return source.pipe(
    map((data): Loadable<T> => ({ status: 'success', data })),
    catchError((error: unknown) => of<Loadable<T>>({ status: 'error', error })),
    startWith(LOADING as Loadable<T>),
  );
}

// Template helpers. Narrowing `s.status === 'error'` → `s.error` doesn't work on @let variables in every
// Angular version, so templates use these with `as` instead:  @if (errorOf(s); as e) { {{ e.error }} }
// `@if (x; as y)` always narrows away null, so `y` is fully typed inside the block.

export function successOf<T>(state: Loadable<T>): { status: 'success'; data: T } | null {
  return state.status === 'success' ? state : null;
}

export function errorOf<T>(state: Loadable<T>): { status: 'error'; error: unknown } | null {
  return state.status === 'error' ? state : null;
}
