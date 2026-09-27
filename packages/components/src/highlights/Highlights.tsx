import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Text } from '../typography/Typography';
import './Highlights.css';

/** Titles already ending in terminal punctuation don't get another period. */
const TERMINAL_PUNCTUATION = /[.!?…]$/u;

export interface HighlightsProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * A responsive row of highlight cards. Renders one column on phones, two from
 * 640px, and three from 1024px. Compose with {@link Highlight} children.
 */
export const Highlights = forwardRef<HTMLDivElement, HighlightsProps>(
  function Highlights({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={['ds-highlights', className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Highlights.displayName = 'Highlights';

export interface HighlightProps extends HTMLAttributes<HTMLDivElement> {
  /** Image node for the 4:5 card. Omit for an empty light placeholder. */
  image?: ReactNode;
  /**
   * Short lead phrase — rendered slightly heavier. A trailing period is added
   * unless the title already ends in `.`, `!`, `?` or `…`.
   */
  title?: string;
  /** Supporting copy — rendered lighter and muted, inline after the title. */
  description?: string;
}

/**
 * A single highlight: a 4:5 image card on a light surface with large (34px)
 * corners, plus an optional inline title + description beneath it.
 */
export const Highlight = forwardRef<HTMLDivElement, HighlightProps>(
  function Highlight({ image, title, description, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={['ds-highlights__item', className].filter(Boolean).join(' ')}
        {...props}
      >
        <div className="ds-highlights__media">
          {image ?? <div className="ds-highlights__placeholder" aria-hidden="true" />}
        </div>
        {(title || description) && (
          <Text size="lg" className="ds-highlights__text">
            {title && (
              <span className="ds-highlights__title">
                {title}
                {/* In markup, not CSS ::after — a CSS period can't see that
                    "Cast with intent." already ends in one (rendered ".."). */}
                {!TERMINAL_PUNCTUATION.test(title.trimEnd()) && '.'}
              </span>
            )}{' '}
            {description && <span className="ds-highlights__desc">{description}</span>}
          </Text>
        )}
      </div>
    );
  },
);
Highlight.displayName = 'Highlight';
