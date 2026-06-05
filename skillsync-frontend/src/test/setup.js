import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia, but several of our components/animations
// touch it. Stub it so tests don't blow up when imported.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
}
