/**
 * Review notes — which components have been looked at, and what's wrong.
 * Stored in this browser only (localStorage); "Copy notes" turns them into
 * plain text to paste into a conversation or an issue.
 */
import { useSyncExternalStore } from 'react';

export type ReviewStatus = 'good' | 'issue';

export interface Review {
  status?: ReviewStatus;
  note?: string;
  updated?: string;
}

type Store = Record<string, Review>;

const KEY = 'ds-workbench-review-v1';
const listeners = new Set<() => void>();

/**
 * Keeps only well-formed reviews. Stored data can be anything — hand-edited,
 * or written by an older version — and a bad value (`null`, a bare string)
 * used to blank the whole workbench on every load.
 */
function read(): Store {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const store: Store = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') continue;
      const { status, note, updated } = value as Record<string, unknown>;
      const review: Review = {};
      if (status === 'good' || status === 'issue') review.status = status;
      if (typeof note === 'string' && note) review.note = note;
      if (typeof updated === 'string') review.updated = updated;
      if (review.status || review.note) store[key] = review;
    }
    return store;
  } catch {
    return {};
  }
}

let cache: Store = read();

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode / blocked storage: keep working in memory for this visit.
  }
  listeners.forEach((l) => l());
}

// Another tab (or the workbench open twice) changed the notes
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = read();
      listeners.forEach((l) => l());
    }
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useReviews(): Store {
  return useSyncExternalStore(subscribe, () => cache, () => cache);
}

export function setReview(key: string, patch: Partial<Review>) {
  const prev = cache[key] ?? {};
  const merged: Review = { ...prev, ...patch, updated: new Date().toISOString() };
  if (!merged.status && !merged.note) {
    const rest = { ...cache };
    delete rest[key];
    write(rest);
    return;
  }
  write({ ...cache, [key]: merged });
}

/** The current review for one entry, outside React */
export const getReview = (key: string): Review => cache[key] ?? {};

export function clearReviews() {
  write({});
}
