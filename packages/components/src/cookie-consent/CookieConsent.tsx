import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../accordion/Accordion';
import { Button } from '../button/Button';
import { Text } from '../typography/Typography';
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
  /** URL for a "Learn more" link shown below the description */
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
  /** URL for a "Learn more" link appended to the description */
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

    // Build initial category selection from defaults
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>(() => {
      if (!categories) return {};
      const initial: Record<string, boolean> = {};
      for (const cat of categories) {
        initial[cat.id] = cat.required ? true : (cat.defaultChecked ?? false);
      }
      return initial;
    });

    const headingId = useId();
    const bannerRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // ─── Handlers ───────────────────────────────────────────

    const finishClose = useCallback(() => {
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
      setClosing(true);
    }, []);

    const handleAnimationEnd = useCallback(() => {
      if (closing) {
        finishClose();
      }
    }, [closing, finishClose]);

    const handleAcceptAll = useCallback(() => {
      const allIds = categories ? categories.map((c) => c.id) : [];
      onAccept?.(allIds);
      close();
    }, [categories, onAccept, close]);

    const handleReject = useCallback(() => {
      onReject?.();
      close();
    }, [onReject, close]);

    const handleSavePreferences = useCallback(() => {
      const accepted = Object.entries(selectedCategories)
        .filter(([, checked]) => checked)
        .map(([id]) => id);
      onAccept?.(accepted);
      close();
    }, [selectedCategories, onAccept, close]);

    const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
      setSelectedCategories((prev) => ({ ...prev, [categoryId]: checked }));
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

    // ─── Focus management ───────────────────────────────────
    // On open, move focus to the dialog heading so screen readers announce
    // the banner. The previously focused element is restored on close.

    useEffect(() => {
      if (!isOpen) return;
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      headingRef.current?.focus();
    }, [isOpen]);

    // ─── Escape key ─────────────────────────────────────────

    useEffect(() => {
      if (!isOpen || closing) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
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
            >
              {heading}
            </Text>
            <Text size="sm" muted>
              {description}
              {learnMoreHref && (
                <>
                  {' '}
                  <a href={learnMoreHref} className="ds-cookie-consent__link">{learnMoreLabel}</a>
                </>
              )}
            </Text>
          </div>

          {hasCategories && showPreferences && (
            <div className="ds-cookie-consent__preferences">
              <Accordion type="multiple" size="sm" bordered>
                {categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger
                      checked={selectedCategories[category.id] ?? false}
                      checkboxDisabled={category.required}
                      checkboxLabel={category.label}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked === true)
                      }
                    >
                      {category.label}
                    </AccordionTrigger>
                    {(category.description || category.learnMoreHref) && (
                      <AccordionContent>
                        {category.description && (
                          <Text size="sm" muted className="ds-cookie-consent__category-description">
                            {category.description}
                          </Text>
                        )}
                        {category.learnMoreHref && (
                          <a href={category.learnMoreHref} className="ds-cookie-consent__link ds-cookie-consent__category-link">
                            Learn More
                          </a>
                        )}
                      </AccordionContent>
                    )}
                  </AccordionItem>
                ))}
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
