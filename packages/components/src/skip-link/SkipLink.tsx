import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import './SkipLink.css';

export interface SkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Target of the skip link. Defaults to "#main-content". */
  href?: string;
}

/**
 * SkipLink
 *
 * A visually hidden link that appears fixed at the top-left of the
 * viewport on keyboard focus, letting keyboard and screen-reader users
 * jump past repeated navigation straight to the main content.
 *
 * Accessibility:
 * - Must be the FIRST focusable element on the page — render it before
 *   the header, announcement bar, and any other interactive element
 * - The target element (default `#main-content`) must exist; give your
 *   `<main>` element `id="main-content"` and `tabindex="-1"` so focus
 *   moves reliably in all browsers
 * - Hidden with the standard sr-only technique — never `display: none`,
 *   which would remove it from the tab order entirely
 *
 * @example
 * <SkipLink />                                   // "Skip to content" → #main-content
 * <SkipLink href="#product-list">Skip to products</SkipLink>
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink(
    { href = '#main-content', className, children = 'Skip to content', ...props },
    ref,
  ) {
    const classes = ['ds-skip-link', className].filter(Boolean).join(' ');

    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {children}
      </a>
    );
  },
);

SkipLink.displayName = 'SkipLink';
