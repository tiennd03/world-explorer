import { Subject, throwError } from 'rxjs';
import { Loadable, toLoadable } from './loadable';

describe('toLoadable', () => {
  it('emits loading first, then success with the data', () => {
    const source = new Subject<number>();
    const states: Loadable<number>[] = [];
    toLoadable(source).subscribe((s) => states.push(s));

    expect(states).toEqual([{ status: 'loading' }]);
    source.next(42);
    expect(states[1]).toEqual({ status: 'success', data: 42 });
  });

  it('turns an error into an error state instead of failing the stream', () => {
    const states: Loadable<number>[] = [];
    let failed = false;
    toLoadable(throwError(() => new Error('boom'))).subscribe({
      next: (s) => states.push(s as Loadable<number>),
      error: () => (failed = true),
    });

    expect(states.map((s) => s.status)).toEqual(['loading', 'error']);
    expect(failed).toBeFalse();
  });
});
