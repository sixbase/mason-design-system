/**
 * Shell routes live in the URL hash so every view is bookmarkable and the
 * browser's back button walks through what you reviewed:
 *   #/overview
 *   #/component/button?state=Primary
 *   #/foundation/colors
 *   #/page/cart
 */
import { useCallback, useEffect, useState } from 'react';

export interface Route {
  kind: 'overview' | 'component' | 'foundation' | 'page';
  id: string;
  state?: string;
}

export function parseRoute(hash: string): Route {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  const [kind, ...rest] = path.split('/');
  const state = new URLSearchParams(query).get('state') ?? undefined;
  if (kind === 'component' || kind === 'foundation' || kind === 'page') {
    return { kind, id: rest.join('/'), state };
  }
  return { kind: 'overview', id: '' };
}

export function routeHash(r: Route): string {
  if (r.kind === 'overview') return '#/overview';
  return `#/${r.kind}/${r.id}${r.state ? `?state=${encodeURIComponent(r.state)}` : ''}`;
}

export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = useCallback((r: Route) => {
    const next = routeHash(r);
    if (next !== window.location.hash) window.location.hash = next;
  }, []);
  return [route, go];
}
