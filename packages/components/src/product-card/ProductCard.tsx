import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Card, CardBody } from '../card/Card';
import { Text } from '../typography/Typography';
import './ProductCard.css';

export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Product display name */
  name: string;
  /** Price in cents (e.g. 4200 = $42.00) */
  price: number;
  /** Product image URL */
  image: string;
  /** ISO 4217 currency code */
  currency?: string;
  /** Card size */
  size?: 'default' | 'lg';
  /** Fill parent width (use inside CSS Grid layouts) */
  fluid?: boolean;
  /** Custom price renderer — overrides the default formatted price */
  renderPrice?: (price: number, currency: string) => ReactNode;
  /** Badge or label overlay positioned over the image */
  badge?: ReactNode;
  /** Secondary image URL shown on hover (pointer devices only — touch keeps the first image) */
  hoverImage?: string;
  /**
   * Action overlay slot, top-right of the image (e.g. a wishlist icon button).
   * Pure slot — no baked-in behavior. Slotted buttons/links get a 44px hit area.
   */
  actionSlot?: ReactNode;
  /**
   * Footer slot rendered below the name/price (e.g. a quick-add button).
   * Pure slot — no baked-in behavior.
   */
  footerSlot?: ReactNode;
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * ProductCard
 *
 * A minimal product card composing Card, CardImage, and Typography.
 * Displays a 4:5 product image, name, and price.
 *
 * @example
 * <ProductCard
 *   name="Classic T-Shirt"
 *   price={3200}
 *   image="/products/tshirt.jpg"
 * />
 *
 * @example
 * <ProductCard
 *   name="Sale Item"
 *   price={2400}
 *   image="/products/sale.jpg"
 *   badge={<Badge variant="destructive" size="sm">Sale</Badge>}
 *   renderPrice={(price, currency) => <PriceDisplay price={price} />}
 * />
 */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  {
    name,
    price,
    image,
    currency = 'USD',
    size = 'default',
    fluid,
    renderPrice,
    badge,
    hoverImage,
    actionSlot,
    footerSlot,
    className,
    ...props
  },
  ref,
) {
  return (
    <Card
      ref={ref}
      variant="ghost"
      interactive
      noPadding
      className={[
        'ds-product-card',
        size !== 'default' && `ds-product-card--${size}`,
        fluid && 'ds-product-card--fluid',
        hoverImage && 'ds-product-card--has-hover-image',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div className="ds-product-card__image-wrapper">
        {/* --card-image-ratio is set to var(--aspect-portrait) on the card root */}
        <div className="ds-card-image">
          <img src={image} alt={name} className="ds-card-image__img" loading="lazy" />
          {hoverImage && (
            <img
              src={hoverImage}
              alt=""
              className="ds-card-image__img ds-product-card__hover-image"
              loading="lazy"
              aria-hidden="true"
            />
          )}
        </div>
        {badge && <div className="ds-product-card__badge">{badge}</div>}
        {actionSlot && <div className="ds-product-card__action">{actionSlot}</div>}
      </div>
      <CardBody>
        <Text size="sm" className="ds-product-card__name">
          {name}
        </Text>
        {renderPrice ? (
          <div className="ds-product-card__price">{renderPrice(price, currency)}</div>
        ) : (
          <Text size="sm" muted className="ds-product-card__price">
            {formatPrice(price, currency)}
          </Text>
        )}
      </CardBody>
      {footerSlot && <div className="ds-product-card__footer">{footerSlot}</div>}
    </Card>
  );
});
ProductCard.displayName = 'ProductCard';
