import '@testing-library/jest-dom';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

expect.extend(toHaveNoViolations);

// Node 22+ injects a non-functional global localStorage stub that shadows
// jsdom's implementation under vitest. Replace it with a working in-memory
// Storage so components can call bare `localStorage` in tests.
const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, String(value)),
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  value: createMemoryStorage(),
  writable: true,
  configurable: true,
});

// `region` (all content inside landmarks) is a whole-page rule: a component
// rendered on its own, or a popover portalled to <body>, can never pass it.
// It must go through `globalOptions` — configureAxe() returns a NEW axe
// function, and tests import the default `axe` from jest-axe, so a plain
// `rules` object here was silently ignored. The global axe-core config is
// shared by every axe call in the file.
configureAxe({
  globalOptions: {
    rules: [{ id: 'region', enabled: false }],
  },
});

// jsdom shims for Radix popper-positioned components (Tooltip, Popover,
// DropdownMenu). jsdom implements none of these; Radix + floating-ui call
// them during open/close and keyboard interaction.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}

if (typeof Element.prototype.hasPointerCapture !== 'function') {
  Element.prototype.hasPointerCapture = () => false;
}

if (typeof Element.prototype.setPointerCapture !== 'function') {
  Element.prototype.setPointerCapture = () => {};
}

if (typeof Element.prototype.releasePointerCapture !== 'function') {
  Element.prototype.releasePointerCapture = () => {};
}
