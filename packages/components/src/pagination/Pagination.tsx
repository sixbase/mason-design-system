import { forwardRef, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../button';
import { ChevronLeft, ChevronRight } from '../icon';
import { Text } from '../typography';
import './Pagination.css';

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
  size?: 'sm' | 'md';
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

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

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
      currentPage,
      totalPages,
      onPageChange,
      baseUrl,
      siblingCount = 1,
      size = 'md',
      className,
      ...props
    },
    ref,
  ) {
    const pages = useMemo(
      () => buildPageRange(currentPage, totalPages, siblingCount),
      [currentPage, totalPages, siblingCount],
    );

    // Hide when only 1 page or invalid
    if (totalPages <= 1) return null;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    const isSSR = !!baseUrl;

    function getPageUrl(page: number): string {
      if (!baseUrl) return '#';
      const separator = baseUrl.includes('?') ? '&' : '?';
      return page === 1 ? baseUrl : `${baseUrl}${separator}page=${page}`;
    }

    const classes = [
      'ds-pagination',
      `ds-pagination--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <nav ref={ref} className={classes} aria-label="Pagination" {...props}>
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
              onClick={!isSSR ? () => onPageChange?.(currentPage - 1) : undefined}
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
                  aria-label={`Page ${page}`}
                >
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
                  onClick={() => onPageChange?.(page)}
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
              onClick={!isSSR ? () => onPageChange?.(currentPage + 1) : undefined}
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
              onClick={!isSSR ? () => onPageChange?.(currentPage - 1) : undefined}
              aria-label="Go to previous page"
            >
              <ChevronLeft size="sm" />
              Previous
            </Button>
          )}

          <Text size="sm" className="ds-pagination__info">
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
              onClick={!isSSR ? () => onPageChange?.(currentPage + 1) : undefined}
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
