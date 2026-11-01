import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Request option: don't show the global top loading bar (the caller shows its own skeleton). */
export const SKIP_GLOBAL_LOADING = new HttpContextToken<boolean>(() => false);

/** Request option: don't show an error toast (the caller handles the error on screen). */
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

export function quietRequest(): HttpContext {
  return new HttpContext().set(SKIP_GLOBAL_LOADING, true).set(SILENT_ERRORS, true);
}
