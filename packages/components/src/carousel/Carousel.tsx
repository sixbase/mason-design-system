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
import { isRtl } from '../internal/direction';
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

/** True for targets that use arrow keys themselves (caret, options, …). */
function isEditableTarget(target: EventTarget): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/**
 * True when slides should jump instead of glide: the OS asks for reduced
 * motion, or the page switched motion off with <html data-motion="off"> —
 * the switch the tokens' global reset and @ds/motion both honour. The CSS
 * reset's `scroll-behavior: auto` can't stop this one: an explicit
 * `scrollTo({ behavior: 'smooth' })` overrides it. (Guarded for jsdom.)
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.dataset.motion === 'off') return true;
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/*
 * Scroll geometry in logical (inline-start) terms. In RTL the track starts
 * at its right edge: scrollLeft runs from 0 to negative values and slide
 * offsetLeft still counts from the left, so the LTR maths (offsetLeft vs
 * scrollLeft) sent Next the wrong way, lit the wrong dot and wrapped early.
 * Everything below works in "distance from the start edge" and converts
 * back to a signed scrollLeft only when scrolling. (isRtl: internal/direction.)
 */

/** How far the track has scrolled from its start edge (≥ 0 in both directions). */
function scrollStart(track: HTMLElement): number {
  return isRtl(track) ? -track.scrollLeft : track.scrollLeft;
}

/** A slide's distance from the track's start edge. */
function slideStart(track: HTMLElement, slide: HTMLElement): number {
  return isRtl(track) ? track.clientWidth - slide.offsetLeft - slide.offsetWidth : slide.offsetLeft;
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
    // Slide a programmatic (smooth) scroll is heading to. While set, scroll
    // events from the animation must not overwrite the optimistic index —
    // otherwise a second click mid-animation re-targets the slide it is
    // already going to, and rapid clicks get swallowed.
    const pendingIndexRef = useRef<number | null>(null);

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

    /** Where the track ends up when it scrolls to a slide (clamped to max). */
    const destinationFor = useCallback((track: HTMLElement, slide: HTMLElement) => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      return Math.min(slideStart(track, slide), maxScroll);
    }, []);

    /**
     * Set or clear the in-flight target. `retarget` = this scroll replaces
     * one still in flight (rapid Next clicks): the track then carries
     * `ds-carousel__track--gliding`, which suspends scroll snapping until
     * the target is reached or the user takes over. Once a smooth scroll has
     * been re-targeted, WebKit (Safari) re-snaps a mandatory snap container
     * on the next style change — React re-rendering the indicators — which
     * cancelled the scroll and landed a slide short. Single scrolls keep
     * snapping on, exactly as before, in every engine.
     */
    const setPending = useCallback((index: number | null, retarget = false) => {
      pendingIndexRef.current = index;
      const track = trackRef.current;
      if (index === null) track?.classList.remove('ds-carousel__track--gliding');
      else if (retarget) track?.classList.add('ds-carousel__track--gliding');
    }, []);

    /** Sync active index and start/end flags from the real scroll position. */
    const updateScrollState = useCallback(() => {
      const track = trackRef.current;
      if (!track) return;
      const slideEls = getSlideElements();
      if (slideEls.length === 0) return;

      const position = scrollStart(track);
      const pending = pendingIndexRef.current;
      if (pending !== null) {
        const pendingSlide = slideEls[pending];
        if (pendingSlide && Math.abs(position - destinationFor(track, pendingSlide)) > 1) {
          return; // still animating toward the pending slide
        }
        setPending(null); // arrived — resume tracking
      }

      let nearest = 0;
      let minDistance = Infinity;
      slideEls.forEach((slide, i) => {
        const distance = Math.abs(slideStart(track, slide) - position);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = i;
        }
      });
      setActiveIndex(nearest);
      setAtStart(position <= 1);
      const overflow = track.scrollWidth - track.clientWidth;
      setAtEnd(overflow > 0 ? position >= overflow - 1 : false);
    }, [getSlideElements, destinationFor, setPending]);

    /** The user took over scrolling (drag, wheel, resize) — drop the pending target. */
    const releasePending = useCallback(() => {
      if (pendingIndexRef.current !== null) setPending(null);
    }, [setPending]);

    useEffect(() => {
      updateScrollState();
      // Resize reflows slide offsets; scrollend (where supported) marks any
      // scroll as settled even if it was interrupted short of its target.
      const handleSettle = () => {
        releasePending();
        updateScrollState();
      };
      const track = trackRef.current;
      // WebKit (Safari) also fires scrollend when a smooth scroll is
      // re-targeted mid-flight — a second Next click before the first one
      // lands — while the track is still moving. Settling there dropped the
      // pending target, snapped back a slide and swallowed the click. With a
      // target in flight, settle only once the position has stopped changing
      // (two frames later); the real scrollend follows otherwise.
      let frame = 0;
      const handleScrollEnd = () => {
        cancelAnimationFrame(frame);
        if (!track || pendingIndexRef.current === null) {
          handleSettle();
          return;
        }
        const at = track.scrollLeft;
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            if (Math.abs(track.scrollLeft - at) < 1) handleSettle();
          });
        });
      };
      window.addEventListener('resize', handleSettle);
      track?.addEventListener('scrollend', handleScrollEnd);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', handleSettle);
        track?.removeEventListener('scrollend', handleScrollEnd);
      };
    }, [updateScrollState, releasePending]);

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

        // Reduced motion: jump instantly instead of smooth-scrolling.
        const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
        const destination = destinationFor(track, slide);
        setPending(
          Math.abs(destination - scrollStart(track)) > 1 ? target : null,
          pendingIndexRef.current !== null,
        );
        // Logical distance → signed scrollLeft (negative toward the end in RTL).
        const left = isRtl(track) && destination !== 0 ? -destination : destination;
        // Absolute scrollTo, not a relative scrollBy: when a smooth scroll is
        // re-targeted mid-flight, WebKit applies a relative delta against a
        // later position than the one it was computed from and overshoots
        // (landed 67px past the slide on a 1280px desktop).
        if (typeof track.scrollTo === 'function') {
          track.scrollTo({ left, behavior });
        } else {
          track.scrollLeft = left;
        }
        // Optimistic position flags — the scroll event corrects them against
        // the real scroll geometry once the browser finishes scrolling.
        const overflow = track.scrollWidth - track.clientWidth;
        setActiveIndex(target);
        setAtStart(target === 0);
        setAtEnd(
          target === slideEls.length - 1 || (overflow > 0 && destination >= overflow - 1),
        );
      },
      [getSlideElements, destinationFor, loop, setPending],
    );

    /**
     * Prev/next by one slide. Steps from the pending target when a smooth
     * scroll is in flight, and — with `loop` — wraps once the track can't
     * move further. With several slides in view the last slides never reach
     * the left edge, so stepping index-by-index used to leave dead clicks at
     * the end before the wrap kicked in.
     */
    const step = useCallback(
      (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        const slideEls = getSlideElements();
        if (slideEls.length === 0) return;

        const pending = pendingIndexRef.current;
        const pendingSlide = pending !== null ? slideEls[pending] : undefined;
        if (loop) {
          const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
          const position = pendingSlide ? destinationFor(track, pendingSlide) : scrollStart(track);
          if (direction === 1 && position >= maxScroll - 1) {
            scrollToIndex(0);
            return;
          }
          if (direction === -1 && position <= 1) {
            scrollToIndex(slideEls.length - 1);
            return;
          }
        }
        scrollToIndex((pending ?? activeIndex) + direction);
      },
      [activeIndex, destinationFor, getSlideElements, loop, scrollToIndex],
    );

    const handleScroll = useCallback(
      (_event: UIEvent<HTMLDivElement>) => {
        updateScrollState();
      },
      [updateScrollState],
    );

    const handleTrackKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        // Arrow keys bubbling from a text field (or a widget that already
        // handled them) inside a slide belong to that control.
        if (event.defaultPrevented || isEditableTarget(event.target)) return;
        // Arrows follow the visual direction: in RTL the next slide is to the left.
        const forward = isRtl(event.currentTarget) ? 'ArrowLeft' : 'ArrowRight';
        const backward = forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
        if (event.key === backward) {
          event.preventDefault();
          step(-1);
        } else if (event.key === forward) {
          event.preventDefault();
          step(1);
        }
      },
      [step],
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
        {/* A horizontally scrolling region must be keyboard-focusable so it
            can be scrolled without a pointer (WCAG 2.1.1; axe
            scrollable-region-focusable). jsx-a11y reads it as a fake button;
            it isn't one — the named region is on the root. */}
        <div className="ds-carousel__viewport">
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            ref={trackRef}
            className="ds-carousel__track ds-scroll-hidden"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            onScroll={handleScroll}
            onKeyDown={handleTrackKeyDown}
            onPointerDown={releasePending}
            onWheel={releasePending}
          >
            {slides}
          </div>
          {/* The track's focus ring, painted by a sibling laid over it. A
              scroll container's own outline paints beneath its scrolled
              content in every engine, so the slides covered the ring
              everywhere except the gaps between them. */}
          <span className="ds-carousel__focus-ring" />
        </div>

        {/* aria-disabled, not `disabled`: pressing Next onto the last slide
            natively disabled the button under the keyboard user's focus,
            and focus fell to <body> (the next Tab restarted at the track).
            The ends stay focusable, announce "dimmed", and do nothing. */}
        {controls && count > 1 && (
          <>
            <button
              type="button"
              className="ds-carousel__control ds-carousel__control--prev"
              aria-label="Previous slide"
              aria-disabled={!loop && atStart}
              onClick={() => {
                if (loop || !atStart) step(-1);
              }}
            >
              <ChevronLeft size="sm" />
            </button>
            <button
              type="button"
              className="ds-carousel__control ds-carousel__control--next"
              aria-label="Next slide"
              aria-disabled={!loop && atEnd}
              onClick={() => {
                if (loop || !atEnd) step(1);
              }}
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
