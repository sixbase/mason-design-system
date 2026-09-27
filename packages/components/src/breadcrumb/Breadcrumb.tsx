import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { safeHref } from '../internal/safe-url';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  /** Visible crumb text */
  label: string;
  /** Link destination. Ignored on the last item, which always renders as the current page. */
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Ordered list of breadcrumb items. Last item is treated as current page. */
  items: BreadcrumbItem[];
  /** Custom separator between items. Defaults to "›" */
  separator?: ReactNode;
  /** Max visible items. When exceeded, middle items collapse to "…". */
  maxItems?: number;
  /**
   * Also output schema.org `BreadcrumbList` structured data (a JSON-LD
   * `<script>`) so search results can show the trail. Opt-in: leave it off
   * when the page already emits its own. `true` uses each href as written;
   * a string is the site's base URL, used to turn relative hrefs into the
   * absolute URLs search engines ask for (`schema="https://example.com"`).
   */
  schema?: boolean | string;
}

/** Absolute when a base is given; the href as written otherwise. */
function schemaUrl(href: string, base: string | undefined): string {
  if (!base) return href;
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

/**
 * JSON-LD for the trail. The current page (last item) carries no `item`
 * URL — it is the page itself, and its href is ignored on screen too.
 * `<` is escaped so a label can never close the script element early.
 */
function breadcrumbJsonLd(items: BreadcrumbItem[], base: string | undefined): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => {
      const href = safeHref(item.href);
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: item.label,
        ...(href && i < items.length - 1 ? { item: schemaUrl(href, base) } : {}),
      };
    }),
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, separator = '\u203A', maxItems, schema, className, ...props },
  ref,
) {
  const shouldCollapse = !!(maxItems && maxItems > 1 && items.length > maxItems);

  // Indices of middle items that get hidden on mobile when maxItems is set
  const collapsibleSet = new Set<number>();
  if (shouldCollapse) {
    const keepFromEnd = maxItems - 1;
    for (let i = 1; i < items.length - keepFromEnd; i++) {
      collapsibleSet.add(i);
    }
  }

  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={['ds-breadcrumb', className].filter(Boolean).join(' ')}
      {...props}
    >
      <ol className="ds-breadcrumb__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const isFirst = i === 0;
          const isCollapsible = collapsibleSet.has(i);
          // javascript:/data: from store data renders as plain text (internal/safe-url)
          const href = safeHref(item.href);
          return (
            <li
              // Index key: labels can repeat (e.g. "Sale › Sale")
              key={i}
              className={[
                'ds-breadcrumb__item',
                isCollapsible && 'ds-breadcrumb__item--collapsible',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isLast ? (
                <span className="ds-breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  {/* The label span owns the ellipsis so the link itself keeps
                      overflow visible — its coarse-pointer hit-area pseudo
                      and focus ring must not be clipped. */}
                  {href ? (
                    <a href={href} className="ds-breadcrumb__link">
                      <span className="ds-breadcrumb__label">{item.label}</span>
                    </a>
                  ) : (
                    <span className="ds-breadcrumb__link">
                      <span className="ds-breadcrumb__label">{item.label}</span>
                    </span>
                  )}
                  <span className="ds-breadcrumb__separator" aria-hidden="true">
                    {separator}
                  </span>
                  {shouldCollapse && isFirst && (
                    <>
                      <span className="ds-breadcrumb__ellipsis" aria-hidden="true">
                        …
                      </span>
                      <span
                        className="ds-breadcrumb__separator ds-breadcrumb__separator--after-ellipsis"
                        aria-hidden="true"
                      >
                        {separator}
                      </span>
                    </>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
      {schema && items.length > 0 && (
        <script
          type="application/ld+json"
          // Serialized data with `<` escaped (see breadcrumbJsonLd)
          dangerouslySetInnerHTML={{
            __html: breadcrumbJsonLd(items, typeof schema === 'string' ? schema : undefined),
          }}
        />
      )}
    </nav>
  );
});
Breadcrumb.displayName = 'Breadcrumb';
