/**
 * Shared money formatter for every component that shows a price
 * (ProductCard, CartLineItem, CartDrawer, PredictiveSearch, CollectionFilters).
 *
 * Amounts are integer hundredths of the currency unit — the Shopify
 * convention — for EVERY currency: $48.00 = 4800, ¥4,800 = 480000,
 * 48.000 KWD = 4800. Intl then shows each currency's own decimals (JPY 0,
 * KWD 3), so ¥ never gets ".00" and a zero-decimal price is never read as
 * hundredths of a yen. (Stripe's "smallest unit" differs for JPY — convert
 * at the API boundary, not here.)
 *
 * `locale` is explicit, never the runtime default: server (Node, usually
 * en-US) and browser (e.g. de-DE) would otherwise format differently and
 * break hydration. Default 'en-US' matches the old hardcoded behaviour.
 *
 * Constructing an Intl.NumberFormat costs far more than format() on an
 * existing one (~160µs vs ~3µs on a throttled phone), and a collection
 * grid formats hundreds of prices — so one instance per locale + currency.
 */
import { devWarning } from './dev-warning';

const moneyFormats = new Map<string, Intl.NumberFormat | null>();

export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_LOCALE = 'en-US';

function moneyFormat(currency: string, locale: string): Intl.NumberFormat | null {
  const key = `${locale}|${currency}`;
  let format = moneyFormats.get(key);
  if (format === undefined) {
    try {
      format = new Intl.NumberFormat(locale, { style: 'currency', currency });
    } catch {
      // Unknown currency code or malformed locale: RangeError. A price must
      // still render — fall back below rather than crash the whole card.
      format = null;
    }
    moneyFormats.set(key, format);
  }
  return format;
}

/** Number of decimals the currency uses (USD 2, JPY 0, KWD 3). */
export function currencyDecimals(currency: string = DEFAULT_CURRENCY, locale: string = DEFAULT_LOCALE): number {
  return moneyFormat(currency, locale)?.resolvedOptions().maximumFractionDigits ?? 2;
}

/**
 * Format integer hundredths (`4800`) as a localized price (`$48.00`, `48,00 €`).
 *
 * Anything that is not a finite number formats as an empty string. Product
 * data arrives as JSON: a missing price (`null`) used to show "$0.00" — free —
 * `undefined` showed "$NaN", and a decimal string ("48.0", the Storefront
 * API's `amount`) was coerced and showed "$0.48". No price beats a wrong one.
 */
export function formatMoney(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) {
    devWarning(
      'formatMoney:invalid',
      `Price ${JSON.stringify(cents) ?? String(cents)} is not a finite number of cents (4800 = $48.00) — rendered blank.`,
    );
    return '';
  }
  const amount = cents / 100;
  const format = moneyFormat(currency, locale);
  if (format) return format.format(amount);
  try {
    return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${currency}`;
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
