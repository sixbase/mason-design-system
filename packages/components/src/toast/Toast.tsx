import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { HTMLAttributes, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Text } from '../typography/Typography';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from '../icon';
import { Button } from '../button/Button';
import './Toast.css';

// ─── Types ────────────────────────────────────────────────

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';
export type ToastPosition = 'top-right' | 'bottom-right' | 'bottom-center' | 'top-center';

export interface ToastData {
  id: string;
  title?: string;
  description: string;
  variant: ToastVariant;
  duration: number;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

export type ToastOptions = Omit<ToastData, 'id' | 'variant' | 'duration'> & {
  variant?: ToastVariant;
  duration?: number;
};

export interface ToastProviderProps {
  children: ReactNode;
  /** Where toasts appear on screen */
  position?: ToastPosition;
  /** Maximum number of visible toasts */
  maxToasts?: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
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

// ─── useToast hook ────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

// ─── Individual Toast ─────────────────────────────────────

interface ToastItemProps extends HTMLAttributes<HTMLDivElement> {
  data: ToastData;
  onRemove: (id: string) => void;
  position: ToastPosition;
}

export const Toast = forwardRef<HTMLDivElement, ToastItemProps>(
  function Toast({ data, onRemove, position, className, ...props }, ref) {
    const { id, title, description, variant, duration, action, onDismiss } = data;
    const [closing, setClosing] = useState(false);
    const [entered, setEntered] = useState(false);
    const [swiping, setSwiping] = useState(false);
    const toastRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(0);
    const remainingRef = useRef<number>(duration);
    const swipeRef = useRef<{ pointerId: number; startX: number; startY: number; offset: number } | null>(null);

    const startTimer = useCallback(() => {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
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
        onRemove(id);
      }
    }, [closing, id, onRemove, onDismiss]);

    const handleAnimationEnd = useCallback(() => {
      if (closing) {
        onDismiss?.();
        onRemove(id);
      } else {
        // Drop the enter class once it finishes — its `forwards` fill
        // would otherwise pin the transform and block swipe translation.
        setEntered(true);
      }
    }, [closing, id, onRemove, onDismiss]);

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
        if (duration > 0 && !closing) {
          startTimer();
        }
      },
      [duration, closing, startTimer],
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
      pauseTimer();
    }, [pauseTimer]);

    const handleMouseLeave = useCallback(() => {
      if (duration > 0 && !closing) {
        startTimer();
      }
    }, [duration, closing, startTimer]);

    const handleFocus = useCallback(() => {
      pauseTimer();
    }, [pauseTimer]);

    const handleBlur = useCallback(() => {
      if (duration > 0 && !closing) {
        startTimer();
      }
    }, [duration, closing, startTimer]);

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
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
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

// ─── Provider ─────────────────────────────────────────────

let toastCounter = 0;

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 3,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toast = useCallback((options: ToastOptions): string => {
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
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const visibleToasts = toasts.slice(-maxToasts);

  const containerClasses = [
    'ds-toast-container',
    `ds-toast-container--${position}`,
  ].join(' ');

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      {mounted &&
        createPortal(
          visibleToasts.length > 0 ? (
            <div className={containerClasses} aria-label="Notifications">
              {visibleToasts.map((t) => (
                <Toast
                  key={t.id}
                  data={t}
                  onRemove={dismiss}
                  position={position}
                />
              ))}
            </div>
          ) : null,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
