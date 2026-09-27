import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Text } from '../typography/Typography';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from '../icon';
import { Button } from '../button/Button';
import './Toast.css';

// ─── Types ────────────────────────────────────────────────

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';
export type ToastPosition = 'top-right' | 'bottom-right' | 'bottom-center' | 'top-center';

export interface ToastData {
  /** Unique id — returned by `toast()` and accepted by `dismiss()` */
  id: string;
  /** Optional bold first line */
  title?: string;
  /** Message body (required — the toast's accessible text) */
  description: string;
  /** Status style; `error` also switches the live region to assertive */
  variant: ToastVariant;
  /** Auto-dismiss delay in ms; 0 or less keeps the toast until dismissed */
  duration: number;
  /** One inline action button (e.g. "Undo") */
  action?: { label: string; onClick: () => void };
  /** Called once when the toast leaves — dismissed, timed out, or evicted */
  onDismiss?: () => void;
}

export type ToastOptions = Omit<ToastData, 'id' | 'variant' | 'duration'> & {
  variant?: ToastVariant;
  duration?: number;
};

export interface ToastProviderProps {
  /** The app subtree that may call `useToast()` */
  children: ReactNode;
  /** Where toasts appear on screen */
  position?: ToastPosition;
  /** Maximum number of visible toasts */
  maxToasts?: number;
}

/** What `useToast()` returns. */
export interface ToastContextValue {
  /** Show a toast; returns its id */
  toast: (options: ToastOptions) => string;
  /** Remove one toast by id */
  dismiss: (id: string) => void;
  /** Remove every toast */
  dismissAll: () => void;
}

// ─── Icons ────────────────────────────────────────────────

const VARIANT_ICONS: Record<ToastVariant, () => ReactNode> = {
  default: () => <Info size="md" />,
  success: () => <CircleCheck size="md" />,
  error: () => <CircleX size="md" />,
  warning: () => <TriangleAlert size="md" />,
};

// ─── Motion & swipe config ────────────────────────────────

const MOTION_CLASSES: Record<ToastPosition, { enter: string; closing: string }> = {
  'top-right': { enter: 'ds-toast--enter', closing: 'ds-toast--closing' },
  'bottom-right': { enter: 'ds-toast--enter', closing: 'ds-toast--closing' },
  'bottom-center': { enter: 'ds-toast--enter-center', closing: 'ds-toast--closing-center' },
  'top-center': { enter: 'ds-toast--enter-top', closing: 'ds-toast--closing-top' },
};

/** Swipe-to-dismiss travels toward the nearest screen edge. */
const SWIPE_BY_POSITION: Record<ToastPosition, { axis: 'x' | 'y'; direction: 1 | -1 }> = {
  'top-right': { axis: 'x', direction: 1 },
  'bottom-right': { axis: 'x', direction: 1 },
  'bottom-center': { axis: 'y', direction: 1 },
  'top-center': { axis: 'y', direction: -1 },
};

/**
 * Fallback mirroring the `--size-swipe-threshold` token (50px) for
 * environments where the CSS variable cannot be resolved (e.g. jsdom).
 * The token is read from CSS at runtime rather than imported from
 * `@ds/tokens/json` — the components tsconfig has no resolveJsonModule,
 * and reading the variable keeps the CSS token the single source of truth.
 */
const SWIPE_THRESHOLD_FALLBACK = 50;

function getSwipeThreshold(el: HTMLElement | null): number {
  if (!el) return SWIPE_THRESHOLD_FALLBACK;
  const raw = getComputedStyle(el).getPropertyValue('--size-swipe-threshold');
  const parsed = parseFloat(raw);
  return Number.isNaN(parsed) ? SWIPE_THRESHOLD_FALLBACK : parsed;
}

// ─── Context ──────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

/** Layout effect in the browser; plain effect on the server, where neither runs (and React warns about the layout one). */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// ─── useToast hook ────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

// ─── Individual Toast ─────────────────────────────────────

/**
 * Props for a single rendered toast. `ToastProvider` renders these for you;
 * use `<Toast>` directly only for static previews.
 */
export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** The toast's content and behaviour */
  data: ToastData;
  /** Called with the toast's id once its exit animation finishes */
  onRemove: (id: string) => void;
  /** Screen position — picks the enter/exit motion and swipe direction */
  position: ToastPosition;
  /**
   * Make this toast its own live region (`role="status"`, or `"alert"` for
   * errors). Default true, for a standalone `<Toast>`. ToastProvider turns
   * it off and announces through regions of its own that exist before any
   * toast does — a region inserted with its text already inside is often
   * skipped by NVDA and VoiceOver.
   */
  live?: boolean;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  function Toast({ data, onRemove, position, live = true, className, ...props }, ref) {
    const { id, title, description, variant, duration, action, onDismiss } = data;
    const [closing, setClosing] = useState(false);
    const [entered, setEntered] = useState(false);
    const [swiping, setSwiping] = useState(false);
    const toastRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(0);
    const remainingRef = useRef<number>(duration);
    const swipeRef = useRef<{ pointerId: number; startX: number; startY: number; offset: number } | null>(null);
    // Pause reasons are tracked separately: the timer may only resume when
    // the toast is neither hovered nor holding keyboard focus. A single
    // shared pause flag let a hover-out restart the countdown while focus
    // was still on the dismiss button — the toast then vanished under the
    // keyboard user and focus fell to <body>.
    const hoveredRef = useRef(false);
    const focusedRef = useRef(false);
    // Where keyboard focus came from when it entered this toast. Dismissing
    // with Enter on × removed the focused toast and focus fell to <body> —
    // the next Tab restarted at the top of the page (WCAG 2.4.3). Hand it
    // back on the way out.
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const handOffFocus = useCallback(() => {
      const el = toastRef.current;
      const back = returnFocusRef.current;
      returnFocusRef.current = null;
      if (el && back?.isConnected && el.contains(document.activeElement)) back.focus();
    }, []);

    // Every other way out — the app calling dismiss(id) from an "Undo"
    // action, dismissAll(), eviction — unmounts the toast without the close
    // path below. Layout cleanups run before React detaches the node, so
    // focus can still be handed back here. (After the close path it's a
    // no-op: returnFocusRef is already cleared.)
    useIsomorphicLayoutEffect(() => handOffFocus, [handOffFocus]);

    const startTimer = useCallback(() => {
      // Never stack timers — an orphaned timeout can't be cleared on unmount
      if (timerRef.current) clearTimeout(timerRef.current);
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setClosing(true);
      }, remainingRef.current);
    }, []);

    const pauseTimer = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const elapsed = Date.now() - startTimeRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      }
    }, []);

    const resumeTimer = useCallback(() => {
      if (duration > 0 && !closing && !hoveredRef.current && !focusedRef.current) {
        startTimer();
      }
    }, [duration, closing, startTimer]);

    // Auto-dismiss timer
    useEffect(() => {
      if (duration <= 0) return;
      startTimer();
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [duration, startTimer]);

    // Reduced-motion fallback for exit animation
    useEffect(() => {
      if (!closing) return;
      const el = toastRef.current;
      if (!el) return;
      const animName = getComputedStyle(el).animationName;
      if (animName === 'none' || animName === '') {
        onDismiss?.();
        handOffFocus();
        onRemove(id);
      }
    }, [closing, id, onRemove, onDismiss, handOffFocus]);

    const handleAnimationEnd = useCallback(() => {
      if (closing) {
        onDismiss?.();
        handOffFocus();
        onRemove(id);
      } else {
        // Drop the enter class once it finishes — its `forwards` fill
        // would otherwise pin the transform and block swipe translation.
        setEntered(true);
      }
    }, [closing, id, onRemove, onDismiss, handOffFocus]);

    const handleDismiss = useCallback(() => {
      setClosing(true);
    }, []);

    // ─── Swipe to dismiss (touch/pen only) ────────────────

    const swipeConfig = SWIPE_BY_POSITION[position];

    const handlePointerDown = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' || closing) return;
        // Don't hijack taps on the action/dismiss buttons
        if ((e.target as HTMLElement).closest('button, a')) return;
        swipeRef.current = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          offset: 0,
        };
        pauseTimer();
        setSwiping(true);
        const el = toastRef.current;
        if (el && typeof el.setPointerCapture === 'function') {
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            /* not supported (e.g. jsdom) */
          }
        }
      },
      [closing, pauseTimer],
    );

    const handlePointerMove = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => {
        const drag = swipeRef.current;
        const el = toastRef.current;
        if (!drag || drag.pointerId !== e.pointerId || !el) return;
        const delta =
          swipeConfig.axis === 'x' ? e.clientX - drag.startX : e.clientY - drag.startY;
        // Only travel toward the dismiss edge
        const offset =
          swipeConfig.direction === 1 ? Math.max(0, delta) : Math.min(0, delta);
        drag.offset = offset;
        el.style.setProperty(
          swipeConfig.axis === 'x' ? '--toast-swipe-x' : '--toast-swipe-y',
          `${offset}px`,
        );
      },
      [swipeConfig],
    );

    const endSwipe = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
        const drag = swipeRef.current;
        if (!drag || drag.pointerId !== e.pointerId) return;
        swipeRef.current = null;
        setSwiping(false);
        const el = toastRef.current;
        if (el && typeof el.releasePointerCapture === 'function') {
          try {
            el.releasePointerCapture(e.pointerId);
          } catch {
            /* not supported (e.g. jsdom) */
          }
        }
        if (!cancelled && Math.abs(drag.offset) >= getSwipeThreshold(el)) {
          // Keep the swipe offset — the exit animation continues from it
          setClosing(true);
          return;
        }
        // Below threshold: return to rest (animated via CSS transition;
        // snaps instantly under prefers-reduced-motion)
        el?.style.setProperty('--toast-swipe-x', '0px');
        el?.style.setProperty('--toast-swipe-y', '0px');
        resumeTimer();
      },
      [resumeTimer],
    );

    const handlePointerUp = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => endSwipe(e, false),
      [endSwipe],
    );

    const handlePointerCancel = useCallback(
      (e: ReactPointerEvent<HTMLDivElement>) => endSwipe(e, true),
      [endSwipe],
    );

    const handleMouseEnter = useCallback(() => {
      hoveredRef.current = true;
      pauseTimer();
    }, [pauseTimer]);

    const handleMouseLeave = useCallback(() => {
      hoveredRef.current = false;
      resumeTimer();
    }, [resumeTimer]);

    const handleFocus = useCallback(
      (e: ReactFocusEvent<HTMLDivElement>) => {
        const from = e.relatedTarget;
        if (from instanceof HTMLElement && !e.currentTarget.contains(from)) {
          returnFocusRef.current = from;
        }
        focusedRef.current = true;
        pauseTimer();
      },
      [pauseTimer],
    );

    const handleBlur = useCallback(
      (e: ReactFocusEvent<HTMLDivElement>) => {
        // Focus moving between the action and dismiss buttons stays "inside"
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        focusedRef.current = false;
        resumeTimer();
      },
      [resumeTimer],
    );

    const motion = MOTION_CLASSES[position];

    const classes = [
      'ds-toast',
      `ds-toast--${variant}`,
      !entered && motion.enter,
      closing && motion.closing,
      swiping && 'ds-toast--swiping',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const isError = variant === 'error';
    const VariantIcon = VARIANT_ICONS[variant];

    return (
      <div
        ref={(node) => {
          (toastRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={classes}
        role={live ? (isError ? 'alert' : 'status') : undefined}
        aria-live={live ? (isError ? 'assertive' : 'polite') : undefined}
        onAnimationEnd={handleAnimationEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        {...props}
      >
        <span className="ds-toast__icon">
          <VariantIcon />
        </span>

        <div className="ds-toast__content">
          {title && (
            <Text as="p" size="sm" weight="semibold" className="ds-toast__title">
              {title}
            </Text>
          )}
          <Text as="p" size="sm" className="ds-toast__description">
            {description}
          </Text>
        </div>

        <div className="ds-toast__actions">
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="ds-toast__action"
            >
              {action.label}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className="ds-toast__dismiss"
          >
            <X size="sm" />
          </Button>
        </div>
      </div>
    );
  },
);

Toast.displayName = 'Toast';

// The provider renders this memoized copy (the exported Toast is unchanged).
// Every add or dismiss re-renders the provider; with the plain component each
// toast already on screen re-rendered too — its buttons, icons and text —
// though its props (the same data object, the stable `dismiss`, the position)
// had not changed.
const ToastItem = memo(Toast);

// ─── Provider ─────────────────────────────────────────────

let toastCounter = 0;

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 3,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [mounted, setMounted] = useState(false);
  // Synchronous mirror of `toasts` — lets toast() work out which entries it
  // evicts (and fire their onDismiss) outside a state updater, and keeps
  // several toast() calls in one tick consistent.
  const toastsRef = useRef<ToastData[]>([]);
  const limit = Math.max(1, maxToasts);
  // What the provider's own live regions say. They are in the page from
  // mount, empty, so each new toast is a text change inside an existing
  // region — the case every screen reader announces. Keyed by toast id so
  // the same message twice is spoken twice.
  const [announcement, setAnnouncement] = useState<{
    id: string;
    text: string;
    assertive: boolean;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const commit = useCallback((next: ToastData[]) => {
    toastsRef.current = next;
    setToasts(next);
  }, []);

  const toast = useCallback(
    (options: ToastOptions): string => {
      const id = `toast-${++toastCounter}`;
      const newToast: ToastData = {
        id,
        description: options.description,
        title: options.title,
        variant: options.variant ?? 'default',
        duration: options.duration ?? 5000,
        action: options.action,
        onDismiss: options.onDismiss,
      };
      // Oldest toasts past the limit are removed, not merely hidden —
      // hidden entries used to pile up in state and reappear (with fresh
      // timers) as soon as the newer toasts were dismissed.
      const next = [...toastsRef.current, newToast];
      const evicted = next.slice(0, Math.max(0, next.length - limit));
      commit(next.slice(evicted.length));
      setAnnouncement({
        id,
        text: [newToast.title, newToast.description].filter(Boolean).join('. '),
        assertive: newToast.variant === 'error',
      });
      evicted.forEach((t) => t.onDismiss?.());
      return id;
    },
    [commit, limit],
  );

  // A toast's own close path (×, timer, swipe) fires its onDismiss, then
  // calls this.
  const remove = useCallback(
    (id: string) => {
      commit(toastsRef.current.filter((t) => t.id !== id));
    },
    [commit],
  );

  // The public API: the app took the toast away, so onDismiss fires here —
  // "called once when the toast leaves", like the evictions above.
  const dismiss = useCallback(
    (id: string) => {
      const leaving = toastsRef.current.filter((t) => t.id === id);
      remove(id);
      leaving.forEach((t) => t.onDismiss?.());
    },
    [remove],
  );

  const dismissAll = useCallback(() => {
    const leaving = toastsRef.current;
    commit([]);
    leaving.forEach((t) => t.onDismiss?.());
  }, [commit]);

  const contextValue = useMemo(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll],
  );

  // Still sliced: a lowered `maxToasts` prop takes effect immediately
  const visibleToasts = toasts.slice(-limit);

  const spoken = visibleToasts.length > 0 ? announcement : null;

  const containerClasses = [
    'ds-toast-container',
    `ds-toast-container--${position}`,
  ].join(' ');

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted &&
        createPortal(
          <>
            {/* Always present, so a new toast is a change inside an existing
                region. Emptied once no toast is showing, so the old text is
                not left behind for browse mode. (Radix modals set
                aria-hidden on the page but leave [aria-live] elements alone,
                so these still speak while a Modal or Drawer is open. Only the
                attribute counts — role="alert" alone was hidden, and error
                toasts went silent behind an open dialog.) */}
            <div className="ds-toast-announcer" role="status" aria-live="polite" aria-atomic="true">
              {spoken && !spoken.assertive && <span key={spoken.id}>{spoken.text}</span>}
            </div>
            <div className="ds-toast-announcer" role="alert" aria-live="assertive" aria-atomic="true">
              {spoken?.assertive && <span key={spoken.id}>{spoken.text}</span>}
            </div>
            {visibleToasts.length > 0 ? (
              // role="region" so the label is exposed — aria-label on a plain
              // <div> (generic role) is ignored by assistive tech.
              <div className={containerClasses} role="region" aria-label="Notifications">
                {visibleToasts.map((t) => (
                  <ToastItem
                    key={t.id}
                    data={t}
                    onRemove={remove}
                    position={position}
                    // Announced by the regions above; a live toast as well
                    // would be read twice where it is read at all.
                    live={false}
                  />
                ))}
              </div>
            ) : null}
          </>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
