import { devWarning } from './dev-warning';

/**
 * Link destinations here come from store data — CMS menus, breadcrumb
 * trails, cart lines, announcement links — not from our own code. React 18
 * (inside this package's peer range) renders `href="javascript:…"` as given
 * and only warns in development, so one poisoned link runs script in the
 * shopper's session on click. React 19 blocks it; this does the same for 18.
 *
 * Browsers skip leading spaces/control characters and drop tabs and
 * newlines anywhere in a URL, so " java\tscript:" still runs — both are
 * removed before the scheme check. `data:` and `vbscript:` are refused too
 * (a data: page is a phishing vector; vbscript: runs in legacy IE modes).
 */
const UNSAFE_SCHEME = /^(?:javascript|vbscript|data):/i;

/**
 * The href unchanged when it is safe to render, `undefined` when it is not.
 * Relative paths, fragments, http(s), mailto: and tel: all pass. An
 * `undefined` href leaves an inert `<a>` (no navigation, not focusable) —
 * a dead link is the failure mode, never a script.
 */
export function safeHref(href: string | null | undefined): string | undefined {
  if (href == null) return undefined;
  const normalized = String(href).replace(/^[\u0000- ]+/, '').replace(/[\t\n\r]/g, '');
  if (!UNSAFE_SCHEME.test(normalized)) return href;
  devWarning(
    'safeHref:blocked',
    `Blocked a link to "${normalized.split(':')[0]}:" — links accept relative paths, http(s), mailto: and tel:.`,
  );
  return undefined;
}
