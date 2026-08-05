import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  HTMLAttributes,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  UIEvent,
} from 'react';
import { ChevronLeft, ChevronRight } from '../icon';
import './Carousel.css';

export type CarouselSize = 'sm' | 'md' | 'lg';

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /** Carousel content — typically CarouselSlide elements. */
  children: ReactNode;
  /** Gap between slides. */
  gap?: 'sm' | 'md' | 'lg';
  /**
   * Accessible name for the carousel region (e.g. "Featured products").
   * Rendered as `aria-label`; an explicit `aria-label` prop takes precedence.
   */
  label?: string;
  /** Show prev/next buttons that scroll by one slide. */
  controls?: boolean;
  /** Show dot indicators that reflect and jump to the scroll position. */
  indicators?: boolean;
  /**
   * Allow prev/next (buttons and arrow keys) to wrap from the last slide
   * back to the first and vice versa. Without it, controls disable at the ends.
   */
  loop?: boolean;
}

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  /** Slide content. */
  children: ReactNode;
  /** Slide width preset across breakpoints. */
  size?: CarouselSize;
  /**
   * 0-based slide position — injected automatically by Carousel.
   * Used with `count` to build the "N of M" accessible label.
   */
  index?: number;
  /** Total slide count — injected automatically by Carousel. */
  count?: number;
}

/** True when the user prefers reduced motion (guarded for jsdom). */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      children,
      gap = 'md',
      label,
      controls = false,
      indicators = false,
      loop = false,
      className,
      ...props
    },
    ref,
  ) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    // Inject index/count into CarouselSlide children so each slide can
    // announce itself as "N of M". Other node types pass through untouched.
    const validChildren = Children.toArray(children).filter(isValidElement);
    const count = validChildren.filter((child) => child.type === CarouselSlide).length;
    let slideIndex = -1;
    const slides = Children.map(children, (child) => {
      if (!isValidElement(child) || child.type !== CarouselSlide) return child;
      slideIndex += 1;
      return cloneElement(child as ReactElement<CarouselSlideProps>, {
        index: slideIndex,
        count,
      });
    });

    const getSlideElements = useCallback((): HTMLElement[] => {
      const track = trackRef.current;
      if (!track) return [];
      return Array.from(track.querySelectorAll<HTMLElement>('.ds-carousel__slide'));
    }, []);

    /** Sync active index and start/end flags from the real scroll position. */
    const updateScrollState = useCallback(() => {
      const track = trackRef.current;
      if (!track) return;
      const slideEls = getSlideElements();
      if (slideEls.length === 0) return;

      let nearest = 0;
      let minDistance = Infinity;
      slideEls.forEach((slide, i) => {
        const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = i;
        }
      });
      setActiveIndex(nearest);
      setAtStart(track.scrollLeft <= 1);
      const overflow = track.scrollWidth - track.clientWidth;
      setAtEnd(overflow > 0 ? track.scrollLeft >= overflow - 1 : false);
    }, [getSlideElements]);

    useEffect(() => {
      updateScrollState();
      window.addEventListener('resize', updateScrollState);
      return () => window.removeEventListener('resize', updateScrollState);
    }, [updateScrollState]);

    const scrollToIndex = useCallback(
      (index: number) => {
        const track = trackRef.current;
        if (!track) return;
        const slideEls = getSlideElements();
        if (slideEls.length === 0) return;

        const target = loop
          ? (index + slideEls.length) % slideEls.length
          : Math.max(0, Math.min(slideEls.length - 1, index));
        const slide = slideEls[target];
        if (!slide) return;

        const delta = slide.offsetLeft - track.scrollLeft;
        // Reduced motion: jump instantly instead of smooth-scrolling.
        const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
        if (typeof track.scrollBy === 'function') {
          track.scrollBy({ left: delta, behavior });
        } else {
          track.scrollLeft += delta;
        }
        // Optimistic position flags — the scroll event corrects them against
        // the real scroll geometry once the browser finishes scrolling.
        setActiveIndex(target);
        setAtStart(target === 0);
        setAtEnd(target === slideEls.length - 1);
      },
      [getSlideElements, loop],
    );

    const handleScroll = useCallback(
      (_event: UIEvent<HTMLDivElement>) => {
        updateScrollState();
      },
      [updateScrollState],
    );

    const handleTrackKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollToIndex(activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollToIndex(activeIndex + 1);
        }
      },
      [activeIndex, scrollToIndex],
    );

    return (
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className={[
          'ds-carousel',
          `ds-carousel--gap-${gap}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div
          ref={trackRef}
          className="ds-carousel__track ds-scroll-hidden"
          tabIndex={0}
          onScroll={handleScroll}
          onKeyDown={handleTrackKeyDown}
        >
          {slides}
        </div>

        {controls && count > 1 && (
          <>
            <button
              type="button"
              className="ds-carousel__control ds-carousel__control--prev"
              aria-label="Previous slide"
              disabled={!loop && atStart}
              onClick={() => scrollToIndex(activeIndex - 1)}
            >
              <ChevronLeft size="sm" />
            </button>
            <button
              type="button"
              className="ds-carousel__control ds-carousel__control--next"
              aria-label="Next slide"
              disabled={!loop && atEnd}
              onClick={() => scrollToIndex(activeIndex + 1)}
            >
              <ChevronRight size="sm" />
            </button>
          </>
        )}

        {indicators && count > 1 && (
          <div
            className="ds-carousel__indicators"
            role="group"
            aria-label="Slides"
          >
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                className={[
                  'ds-carousel__indicator',
                  i === activeIndex && 'ds-carousel__indicator--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === activeIndex ? 'true' : undefined}
                onClick={() => scrollToIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
Carousel.displayName = 'Carousel';

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide(
    { children, size = 'md', index, count, className, ...props },
    ref,
  ) {
    const hasPosition = index !== undefined && count !== undefined;
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        aria-label={hasPosition ? `${index + 1} of ${count}` : undefined}
        className={[
          'ds-carousel__slide',
          `ds-carousel__slide--${size}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CarouselSlide.displayName = 'CarouselSlide';
