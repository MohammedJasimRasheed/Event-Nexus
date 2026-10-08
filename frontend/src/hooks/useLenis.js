import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Custom hook to initialize Lenis smooth scrolling
 * Provides smooth scrolling experience
 */
export const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    let rafId;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
};

/**
 * Initialize Lenis on a specific element (for horizontal scrolling)
 */
export const initHorizontalLenis = (element, options = {}) => {
  if (!element) return null;

  const lenis = new Lenis({
    wrapper: element,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'horizontal',
    gestureDirection: 'horizontal',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    ...options,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return lenis;
};

export default useLenis;
