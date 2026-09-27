import { forwardRef, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { Text } from '../typography/Typography';
import { Button } from '../button/Button';
import { QuantitySelector } from '../quantity-selector/QuantitySelector';
import { PriceDisplay } from '../price-display/PriceDisplay';
import { Badge } from '../badge/Badge';
import { Image, X } from '../icon';
import { formatMoney } from '../internal/format-money';
import { safeHref } from '../internal/safe-url';
import './CartLineItem.css';

export interface CartLineItemOption {
  /** Option name — e.g. "Color", "Size" */
  name: string;
  /** Chosen value — e.g. "Brushed Brass", "M" */
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
  /** ISO 4217 currency code for all prices on the line (default `'USD'`) */
  currency?: string;
  /** BCP 47 locale for every price on the line (default `'en-US'`) */
  locale?: string;
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
      currency = 'USD',
      locale,
      className,
      ...props
    },
    ref,
  ) {
    // A missing price (null from cart JSON) must not multiply out to a
    // "$0.00" line total — NaN formats blank, like the unit price.
    const lineTotal = useMemo(
      () => (typeof price === 'number' && typeof quantity === 'number' ? price * quantity : Number.NaN),
      [price, quantity],
    );
    const isOnSale = compareAtPrice != null && compareAtPrice > price;
    // Desktop shows the line total in its own column, so the unit price under
    // the name is hidden there — unless it says something the total can't: a
    // sale (the strikethrough compare-at price) or a per-unit price when the
    // quantity is above one. Hiding it unconditionally dropped every sign of a
    // sale on desktop except a bare "Sale" pill.
    const unitPriceAddsInfo = isOnSale || quantity > 1;
    // A javascript:/data: link from cart data renders the name unlinked (internal/safe-url)
    const linkHref = safeHref(href);

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
          {linkHref ? (
            <a href={linkHref} className="ds-cart-line-item__link">
              {nameContent}
            </a>
          ) : (
            nameContent
          )}

          {options && options.length > 0 && (
            <div className="ds-cart-line-item__options">
              {options.map((opt) => (
                <Text
                  key={`${opt.name}-${opt.value}`}
                  size="sm"
                  muted
                  className="ds-cart-line-item__option"
                >
                  {opt.name}: {opt.value}
                </Text>
              ))}
            </div>
          )}

          {/* Visual only: the price below already reads "Sale price …,
              Original price …", so a spoken "Sale" first was a repeat. */}
          {isOnSale && (
            <Badge variant="secondary" size="sm" aria-hidden="true">Sale</Badge>
          )}

          {/* Unit price — always on mobile; on desktop only when it adds
              information beyond the line-total column (see above). */}
          <div
            className={[
              'ds-cart-line-item__unit-price',
              unitPriceAddsInfo && 'ds-cart-line-item__unit-price--informative',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <PriceDisplay
              price={formatMoney(price, currency, locale)}
              comparePrice={isOnSale ? formatMoney(compareAtPrice, currency, locale) : undefined}
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
            {formatMoney(lineTotal, currency, locale)}
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
