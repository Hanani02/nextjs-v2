'use client';

declare global {
  interface Window {
    __currentScrollAnim?: number;
    __currentScrollCleanup?: () => void;
  }
}

/**
 * High-performance, butter-smooth scroll to a target vertical position.
 * Uses requestAnimationFrame with an exponential/quartic ease-out deceleration curve.
 * Fast, responsive (~380ms - 580ms), and completely immune to browser CSS lag or native distance limits.
 */
export function smoothScrollTo(
  targetY: number,
  options?: { duration?: number; onComplete?: () => void }
) {
  if (typeof window === 'undefined') return;

  const startY = window.pageYOffset || document.documentElement.scrollTop || 0;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    if (options?.onComplete) options.onComplete();
    return;
  }

  // Cancel any running scroll animation and cleanup previous scrollBehavior
  if (window.__currentScrollAnim) {
    cancelAnimationFrame(window.__currentScrollAnim);
    window.__currentScrollAnim = undefined;
  }
  if (window.__currentScrollCleanup) {
    window.__currentScrollCleanup();
    window.__currentScrollCleanup = undefined;
  }

  // Temporarily set html scrollBehavior to 'auto' so RAF updates aren't fighting CSS smooth scrolling
  const root = document.documentElement;
  const originalScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';

  const cleanup = () => {
    root.style.scrollBehavior = originalScrollBehavior;
    window.__currentScrollAnim = undefined;
    window.__currentScrollCleanup = undefined;
  };

  window.__currentScrollCleanup = cleanup;

  // Dynamic duration calculation:
  // Short distance (~800px): ~360ms
  // Huge distance (e.g. Contact to Home ~7000px): ~540ms - fast, energetic, silky soft landing!
  const duration =
    options?.duration ??
    Math.min(580, Math.max(340, Math.round(Math.sqrt(Math.abs(distance)) * 6.2)));

  let startTime: number | null = null;

  // Quartic ease-out curve: high initial velocity, ultra-smooth deceleration
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

  function step(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeOutQuart(progress);

    window.scrollTo(0, Math.round(startY + distance * ease));

    if (progress < 1) {
      window.__currentScrollAnim = requestAnimationFrame(step);
    } else {
      cleanup();
      if (options?.onComplete) options.onComplete();
    }
  }

  window.__currentScrollAnim = requestAnimationFrame(step);
}

/**
 * Smoothly scrolls to an element by its ID with an optional header offset.
 */
export function smoothScrollToSection(
  sectionId: string,
  options?: { offset?: number; duration?: number; onComplete?: () => void }
) {
  if (typeof window === 'undefined') return;

  const id = sectionId.replace('#', '');
  const navOffset = options?.offset ?? 90;

  if (id === 'home' || id === '') {
    smoothScrollTo(0, options);
    return;
  }

  const el = document.getElementById(id);
  if (el) {
    const elementTop = el.getBoundingClientRect().top;
    const targetY = Math.max(0, elementTop + (window.pageYOffset || 0) - navOffset);
    smoothScrollTo(targetY, options);
  } else if (id === 'home') {
    smoothScrollTo(0, options);
  }
}
