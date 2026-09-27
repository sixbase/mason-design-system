import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Heading, Text } from '../typography/Typography';
import type { HeadingLevel } from '../typography/Typography';
import './FeatureBlock.css';

export interface FeatureBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Title text. */
  title: string;
  /** Description text. */
  description: string;
  /** Image element or node rendered alongside text. */
  image: ReactNode;
  /** Swap image and text positions on tablet+. */
  reverse?: boolean;
  /**
   * Heading level of the title (default `h2`). Size stays the same — pick
   * the level that fits the page outline, e.g. `h3` when the block sits
   * under a section's own `h2`, so headings never skip or flatten a level.
   */
  headingLevel?: Exclude<HeadingLevel, 'h1'>;
}

export const FeatureBlock = forwardRef<HTMLDivElement, FeatureBlockProps>(
  function FeatureBlock(
    { title, description, image, reverse = false, headingLevel = 'h2', className, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={[
          'ds-feature-block',
          reverse && 'ds-feature-block--reverse',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="ds-feature-block__image">{image}</div>
        <div className="ds-feature-block__text">
          <Heading as={headingLevel} size="xl" weight="normal" className="ds-feature-block__title">{title}</Heading>
          <Text size="base" muted>{description}</Text>
        </div>
      </div>
    );
  },
);
FeatureBlock.displayName = 'FeatureBlock';
