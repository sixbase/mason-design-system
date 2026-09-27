import { forwardRef, useState, useCallback, useId, useMemo, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { isRtl } from '../internal/direction';
import './ImageGallery.css';

export interface GalleryImage {
  /** Full-size image URL shown in the main frame */
  src: string;
  /** Specific description of this shot (e.g. "Case, back view, brass finish") */
  alt: string;
  /** Optional thumbnail src (falls back to src) */
  thumbSrc?: string;
}

export interface ImageGalleryProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of images to display */
  images: GalleryImage[];
  /** Aspect ratio for the main image */
  aspectRatio?: '1/1' | '4/5' | '3/4' | '4/3' | '16/9';
  /** Initial selected index */
  defaultIndex?: number;
  /** Thumbnail position on desktop */
  thumbnailPosition?: 'bottom' | 'left';
  /**
   * Native `loading` behavior for the main image. Defaults to `'eager'` —
   * the gallery is typically the above-the-fold PDP hero, so it should not
   * lazy-load. Pass `'lazy'` when the gallery renders below the fold.
   * Thumbnails always lazy-load.
   */
  loading?: 'eager' | 'lazy';
}

/**
 * Minimum horizontal pointer travel (px) to register a swipe.
 *
 * Mirrors the `--size-swipe-threshold` design token
 * (`primitive.size.swipe-threshold` in `@ds/tokens` tokens.json = 50px).
 * Pointer math needs the number synchronously in JS, so the value is kept
 * as a documented constant — update it alongside the token if it changes.
 */
const SWIPE_THRESHOLD_PX = 50;

/**
 * Where a position in the list as passed (holes included) lands once the
 * holes are skipped: the number of real images before it. `defaultIndex`
 * counts the consumer's list, so without this every image after a hole was
 * one off — `[A, null, C, D]` with defaultIndex 2 opened on D, not C. A
 * position on a hole lands on the next real image; past the end is clamped
 * by the caller.
 */
function visibleIndex(list: readonly (GalleryImage | null | undefined)[], index: number): number {
  let count = 0;
  for (let i = 0; i < Math.min(index, list.length); i++) if (list[i]) count++;
  return count;
}

export const ImageGallery = forwardRef<HTMLDivElement, ImageGalleryProps>(function ImageGallery(
  {
    images: imagesProp,
    aspectRatio = '4/5',
    defaultIndex = 0,
    thumbnailPosition = 'bottom',
    loading = 'eager',
    className,
    ...props
  },
  ref,
) {
  // A hole in the media list (a video with no preview image mapped to null)
  // threw on `img.alt` and took the whole product page down with it.
  // Memoised: callbacks below depend on the list itself, not just its length.
  const images = useMemo(() => imagesProp.filter(Boolean), [imagesProp]);
  // The shown image is remembered by position AND picture, so a new image
  // set (see below) can be told apart from the same set re-rendered. Until
  // there is a picture (`src` undefined), `index` is the requested
  // `defaultIndex`, still counted in the consumer's list with its holes.
  const [selection, setSelection] = useState<{ index: number; src?: string }>(() => {
    const index = visibleIndex(imagesProp, defaultIndex);
    const src = images[index]?.src;
    return src === undefined ? { index: defaultIndex } : { index, src };
  });
  // Only images the shopper navigated to cross-fade in. The first image
  // must paint immediately — it is usually the page's LCP element.
  const [hasNavigated, setHasNavigated] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);

  // When the image set changes under the shown image — a colour switch
  // swaps the whole gallery — show the same picture if it is still in the
  // set (wherever it moved), otherwise the set's first image. Keeping the
  // bare index showed "Stone Gray — Back" after picking Stone while "Carbon
  // Black — Detail" (4th) was up: a leftover slot, not the variant's photo.
  // No picture yet (images still loading): keep the requested index, mapped
  // past any holes in the list that has arrived.
  let resolvedIndex =
    selection.src === undefined ? visibleIndex(imagesProp, selection.index) : selection.index;
  if (selection.src !== undefined && images[selection.index]?.src !== selection.src) {
    const moved = images.findIndex((img) => img.src === selection.src);
    resolvedIndex = moved >= 0 ? moved : 0;
  }
  // Clamp at render time: the image set can shrink under a stored index
  // (variant switch 5 → 2 images) and defaultIndex can be out of range —
  // either used to leave `images[index]` undefined and blank the gallery.
  const activeIndex = Math.max(0, Math.min(images.length - 1, resolvedIndex));
  const shownSrc = images[activeIndex]?.src;
  if (shownSrc !== undefined && (selection.index !== activeIndex || selection.src !== shownSrc)) {
    // Remember what is actually on screen, so switching back to the first
    // colour starts at its first image rather than the slot left behind.
    setSelection({ index: activeIndex, src: shownSrc });
  }

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(images.length - 1, index));
      setSelection({ index: clamped, src: images[clamped]?.src });
      setHasNavigated(true);
      return clamped;
    },
    // The list, not its length: after a colour switch to a set of the same
    // size, a length-keyed goTo stored the old set's picture and the gallery
    // fell back to image 1.
    [images],
  );

  const handleThumbKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Both axes on both layouts: "left" thumbnails render as a horizontal
      // strip below 1024px, so vertical-only keys would strand keyboard users.
      // Horizontal arrows follow the visual order: in RTL the strip runs
      // right-to-left, so ArrowLeft is "next" (it used to clamp at thumb 1).
      const rtl = isRtl(e.currentTarget);
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      let target: number | null = null;
      if (e.key === back || e.key === 'ArrowUp') target = activeIndex - 1;
      else if (e.key === forward || e.key === 'ArrowDown') target = activeIndex + 1;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = images.length - 1;
      if (target === null) return;

      e.preventDefault();
      const next = goTo(target);
      // Roving tabindex: focus follows selection (WAI-ARIA tabs). Focusing
      // also scrolls an overflowing thumbnail strip to the new thumb.
      thumbsRef.current
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        [next]?.focus();
    },
    [activeIndex, goTo, images],
  );

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    pointerStartX.current = e.clientX;
  }, []);

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent) => {
      if (pointerStartX.current === null) return;
      const delta = e.clientX - pointerStartX.current;
      pointerStartX.current = null;
      if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
        // Swipe toward the reading start reveals the next image: leftward in
        // LTR, rightward in RTL (where the next thumb sits to the left).
        const towardNext = isRtl(e.currentTarget) ? delta > 0 : delta < 0;
        goTo(towardNext ? activeIndex + 1 : activeIndex - 1);
      }
    },
    [activeIndex, goTo],
  );

  // Tabs pattern: each thumbnail tab controls the main image panel, and the
  // panel is named by the selected tab. Without the pairing a screen reader
  // heard "tab, selected" with nothing saying what it switched.
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const tabId = (i: number) => `${baseId}-tab-${i}`;

  const activeImage = images[activeIndex];
  if (!activeImage) return null;
  const swipeable = images.length > 1;

  return (
    <div
      ref={ref}
      className={[
        'ds-image-gallery',
        `ds-image-gallery--thumbs-${thumbnailPosition}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div
        className={[
          'ds-image-gallery__main',
          // Grab cursor + swipe only when there is somewhere to swipe to.
          swipeable && 'ds-image-gallery__main--swipeable',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ '--gallery-ratio': aspectRatio } as React.CSSProperties}
        {...(swipeable && {
          id: panelId,
          role: 'tabpanel',
          'aria-labelledby': tabId(activeIndex),
        })}
        onPointerDown={swipeable ? handlePointerDown : undefined}
        onPointerUp={swipeable ? handlePointerUp : undefined}
      >
        <img
          key={activeIndex}
          src={activeImage.src}
          alt={activeImage.alt}
          className={['ds-image-gallery__img', hasNavigated && 'ds-image-gallery__img--enter']
            .filter(Boolean)
            .join(' ')}
          loading={loading}
          draggable={false}
        />
      </div>

      {images.length > 1 && (
        <div
          ref={thumbsRef}
          className="ds-image-gallery__thumbs ds-scroll-hidden"
          role="tablist"
          tabIndex={-1}
          aria-label="Product images"
          onKeyDown={handleThumbKeyDown}
        >
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              id={tabId(i)}
              aria-controls={panelId}
              aria-selected={i === activeIndex}
              // Empty alt would leave the tab unnamed (axe: button-name).
              aria-label={img.alt || `Image ${i + 1} of ${images.length}`}
              className={[
                'ds-image-gallery__thumb',
                i === activeIndex && 'ds-image-gallery__thumb--active',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => goTo(i)}
              tabIndex={i === activeIndex ? 0 : -1}
            >
              <img
                src={img.thumbSrc ?? img.src}
                alt=""
                className="ds-image-gallery__thumb-img"
                loading="lazy"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
ImageGallery.displayName = 'ImageGallery';
