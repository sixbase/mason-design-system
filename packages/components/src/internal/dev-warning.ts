/**
 * Development-only console warnings for component misuse (a missing
 * accessible name, a controlled value nobody can change). Never thrown —
 * the component still renders — and never shipped: consumer bundlers
 * (Vite, webpack, Next) replace `process.env.NODE_ENV` at build time, so a
 * production bundle sees `"production" !== "production"` and the branch is
 * dead code.
 *
 * The read sits in try/catch because this package has no Node types and an
 * unbundled browser has no `process` at all: a ReferenceError there simply
 * means "not development".
 */

// Module-scoped: shadows (does not redeclare) a global `process` when Node
// types are present in a consumer's compilation.
declare const process: { env: { NODE_ENV?: string } };

function isDevelopment(): boolean {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

const warned = new Set<string>();

/**
 * Log `message` once per `key` per page load, in development only. Keys
 * are `Component:problem` — one warning per kind of misuse, not per render.
 */
export function devWarning(key: string, message: string): void {
  if (warned.has(key) || !isDevelopment()) return;
  warned.add(key);
  console.warn(`[@ds/components] ${message}`);
}

/** Test helper: forget which warnings were already shown. */
export function resetDevWarnings(): void {
  warned.clear();
}
