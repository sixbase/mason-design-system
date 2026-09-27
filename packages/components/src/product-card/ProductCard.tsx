import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Card, CardBody } from '../card/Card';
import { Text } from '../typography/Typography';
import { Image } from '../icon';
// Shared, cached Intl formatter (one instance per locale + currency — a
// collection grid re-renders every card on each filter or sort change).
import { formatMoney } from '../internal/format-money';
import './ProductCard.css';

/**
 * Card width step: `default` is the 220px standalone card, `lg` a
 * quarter of the 1200px container (300px) with base-size type.
 */
export type ProductCardSize = 'default' | 'lg';

export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Product display name */
  name: string;
  /** Price in cents (e.g. 4200 = $42.00) */
  price: number;
  /**
   * Product image URL. An empty string (a product with no media) renders a
   * neutral placeholder tile instead of a broken image.
   */
  image: string;
  /**
   * Alt text for the product photo — describe what the photo shows beyond
   * the name (e.g. "Canvas tote worn on the shoulder"; Shopify's media alt).
   * Omitted, the photo is treated as decorative (`alt=""`): the name is
   * read right after it, and a card wrapped in a link used to be announced
   * as "Canvas Tote Canvas Tote $48.00" — alt and name back to back.
   */
  imageAlt?: string;
  /** ISO 4217 currency code */
  currency?: string;
  /**
   * BCP 47 locale for the formatted price (default `'en-US'`): price 4200 +
   * `'de-DE'` + EUR → "42,00 €". Prices are hundredths for every currency, so
   * `'ja-JP'` + JPY needs 420000 for "￥4,200" (4200 → "￥42"). Explicit rather
   * than the runtime default so server and browser render the same string.
   */
  locale?: string;
  /** Card size */
  size?: ProductCardSize;
  /** Fill parent width (use inside CSS Grid layouts) */
  fluid?: boolean;
  /** Custom price renderer — overrides the default formatted price */
  renderPrice?: (price: number, currency: string) => ReactNode;
  /**
   * Badge or label overlay positioned over the image. It is read before
   * the name, so a card link announces "New, Linen Shirt, $89.00". A badge
   * that only repeats the price — "Sale" beside a PriceDisplay, which
   * already reads "Sale price …" — can be `aria-hidden`.
   */
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
    imageAlt = '',
    currency = 'USD',
    locale,
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
        image && hoverImage && 'ds-product-card--has-hover-image',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div className="ds-product-card__image-wrapper">
        {/* --card-image-ratio is set to var(--aspect-portrait) on the card root */}
        <div className="ds-card-image">
          {image ? (
            <img src={image} alt={imageAlt} className="ds-card-image__img" loading="lazy" />
          ) : (
            // Decorative: the name is already announced from the card body.
            <div className="ds-product-card__placeholder" aria-hidden="true">
              <Image size="lg" />
            </div>
          )}
          {image && hoverImage && (
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
            {formatMoney(price, currency, locale)}
          </Text>
        )}
      </CardBody>
      {footerSlot && <div className="ds-product-card__footer">{footerSlot}</div>}
    </Card>
  );
});
ProductCard.displayName = 'ProductCard';
