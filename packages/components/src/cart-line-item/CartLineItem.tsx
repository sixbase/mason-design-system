import { forwardRef, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { Text } from '../typography/Typography';
import { Button } from '../button/Button';
import { QuantitySelector } from '../quantity-selector/QuantitySelector';
import { PriceDisplay } from '../price-display/PriceDisplay';
import { Badge } from '../badge/Badge';
import { Image, X } from '../icon';
import './CartLineItem.css';

export interface CartLineItemOption {
  name: string;
  value: string;
}

export interface CartLineItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  /** Unique identifier for this cart item */
  id: string;
  /** Product name */
  name: string;
  /** Product image URL */
  image?: string;
  /** Alt text for product image */
  imageAlt?: string;
  /** Unit price in cents (e.g. 4800 = $48.00) */
  price: number;
  /** Original price in cents, shown with strikethrough when on sale */
  compareAtPrice?: number;
  /** Current quantity */
  quantity: number;
  /** Maximum allowed quantity */
  maxQuantity?: number;
  /** Product options (e.g. Size, Color) */
  options?: CartLineItemOption[];
  /** Called when quantity changes */
  onQuantityChange: (quantity: number) => void;
  /** Called when item is removed */
  onRemove: () => void;
  /** Link to product detail page */
  href?: string;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * CartLineItem
 *
 * A single row in the cart — thumbnail, product info, quantity controls,
 * line price, and remove action. Used in both Cart page and Cart Drawer.
 *
 * @example
 * <CartLineItem
 *   id="1"
 *   name="Canvas Tote"
 *   price={4800}
 *   quantity={2}
 *   onQuantityChange={(q) => update(q)}
 *   onRemove={() => remove()}
 * />
 */
export const CartLineItem = forwardRef<HTMLDivElement, CartLineItemProps>(
  function CartLineItem(
    {
      id: _id,
      name,
      image,
      imageAlt,
      price,
      compareAtPrice,
      quantity,
      maxQuantity = 99,
      options,
      onQuantityChange,
      onRemove,
      href,
      className,
      ...props
    },
    ref,
  ) {
    const lineTotal = useMemo(() => price * quantity, [price, quantity]);
    const isOnSale = compareAtPrice != null && compareAtPrice > price;

    const classes = [
      'ds-cart-line-item',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const nameContent = (
      <Text size="sm" weight="semibold" className="ds-cart-line-item__name">
        {name}
      </Text>
    );

    return (
      <div
        ref={ref}
        role="group"
        aria-label={name}
        className={classes}
        {...props}
      >
        {/* ── Image ──────────────────────────────────────── */}
        <div className="ds-cart-line-item__image-wrapper">
          {image ? (
            <img
              src={image}
              alt={imageAlt ?? name}
              className="ds-cart-line-item__image"
            />
          ) : (
            <div className="ds-cart-line-item__placeholder" aria-hidden="true">
              <Image size="lg" />
            </div>
          )}
        </div>

        {/* ── Info ───────────────────────────────────────── */}
        <div className="ds-cart-line-item__info">
          {href ? (
            <a href={href} className="ds-cart-line-item__link">
              {nameContent}
            </a>
          ) : (
            nameContent
          )}

          {options && options.length > 0 && (
            <div className="ds-cart-line-item__options">
              {options.map((opt) => (
                <Text key={`${opt.name}-${opt.value}`} size="sm" muted>
                  {opt.name}: {opt.value}
                </Text>
              ))}
            </div>
          )}

          {isOnSale && (
            <Badge variant="secondary" size="sm">Sale</Badge>
          )}

          {/* Unit price (visible on mobile below info) */}
          <div className="ds-cart-line-item__unit-price">
            <PriceDisplay
              price={formatPrice(price)}
              comparePrice={isOnSale ? formatPrice(compareAtPrice) : undefined}
              size="sm"
            />
          </div>
        </div>

        {/* ── Quantity ──────────────────────────────────── */}
        <div className="ds-cart-line-item__quantity">
          <QuantitySelector
            size="sm"
            value={quantity}
            min={1}
            max={maxQuantity}
            onChange={onQuantityChange}
            aria-label={`Quantity for ${name}`}
          />
        </div>

        {/* ── Line total ────────────────────────────────── */}
        <div className="ds-cart-line-item__price">
          <Text size="sm" weight="semibold">
            {formatPrice(lineTotal)}
          </Text>
        </div>

        {/* ── Remove ────────────────────────────────────── */}
        <div className="ds-cart-line-item__remove">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={onRemove}
            aria-label={`Remove ${name} from cart`}
          >
            <X size="sm" />
          </Button>
        </div>
      </div>
    );
  },
);

CartLineItem.displayName = 'CartLineItem';
