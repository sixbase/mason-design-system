import { useEffect, useMemo, useRef, useState } from 'react';
import { Input, Search } from '@ds/components';
import { ENTRIES, entryKey } from '../lib/catalog';
import type { Entry } from '../lib/catalog';
import { useReviews } from '../lib/review';
import type { Route } from './route';

export function Sidebar({ route, onGo }: { route: Route; onGo: (e: Entry | null) => void }) {
  const [query, setQuery] = useState('');
  const reviews = useReviews();

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, Entry[]>();
    for (const e of ENTRIES) {
      if (q && !e.label.toLowerCase().includes(q) && !e.id.includes(q)) continue;
      map.set(e.group, [...(map.get(e.group) ?? []), e]);
    }
    return [...map.entries()];
  }, [query]);

  const done = ENTRIES.filter((e) => reviews[entryKey(e)]?.status).length;

  // Keep the current row in view while stepping through with J/K. Scrolls
  // the list by hand: Chrome's scrollIntoView() also moves where the next
  // Tab starts from, so the skip link would be jumped over.
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const item = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    let box = item?.parentElement ?? null;
    while (box && !(box.scrollHeight > box.clientHeight && /auto|scroll/.test(getComputedStyle(box).overflowY))) {
      box = box.parentElement;
    }
    if (!item || !box) return;
    const r = item.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    // Going up, land the row a third of the way down (the Overview row → back to the very top)
    if (r.top < b.top) box.scrollTop = Math.max(0, r.top - b.top + box.scrollTop - box.clientHeight / 3);
    else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom + r.height;
  }, [route.kind, route.id]);

  return (
    <nav ref={navRef} className="wb-sidebar" aria-label="Workbench">
      <div className="wb-sidebar__brand">
        <img src={`${import.meta.env.BASE_URL}mason-supply-co-logo.svg`} alt="Mason Supply Co." width={160} height={20} />
        <span className="wb-sidebar__product">Workbench</span>
      </div>

      <div className="wb-sidebar__search">
        <Input
          size="sm"
          type="search"
          placeholder="Find a component"
          aria-label="Find a component"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Type a few letters, press Enter: opens the best match ("cart" → Cart…, not Add to Cart…)
          onKeyDown={(e) => {
            const q = query.trim().toLowerCase();
            const matches = groups.flatMap(([, items]) => items);
            const best = matches.find((m) => m.label.toLowerCase().startsWith(q)) ?? matches[0];
            if (e.key === 'Enter' && q && best) onGo(best);
          }}
          leadingAdornment={<Search size="sm" />}
        />
      </div>

      <button
        type="button"
        className="wb-sidebar__item wb-sidebar__overview"
        aria-current={route.kind === 'overview' ? 'page' : undefined}
        aria-label={`Overview, ${done} of ${ENTRIES.length} reviewed`}
        onClick={() => onGo(null)}
      >
        <span>Overview</span>
        <span className="wb-sidebar__count">
          {done}/{ENTRIES.length}
        </span>
      </button>

      {groups.map(([group, items]) => (
        <div key={group} className="wb-sidebar__group">
          <div className="wb-sidebar__group-label">{group}</div>
          {items.map((e) => {
            const status = reviews[entryKey(e)]?.status;
            const active = route.kind === e.kind && route.id === e.id;
            return (
              <button
                key={entryKey(e)}
                type="button"
                className="wb-sidebar__item"
                aria-current={active ? 'page' : undefined}
                onClick={() => onGo(e)}
              >
                <span className="wb-sidebar__label">{e.label}</span>
                <span
                  className={['wb-dot', status && `wb-dot--${status}`].filter(Boolean).join(' ')}
                  aria-label={status === 'good' ? 'Looks good' : status === 'issue' ? 'Needs work' : 'Not reviewed'}
                  role="img"
                />
              </button>
            );
          })}
        </div>
      ))}
      {!groups.length && <p className="wb-sidebar__none">Nothing matches “{query}”.</p>}
    </nav>
  );
}
