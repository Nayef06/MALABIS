import { useCallback, useLayoutEffect, useRef } from 'react';

// Capture before changing the order, then slide each card from its old position.
export function useAnimatedReorder() {
  const containerRef = useRef(null);
  const previousRef = useRef(null);
  const animationsRef = useRef(new Map());
  const cancelAnimations = useCallback(() => {
    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current.clear();
  }, []);

  const capture = useCallback((activeId) => {
    const elements = containerRef.current?.querySelectorAll('[data-reorder-id]') || [];
    // Read the visible positions before canceling an interrupted transition.
    const positions = new Map(Array.from(elements, (element) => [
      element.dataset.reorderId, element.getBoundingClientRect(),
    ]));
    cancelAnimations();
    previousRef.current = { positions, activeId };
  }, [cancelAnimations]);

  useLayoutEffect(() => {
    const previous = previousRef.current;
    previousRef.current = null;
    if (!previous || !containerRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const movements = Array.from(containerRef.current.querySelectorAll('[data-reorder-id]'), (element) => {
      const before = previous.positions.get(element.dataset.reorderId);
      if (!before || typeof element.animate !== 'function') return null;
      const after = element.getBoundingClientRect();
      const x = before.left - after.left;
      const y = before.top - after.top;
      return Math.abs(x) < .5 && Math.abs(y) < .5 ? null : { element, x, y };
    });

    movements.forEach((movement) => {
      if (!movement) return;
      const { element, x, y } = movement;
      const zIndex = element.dataset.reorderId === previous.activeId ? '2' : '1';
      const animation = element.animate([
        { transform: `translate(${x}px, ${y}px)`, zIndex },
        { transform: 'translate(0, 0)', zIndex },
      ], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      animationsRef.current.set(element, animation);
      animation.onfinish = animation.oncancel = () => {
        if (animationsRef.current.get(element) === animation) animationsRef.current.delete(element);
      };
    });
  });

  useLayoutEffect(() => cancelAnimations, [cancelAnimations]);

  return { containerRef, capture };
}
