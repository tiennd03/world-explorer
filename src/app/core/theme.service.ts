import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

const STORAGE_KEY = 'world-explorer.theme';

/** Light / dark theme. The initial class is set by a tiny script in index.html to avoid a flash. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly dark = signal(this.root.classList.contains('dark'));

  constructor() {
    effect(() => {
      const dark = this.dark();
      this.root.classList.toggle('dark', dark);
      try {
        localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
      } catch {
        // ignore
      }
    });
  }

  toggle(): void {
    this.dark.update((d) => !d);
  }
}
