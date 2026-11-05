'use client';

import { useEffect } from 'react';

/**
 * Preserve the current wheel event when a nested vertical scroller reaches an
 * edge. Native chaining remains in charge until the event exceeds the inner
 * scroller's remaining range; only then is that event distributed outward.
 */
export function WheelScrollHandoff() {
  useEffect(() => {
    const scrollImmediately = (element: HTMLElement, top: number) => {
      const previousValue = element.style.getPropertyValue('scroll-behavior');
      const previousPriority = element.style.getPropertyPriority('scroll-behavior');
      element.style.setProperty('scroll-behavior', 'auto', 'important');
      element.scrollTop = top;
      if (previousValue) {
        element.style.setProperty('scroll-behavior', previousValue, previousPriority);
      } else {
        element.style.removeProperty('scroll-behavior');
      }
    };

    let pendingHandoff: {
      direction: number;
      expected: number;
      root: HTMLElement;
      rootStart: number;
      frame: number;
    } | null = null;

    const flushPendingHandoff = () => {
      if (!pendingHandoff) return;
      const pending = pendingHandoff;
      pendingHandoff = null;

      // Let the browser's uncancelable default action run first. If it chained
      // to the document, its movement already covers some or all of this delta.
      const nativeMovement = pending.direction * (pending.root.scrollTop - pending.rootStart);
      const missingMovement = Math.max(0, pending.expected - nativeMovement);
      if (missingMovement > 0.5) {
        scrollImmediately(pending.root, pending.root.scrollTop + pending.direction * missingMovement);
      }
    };

    const handoffAtBoundary = (event: WheelEvent) => {
      if (event.deltaY === 0) return;

      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const root = document.scrollingElement as HTMLElement | null;
      if (!root) return;

      const innerScrollers: HTMLElement[] = [];
      let element: HTMLElement | null = target as HTMLElement;

      while (element && element !== document.body && element !== document.documentElement) {
        const style = getComputedStyle(element);
        const canScrollVertically = /^(auto|scroll|overlay)$/.test(style.overflowY);
        if (canScrollVertically && element.scrollHeight > element.clientHeight + 1) {
          innerScrollers.push(element);
        }
        element = element.parentElement;
      }

      const firstScroller = innerScrollers[0];
      if (!firstScroller) return;

      let delta = event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        const lineHeight = parseFloat(getComputedStyle(firstScroller).lineHeight);
        delta *= Number.isFinite(lineHeight) ? lineHeight : 16;
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        delta *= firstScroller.clientHeight || window.innerHeight;
      }

      const direction = Math.sign(delta);
      let remaining = Math.abs(delta);
      const capacities = innerScrollers.map((scroller) => {
        const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        return direction > 0
          ? Math.max(0, max - scroller.scrollTop)
          : Math.max(0, scroller.scrollTop);
      });
      const totalInnerCapacity = capacities.reduce((sum, capacity) => sum + capacity, 0);

      // Keep ordinary scrolling native. Only take over when this event crosses
      // every nested scroller on its way to the document.
      if (remaining <= totalInnerCapacity + 0.01) return;

      // Later events in a continuous wheel gesture may be non-cancelable. Let
      // their native action finish, then compensate only for the portion that
      // did not reach the document. This avoids both dropped deltas and doubles.
      if (!event.cancelable) {
        const rootOverflow = Math.max(0, root.scrollHeight - root.clientHeight);
        const rootCapacity = direction > 0
          ? Math.max(0, rootOverflow - root.scrollTop)
          : Math.max(0, root.scrollTop);
        const expected = Math.min(remaining - totalInnerCapacity, rootCapacity);
        if (expected <= 0.01) return;

        if (pendingHandoff && pendingHandoff.direction !== direction) {
          cancelAnimationFrame(pendingHandoff.frame);
          flushPendingHandoff();
        }
        if (!pendingHandoff) {
          pendingHandoff = {
            direction,
            expected: 0,
            root,
            rootStart: root.scrollTop,
            frame: 0,
          };
          pendingHandoff.frame = requestAnimationFrame(flushPendingHandoff);
        }
        pendingHandoff.expected += expected;
        return;
      }

      const updates: Array<{ element: HTMLElement; top: number }> = [];
      for (const scroller of innerScrollers) {
        const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        const current = scroller.scrollTop;
        const capacity = direction > 0 ? Math.max(0, max - current) : Math.max(0, current);
        const amount = Math.min(remaining, capacity);
        if (amount > 0) {
          updates.push({ element: scroller, top: current + direction * amount });
          remaining -= amount;
        }
        if (remaining <= 0.01) break;
      }

      const rootMax = Math.max(0, root.scrollHeight - root.clientHeight);
      const rootTop = root.scrollTop;
      const rootCapacity = direction > 0 ? Math.max(0, rootMax - rootTop) : Math.max(0, rootTop);
      const rootAmount = Math.min(remaining, rootCapacity);
      if (rootAmount > 0) {
        updates.push({ element: root, top: rootTop + direction * rootAmount });
        remaining -= rootAmount;
      }

      if (!updates.length) return;

      event.preventDefault();
      for (const update of updates) {
        scrollImmediately(update.element, update.top);
      }
    };

    document.addEventListener('wheel', handoffAtBoundary, { capture: true, passive: false });
    return () => {
      document.removeEventListener('wheel', handoffAtBoundary, true);
      if (pendingHandoff) cancelAnimationFrame(pendingHandoff.frame);
    };
  }, []);

  return null;
}
