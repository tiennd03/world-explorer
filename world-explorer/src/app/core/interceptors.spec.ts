import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { SILENT_ERRORS } from './http-context';
import { errorInterceptor, errorMessage, loadingInterceptor } from './interceptors';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';

describe('HTTP interceptors', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let loading: LoadingService;
  let toasts: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor, errorInterceptor])),
        provideHttpClientTesting(), // must come after provideHttpClient
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
    toasts = TestBed.inject(ToastService);
  });

  afterEach(() => backend.verify());

  it('shows the loading bar while a request is running', () => {
    http.get('/api/data').subscribe();
    expect(loading.isLoading()).toBeTrue();
    backend.expectOne('/api/data').flush({});
    expect(loading.isLoading()).toBeFalse();
  });

  it('does not retry a 404 and shows a toast', () => {
    http.get('/api/missing').subscribe({ error: () => undefined });
    backend.expectOne('/api/missing').flush(null, { status: 404, statusText: 'Not Found' });

    expect(toasts.toasts().map((t) => t.text)).toEqual(['Not found.']);
    expect(loading.isLoading()).toBeFalse();
  });

  it('retries a server error twice with backoff, then fails', fakeAsync(() => {
    let failed = false;
    http.get('/api/flaky').subscribe({ error: () => (failed = true) });

    backend.expectOne('/api/flaky').flush(null, { status: 503, statusText: 'Unavailable' });
    tick(500); // 1st retry after 0.5 s
    backend.expectOne('/api/flaky').flush(null, { status: 503, statusText: 'Unavailable' });
    tick(1000); // 2nd retry after 1 s
    backend.expectOne('/api/flaky').flush(null, { status: 503, statusText: 'Unavailable' });

    expect(failed).toBeTrue();
    expect(toasts.toasts().length).toBe(1);
    flush(); // let the toast's 5 s auto-dismiss timer finish, so fakeAsync ends cleanly
  }));

  it('succeeds if a retry works', fakeAsync(() => {
    let data: unknown;
    http.get('/api/flaky').subscribe((d) => (data = d));
    backend.expectOne('/api/flaky').flush(null, { status: 0, statusText: 'Network error' });
    tick(500);
    backend.expectOne('/api/flaky').flush({ ok: true });
    expect(data).toEqual({ ok: true });
    expect(toasts.toasts().length).toBe(0);
  }));

  it('stays quiet for requests marked SILENT_ERRORS', () => {
    http.get('/api/quiet', { context: new HttpContext().set(SILENT_ERRORS, true) }).subscribe({ error: () => undefined });
    backend.expectOne('/api/quiet').flush(null, { status: 404, statusText: 'Not Found' });
    expect(toasts.toasts().length).toBe(0);
  });
});

describe('errorMessage', () => {
  it('gives a readable message for common failures', () => {
    expect(errorMessage(new Error('x'))).toBe('Something went wrong.');
  });
});
