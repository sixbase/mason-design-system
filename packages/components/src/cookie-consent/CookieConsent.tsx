import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { AnimationEvent, HTMLAttributes } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../accordion/Accordion';
import { Button } from '../button/Button';
import { Text } from '../typography/Typography';
import { dialogOpener, trackDialogOpeners } from '../internal/dialog-opener';
import { safeHref } from '../internal/safe-url';
import './CookieConsent.css';

// ─── Types ────────────────────────────────────────────────

export interface CookieCategory {
  /** Unique identifier (e.g., 'essential', 'functional') */
  id: string;
  /** Display name */
  label: string;
  /** Description shown when the accordion section is expanded */
  description?: string;
  /** Whether this category is always on and cannot be toggled */
  required?: boolean;
  /** Default checked state (defaults to false for non-required) */
  defaultChecked?: boolean;
  /**
   * URL for a "Learn more" link shown below the description. An unsafe
   * URL (javascript:, data:, vbscript:) is dropped and no link shows.
   */
  learnMoreHref?: string;
}

export interface CookieConsentProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the banner is visible (controlled mode) */
  open?: boolean;
  /** Callback when visibility changes (controlled mode) */
  onOpenChange?: (open: boolean) => void;
  /** Whether the banner starts visible (uncontrolled mode, default: true) */
  defaultOpen?: boolean;
  /** Cookie categories for the preferences panel */
  categories?: CookieCategory[];
  /** Called when user accepts — receives array of accepted category IDs */
  onAccept?: (categoryIds: string[]) => void;
  /** Called when user rejects all non-essential cookies */
  onReject?: () => void;
  /** Banner heading text */
  heading?: string;
  /** Banner description / privacy message */
  description?: string;
  /**
   * URL for a "Learn more" link appended to the description. An unsafe
   * URL (javascript:, data:, vbscript:) is dropped and no link shows.
   */
  learnMoreHref?: string;
  /** Label for the learn more link */
  learnMoreLabel?: string;
  /** Label for the Accept All button */
  acceptLabel?: string;
  /** Label for the Reject All button */
  rejectLabel?: string;
  /** Label for the Preferences button */
  preferencesLabel?: string;
  /** Label for the Save Preferences button (shown in expanded panel) */
  saveLabel?: string;
  /** Label for the Close button (shown in expanded panel) */
  closeLabel?: string;
}

// ─── Component ────────────────────────────────────────────

/**
 * CookieConsent
 *
 * A fixed bottom-bar banner for cookie consent. Supports Accept All / Reject All
 * with an optional Preferences panel that displays accordion sections for each
 * cookie category (Strictly Necessary, Functional, Performance, Targeting).
 *
 * @example
 * <CookieConsent
 *   categories={[
 *     { id: 'essential', label: 'Strictly Necessary Cookies', required: true },
 *     { id: 'functional', label: 'Functional Cookies' },
 *     { id: 'performance', label: 'Performance Cookies' },
 *     { id: 'targeting', label: 'Targeting Cookies' },
 *   ]}
 *   onAccept={(ids) => console.log('Accepted:', ids)}
 *   onReject={() => console.log('Rejected')}
 * />
 */
export const CookieConsent = forwardRef<HTMLDivElement, CookieConsentProps>(
  function CookieConsent(
    {
      open: openProp,
      onOpenChange,
      defaultOpen = true,
      categories,
      onAccept,
      onReject,
      heading = 'We Use Cookies',
      description = 'We use cookies to improve your experience and understand how our site is used. You can manage your preferences anytime.',
      learnMoreHref,
      learnMoreLabel = 'Learn More',
      acceptLabel = 'Accept All',
      rejectLabel = 'Decline All',
      preferencesLabel = 'Manage Preferences',
      saveLabel = 'Save Preferences',
      closeLabel = 'Back',
      className,
      ...props
    },
    ref,
  ) {
    // ─── State ──────────────────────────────────────────────

    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = isControlled ? openProp : internalOpen;

    const [closing, setClosing] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    // "Learn more" links whose href safeHref blocks (javascript:, data:…)
    // are left out entirely — the banner reads exactly as if no link was
    // given. They used to render as a link-styled <a> with no href: it
    // looked like a link but could not be focused or activated. Plain text
    // was the other option, but "Learn More" that goes nowhere promises
    // something it can't deliver. safeHref already warns in development.
    const learnMoreUrl = safeHref(learnMoreHref);

    // Only the user's explicit toggles are stored. Each category's checked
    // state is derived at render time (required → always on, otherwise the
    // toggle or its default), so categories that arrive after mount (async
    // CMS / consent-platform config) still get their defaults, and removed
    // categories can never leak into the accepted list.
    // A Map, not a plain object: `{}['constructor']` is inherited (truthy),
    // so a category with an id like "constructor" or "toString" read as
    // ticked and was reported as consented without the shopper touching it.
    const [toggledCategories, setToggledCategories] = useState<ReadonlyMap<string, boolean>>(
      () => new Map(),
    );
    const isCategoryChecked = (category: CookieCategory) =>
      category.required
        ? true
        : (toggledCategories.get(category.id) ?? category.defaultChecked ?? false);

    const headingId = useId();
    const bannerRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    // Set synchronously on the first choice so a double-click (or a click
    // during the exit animation) can't fire onAccept / onReject twice.
    const decidedRef = useRef(false);

    // ─── Handlers ───────────────────────────────────────────

    const finishClose = useCallback(() => {
      decidedRef.current = false;
      setClosing(false);
      setShowPreferences(false);
      if (isControlled) {
        onOpenChange?.(false);
      } else {
        setInternalOpen(false);
      }
      // Return focus to where it was before the banner opened
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }, [isControlled, onOpenChange]);

    const close = useCallback(() => {
      decidedRef.current = true;
      setClosing(true);
    }, []);

    // Only the banner's own exit animation ends the close: animationend
    // bubbles, and a category's accordion fade finishing mid-exit cut the
    // slide short.
    const handleAnimationEnd = useCallback(
      (event: AnimationEvent<HTMLDivElement>) => {
        if (closing && event.target === event.currentTarget) {
          finishClose();
        }
      },
      [closing, finishClose],
    );

    const handleAcceptAll = () => {
      if (decidedRef.current) return;
      const allIds = categories ? categories.map((c) => c.id) : [];
      onAccept?.(allIds);
      close();
    };

    const handleReject = () => {
      if (decidedRef.current) return;
      onReject?.();
      close();
    };

    const handleSavePreferences = () => {
      if (decidedRef.current) return;
      const accepted = (categories ?? []).filter(isCategoryChecked).map((c) => c.id);
      onAccept?.(accepted);
      close();
    };

    const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
      setToggledCategories((prev) => new Map(prev).set(categoryId, checked));
    }, []);

    const handleBack = useCallback(() => {
      setShowPreferences(false);
    }, []);

    // ─── Reduced-motion fallback ─────────────────────────────
    // When closing is set but animations are disabled (prefers-reduced-motion
    // or no CSS animation support), onAnimationEnd won't fire. Detect this
    // and close immediately.

    useEffect(() => {
      if (!closing) return;
      if (typeof window === 'undefined') return;
      const el = bannerRef.current?.parentElement;
      if (!el) return;
      const animName = getComputedStyle(el).animationName;
      if (animName === 'none' || animName === '') {
        finishClose();
      }
    }, [closing, finishClose]);

    // ─── Keep the page reachable ────────────────────────────
    // The banner is fixed over the bottom of the page. Tabbing to the
    // footer (Contact, Privacy Policy — what a shopper deciding about
    // cookies may want to read) left the focused link completely under it
    // (WCAG 2.4.11), and the end of every page could not be scrolled into
    // view. The banner's height is published on <html>; CookieConsent.css
    // turns it into scroll-padding (focus lands above the banner) and room
    // at the end of the page. Measured, not a token: it depends on the copy.
    const onScreen = isOpen || closing;
    useEffect(() => {
      const panel = bannerRef.current;
      if (!onScreen || !panel) return;
      const root = document.documentElement;
      const publish = () =>
        root.style.setProperty('--cookie-consent-height', `${panel.offsetHeight}px`);
      publish();
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(publish);
      observer?.observe(panel);
      return () => {
        observer?.disconnect();
        root.style.removeProperty('--cookie-consent-height');
      };
    }, [onScreen]);

    // ─── Focus management ───────────────────────────────────
    // On open, move focus to the dialog heading so screen readers announce
    // the banner. The previously focused element is restored on close.

    // Safari never focuses the button that was clicked/tapped (a "Cookie
    // settings" link reopening the banner), so the opener is taken from the
    // last press there (see internal/dialog-opener).
    useEffect(() => trackDialogOpeners(), []);

    useEffect(() => {
      if (!isOpen) return;
      previousFocusRef.current = dialogOpener();
      headingRef.current?.focus();
    }, [isOpen]);

    // ─── Escape key ─────────────────────────────────────────

    useEffect(() => {
      if (!isOpen || closing) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        // A nested overlay (Modal, Popover, Select…) that consumed this
        // Escape calls preventDefault — Radix does so in the capture phase,
        // before this bubble-phase listener. Closing the banner too would
        // dismiss it without a consent choice.
        if (e.key === 'Escape' && !e.defaultPrevented) {
          close();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closing, close]);

    // ─── Render ─────────────────────────────────────────────

    if (!isOpen && !closing) return null;

    const hasCategories = categories && categories.length > 0;

    const classes = [
      'ds-cookie-consent',
      closing && 'ds-cookie-consent--closing',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        role="dialog"
        aria-labelledby={headingId}
        aria-modal="false"
        onAnimationEnd={handleAnimationEnd}
        {...props}
      >
        <div className="ds-cookie-consent__content" ref={bannerRef}>
          <div className="ds-cookie-consent__header">
            <Text
              as="p"
              size="lg"
              weight="semibold"
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="ds-cookie-consent__heading"
            >
              {heading}
            </Text>
            <Text size="sm" muted>
              {description}
              {learnMoreUrl && (
                <>
                  {' '}
                  <a href={learnMoreUrl} className="ds-cookie-consent__link">{learnMoreLabel}</a>
                </>
              )}
            </Text>
          </div>

          {hasCategories && showPreferences && (
            <div className="ds-cookie-consent__preferences">
              <Accordion type="multiple" size="sm" bordered>
                {categories.map((category) => {
                  const categoryUrl = safeHref(category.learnMoreHref);
                  return (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger
                        checked={isCategoryChecked(category)}
                        checkboxDisabled={category.required}
                        checkboxLabel={category.label}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.id, checked === true)
                        }
                      >
                        {category.label}
                      </AccordionTrigger>
                      {(category.description || categoryUrl) && (
                        <AccordionContent>
                          {category.description && (
                            <Text size="sm" muted className="ds-cookie-consent__category-description">
                              {category.description}
                            </Text>
                          )}
                          {categoryUrl && (
                            <a href={categoryUrl} className="ds-cookie-consent__link ds-cookie-consent__category-link">
                              Learn More
                            </a>
                          )}
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}

          <div className="ds-cookie-consent__actions">
            {hasCategories && showPreferences ? (
              <>
                <Button variant="secondary" size="md" onClick={handleBack}>
                  {closeLabel}
                </Button>
                <Button variant="primary" size="md" onClick={handleSavePreferences}>
                  {saveLabel}
                </Button>
              </>
            ) : (
              <>
                {hasCategories && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowPreferences(true)}
                  >
                    {preferencesLabel}
                  </Button>
                )}
                <Button variant="secondary" size="md" onClick={handleReject}>
                  {rejectLabel}
                </Button>
                <Button variant="primary" size="md" onClick={handleAcceptAll}>
                  {acceptLabel}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

CookieConsent.displayName = 'CookieConsent';
