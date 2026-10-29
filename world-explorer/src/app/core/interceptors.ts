import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, retry, throwError, timer } from 'rxjs';
import { SILENT_ERRORS, SKIP_GLOBAL_LOADING } from './http-context';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';

/** Shows the top loading bar while any request is running. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADING)) return next(req);

  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};

/** Network hiccups and server errors are worth retrying; 404 or 400 will never succeed. */
function isRetryable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status === 429 || error.status >= 500);
}

export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Something went wrong.';
  if (error.status === 0) return 'Network error. Check your internet connection.';
  if (error.status === 404) return 'Not found.';
  if (error.status === 429) return 'Too many requests. Please wait a moment.';
  if (error.status >= 500) return 'The data service is having trouble. Try again later.';
  return `Request failed (${error.status}).`;
}

/** Retries GET requests twice with backoff (0.5s, 1s), then shows a toast unless the request opted out. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    retry({
      count: req.method === 'GET' ? 2 : 0,
      delay: (error, retryCount) =>
        isRetryable(error) ? timer(500 * 2 ** (retryCount - 1)) : throwError(() => error),
    }),
    catchError((error: unknown) => {
      if (!req.context.get(SILENT_ERRORS)) toast.error(errorMessage(error));
      return throwError(() => error);
    }),
  );
};
