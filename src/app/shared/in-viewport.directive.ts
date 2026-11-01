import { DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

/**
 * Emits when the element scrolls near the viewport. Used as an "infinite scroll" sentinel:
 * <div (appInViewport)="loadMore()"></div>
 */
@Directive({ selector: '[appInViewport]' })
export class InViewportDirective {
  readonly appInViewport = output<void>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // rootMargin: start loading 400px before the sentinel is actually visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) this.appInViewport.emit();
      },
      { rootMargin: '400px' },
    );
    observer.observe(element);

    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
