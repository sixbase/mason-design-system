import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../button';
import { ChevronLeft, ChevronRight } from '../icon';
import { Text } from '../typography';
import { safeHref } from '../internal/safe-url';
import './Pagination.css';

/** Control height step. */
export type PaginationSize = 'sm' | 'md';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes — SPA mode (renders buttons) */
  onPageChange?: (page: number) => void;
  /** Base URL for SSR/Shopify mode — renders anchor tags. URL pattern: `{baseUrl}?page={n}` */
  baseUrl?: string;
  /** Number of pages shown around the current page (default: 1) */
  siblingCount?: number;
  /** Size of the pagination controls */
  size?: PaginationSize;
}

/**
 * Build the array of page numbers and ellipsis markers.
 *
 * Always shows: first page, last page, current ± siblingCount.
 * Gaps between shown pages become ellipsis ('…').
 * 7 or fewer total pages: show all, no ellipsis.
 */
function buildPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | '…')[] {
  // Show all pages if total is small enough
  const totalSlots = siblingCount * 2 + 5; // siblings + current + 2 ellipsis + first + last
  if (totalPages <= Math.max(totalSlots, 7)) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  // An ellipsis must stand in for at least two pages. When the gap is a
  // single page, render that page instead — "1 … 3" would spend a slot
  // hiding exactly the number it replaces.
  const showLeftEllipsis = leftSibling > 3;
  const showRightEllipsis = rightSibling < totalPages - 2;

  const pages: (number | '…')[] = [];

  // Always include first page
  pages.push(1);

  if (showLeftEllipsis) {
    pages.push('…');
  } else {
    // Fill in pages between 1 and leftSibling
    for (let i = 2; i < leftSibling; i++) {
      pages.push(i);
    }
  }

  // Sibling range including current
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  if (showRightEllipsis) {
    pages.push('…');
  } else {
    // Fill in pages between rightSibling and totalPages
    for (let i = rightSibling + 1; i < totalPages; i++) {
      pages.push(i);
    }
  }

  // Always include last page
  pages.push(totalPages);

  return pages;
}

/**
 * Pagination
 *
 * Navigation for multi-page content. Two modes:
 * - **SPA mode** (`onPageChange`): renders `<button>` elements
 * - **SSR/Shopify mode** (`baseUrl`): renders `<a>` tags for crawlable pagination
 *
 * Renders nothing when `totalPages` is 1 or less.
 *
 * @example
 * // SPA mode
 * <Pagination currentPage={5} totalPages={20} onPageChange={setPage} />
 *
 * // SSR mode
 * <Pagination currentPage={3} totalPages={10} baseUrl="/collections/all" />
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      currentPage: currentPageProp,
      totalPages,
      onPageChange,
      baseUrl,
      siblingCount: siblingCountProp = 1,
      size = 'md',
      className,
      ...props
    },
    ref,
  ) {
    // Clamp out-of-range input (page 0, -1, beyond the last page — e.g. a
    // stale `?page=` query after the collection shrank). Unclamped, no page
    // is marked current and Previous/Next request pages that don't exist.
    const currentPage = Math.min(
      Math.max(Math.trunc(currentPageProp) || 1, 1),
      Math.max(totalPages, 1),
    );
    const siblingCount = Math.max(Math.trunc(siblingCountProp) || 0, 0);

    const pages = useMemo(
      () => buildPageRange(currentPage, totalPages, siblingCount),
      [currentPage, totalPages, siblingCount],
    );

    // ─── Keep keyboard focus across a page change ──────────
    // The pressed control often doesn't survive the change: a page number
    // becomes the (non-interactive) current marker and unmounts, and Next
    // on the last page becomes disabled — both dropped focus to <body>, so
    // the next Tab restarted at the top of the document (WCAG 2.4.3). After
    // a change started here, if focus was lost, it moves to the current
    // page marker (tabIndex -1), from where Tab continues in the pagination.
    const navRef = useRef<HTMLElement | null>(null);
    const refocusRef = useRef(false);
    const setNavRef = useCallback(
      (node: HTMLElement | null) => {
        navRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    const changePage = (page: number) => {
      refocusRef.current = true;
      onPageChange?.(page);
    };
    useEffect(() => {
      if (!refocusRef.current) return;
      refocusRef.current = false;
      const nav = navRef.current;
      const focused = document.activeElement as HTMLElement | null;
      const lost =
        !focused ||
        focused === document.body ||
        (nav?.contains(focused) && (focused as HTMLButtonElement).disabled);
      if (!nav || !lost) return;
      // Desktop marker or the mobile "Page X of Y" — whichever is displayed
      const markers = Array.from(nav.querySelectorAll<HTMLElement>('[data-pagination-current]'));
      (markers.find((el) => el.getClientRects().length > 0) ?? markers[0])?.focus();
    }, [currentPage]);

    // Hide when only 1 page or invalid. NaN (a count divided by a missing
    // page size) slipped past `<= 1` and rendered "Page NaN of NaN";
    // Infinity (divided by 0) rendered a last page called "Infinity".
    if (!(totalPages > 1) || !Number.isFinite(totalPages)) return null;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    const isSSR = !!baseUrl;

    function getPageUrl(page: number): string | undefined {
      if (!baseUrl) return '#';
      const separator = baseUrl.includes('?') ? '&' : '?';
      return safeHref(page === 1 ? baseUrl : `${baseUrl}${separator}page=${page}`);
    }

    const classes = [
      'ds-pagination',
      `ds-pagination--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <nav ref={setNavRef} className={classes} aria-label="Pagination" {...props}>
        {/* Desktop: full page numbers */}
        <div className="ds-pagination__desktop">
          {/* Previous button */}
          {isSSR && !isFirstPage ? (
            <Button
              asChild
              variant="secondary"
              size={size}
              aria-label="Go to previous page"
            >
              <a href={getPageUrl(currentPage - 1)}>
                <ChevronLeft size="sm" />
                <span className="ds-pagination__prev-label">Previous</span>
              </a>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size={size}
              disabled={isFirstPage}
              onClick={!isSSR ? () => changePage(currentPage - 1) : undefined}
              aria-label="Go to previous page"
            >
              <ChevronLeft size="sm" />
              <span className="ds-pagination__prev-label">Previous</span>
            </Button>
          )}

          {/* Page numbers */}
          <div className="ds-pagination__pages">
            {pages.map((page, index) =>
              page === '…' ? (
                <Text
                  key={`ellipsis-${index}`}
                  size="sm"
                  className="ds-pagination__ellipsis"
                  aria-hidden="true"
                >
                  …
                </Text>
              ) : page === currentPage ? (
                <span
                  key={page}
                  className={[
                    'ds-pagination__page',
                    'ds-pagination__page--current',
                    `ds-pagination__page--${size}`,
                  ].join(' ')}
                  aria-current="page"
                  tabIndex={-1}
                  data-pagination-current=""
                >
                  {/* aria-label is ignored on a plain span (no role), so
                      screen readers heard only "5". Hidden text makes it
                      "Page 5, current page". */}
                  <span className="ds-pagination__sr-only">Page </span>
                  {page}
                </span>
              ) : isSSR ? (
                <Button
                  key={page}
                  asChild
                  variant="ghost"
                  size={size}
                  iconOnly
                  aria-label={`Go to page ${page}`}
                >
                  <a href={getPageUrl(page)}>{page}</a>
                </Button>
              ) : (
                <Button
                  key={page}
                  variant="ghost"
                  size={size}
                  iconOnly
                  onClick={() => changePage(page)}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </Button>
              ),
            )}
          </div>

          {/* Next button */}
          {isSSR && !isLastPage ? (
            <Button
              asChild
              variant="secondary"
              size={size}
              aria-label="Go to next page"
            >
              <a href={getPageUrl(currentPage + 1)}>
                <span className="ds-pagination__next-label">Next</span>
                <ChevronRight size="sm" />
              </a>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size={size}
              disabled={isLastPage}
              onClick={!isSSR ? () => changePage(currentPage + 1) : undefined}
              aria-label="Go to next page"
            >
              <span className="ds-pagination__next-label">Next</span>
              <ChevronRight size="sm" />
            </Button>
          )}
        </div>

        {/* Mobile: simplified Previous / Page X of Y / Next */}
        <div className="ds-pagination__mobile">
          {isSSR && !isFirstPage ? (
            <Button
              asChild
              variant="secondary"
              size={size}
              aria-label="Go to previous page"
            >
              <a href={getPageUrl(currentPage - 1)}>
                <ChevronLeft size="sm" />
                Previous
              </a>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size={size}
              disabled={isFirstPage}
              onClick={!isSSR ? () => changePage(currentPage - 1) : undefined}
              aria-label="Go to previous page"
            >
              <ChevronLeft size="sm" />
              Previous
            </Button>
          )}

          <Text size="sm" className="ds-pagination__info" tabIndex={-1} data-pagination-current="">
            Page {currentPage} of {totalPages}
          </Text>

          {isSSR && !isLastPage ? (
            <Button
              asChild
              variant="secondary"
              size={size}
              aria-label="Go to next page"
            >
              <a href={getPageUrl(currentPage + 1)}>
                Next
                <ChevronRight size="sm" />
              </a>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size={size}
              disabled={isLastPage}
              onClick={!isSSR ? () => changePage(currentPage + 1) : undefined}
              aria-label="Go to next page"
            >
              Next
              <ChevronRight size="sm" />
            </Button>
          )}
        </div>
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
