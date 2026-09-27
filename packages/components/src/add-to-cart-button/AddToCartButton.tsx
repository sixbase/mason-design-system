import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '../button';
import type { ButtonHTMLAttributes } from 'react';
import './AddToCartButton.css';

export type AddToCartStatus = 'idle' | 'loading' | 'success' | 'sold-out' | 'pre-order';
/** Button height — `md` or `lg` (default `lg`, the PDP primary action). */
export type AddToCartButtonSize = 'md' | 'lg';

/** Button text per status. Any label left out falls back to the English default. */
export interface AddToCartButtonLabels {
  /** Ready to add — default "Add to Bag" */
  idle?: string;
  /** While the request runs — default "Adding…" */
  loading?: string;
  /** Brief confirmation after success — default "Added!" */
  success?: string;
  /** `status="sold-out"` — default "Sold Out" */
  soldOut?: string;
  /** `status="pre-order"` — default "Pre-Order" */
  preOrder?: string;
}

const DEFAULT_LABELS: Required<AddToCartButtonLabels> = {
  idle: 'Add to Bag',
  loading: 'Adding\u2026',
  success: 'Added!',
  soldOut: 'Sold Out',
  preOrder: 'Pre-Order',
};

export interface AddToCartButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Current status of the add-to-cart action */
  status?: AddToCartStatus;
  /** Stretch to fill parent container width */
  fullWidth?: boolean;
  /** Size of the button */
  size?: AddToCartButtonSize;
  /** Override default labels for each status */
  labels?: AddToCartButtonLabels;
}

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="ds-add-to-cart__icon"
  >
    <path
      className="ds-add-to-cart__check"
      pathLength={1}
      d="M3 8.5l3.5 3.5L13 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * AddToCartButton
 *
 * A specialized shopping CTA with domain-specific states: idle, loading,
 * success feedback, sold out, and pre-order. Composes the base Button
 * component with ecommerce-specific behavior.
 *
 * @example
 * <AddToCartButton status="idle" onClick={handleAddToCart} />
 * <AddToCartButton status="loading" />
 * <AddToCartButton status="sold-out" />
 */
export const AddToCartButton = forwardRef<HTMLButtonElement, AddToCartButtonProps>(
  function AddToCartButton(
    {
      status = 'idle',
      fullWidth = false,
      size = 'lg',
      labels,
      onClick,
      className,
      ...props
    },
    ref,
  ) {
    const mergedLabels = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels]);
    const liveRef = useRef<HTMLSpanElement>(null);
    const prevStatusRef = useRef(status);

    // Announce status changes to screen readers. Returning to idle is not
    // news: "Added!" was followed ~2s later by "Add to Bag" read out on its
    // own, which sounds like a second action. Clearing an aria-live region
    // is silent, so idle just empties it for the next cycle.
    useEffect(() => {
      if (prevStatusRef.current !== status && liveRef.current) {
        liveRef.current.textContent =
          status === 'idle' ? '' : getLabelForStatus(status, mergedLabels);
      }
      prevStatusRef.current = status;
    }, [status, mergedLabels]);

    const isDisabled = status === 'sold-out';
    const isLoading = status === 'loading';
    const isInteractive = status === 'idle' || status === 'pre-order';

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isInteractive) return;
        onClick?.(e);
      },
      [isInteractive, onClick],
    );

    const classes = [
      'ds-add-to-cart',
      `ds-add-to-cart--${status}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        <Button
          ref={ref}
          className={classes}
          variant="primary"
          size={size}
          fullWidth={fullWidth}
          loading={isLoading}
          disabled={isDisabled ? undefined : props.disabled}
          aria-disabled={isDisabled || undefined}
          aria-busy={isLoading || undefined}
          onClick={handleClick}
          type="button"
          {...props}
        >
          {status === 'success' && <CheckIcon />}
          {getLabelForStatus(status, mergedLabels)}
        </Button>
        <span
          ref={liveRef}
          className="ds-add-to-cart__live"
          aria-live="polite"
          aria-atomic="true"
        />
      </>
    );
  },
);

AddToCartButton.displayName = 'AddToCartButton';

function getLabelForStatus(
  status: AddToCartStatus,
  labels: Required<AddToCartButtonLabels>,
): string {
  switch (status) {
    case 'idle':
      return labels.idle;
    case 'loading':
      return labels.loading;
    case 'success':
      return labels.success;
    case 'sold-out':
      return labels.soldOut;
    case 'pre-order':
      return labels.preOrder;
  }
}
