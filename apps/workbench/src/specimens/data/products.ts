// ─── Product data for prototype pages ──────────────────────

export interface Product {
  id: string;
  name: string;
  price: number; // cents
  compareAtPrice?: number; // cents — original price if on sale
  image: string;
  category: string;
  badge?: string;
  description?: string;
}

// ─── Placeholder image helper ──────────────────────────────

function makePlaceholder(
  label: string,
  fill = '#d4c8b0',
  textFill = '#8b7e6a',
): string {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">` +
      `<rect width="800" height="1000" fill="${fill}"/>` +
      `<text x="400" y="500" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="system-ui,sans-serif" font-size="32" fill="${textFill}">${label}</text>` +
      `</svg>`,
  );
  return `data:image/svg+xml,${encoded}`;
}

// ─── Products ──────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  {
    id: 'minimal-tote',
    name: 'Minimal Canvas Tote',
    price: 4800,
    image: makePlaceholder('Canvas Tote', '#c8bfae', '#7a7262'),
    category: 'bags',
    badge: 'Best Seller',
    description: 'Durable organic cotton canvas tote with reinforced handles.',
  },
  {
    id: 'ceramic-mug',
    name: 'Handmade Ceramic Mug',
    price: 3200,
    image: makePlaceholder('Ceramic Mug', '#d9cfc0', '#8b7e6a'),
    category: 'home',
    description: 'Hand-thrown stoneware mug with a matte glaze finish.',
  },
  {
    id: 'linen-shirt',
    name: 'Relaxed Linen Shirt',
    price: 8900,
    compareAtPrice: 11200,
    image: makePlaceholder('Linen Shirt', '#c4bba8', '#756d5c'),
    category: 'clothing',
    badge: 'Sale',
    description: 'Lightweight linen shirt with a relaxed, boxy fit.',
  },
  {
    id: 'soy-candle',
    name: 'Hand-Poured Soy Candle',
    price: 2800,
    image: makePlaceholder('Soy Candle', '#ddd4c4', '#9a8e7c'),
    category: 'home',
    description: 'Clean-burning soy wax candle with essential oil blend.',
  },
  {
    id: 'wool-beanie',
    name: 'Merino Wool Beanie',
    price: 3500,
    image: makePlaceholder('Wool Beanie', '#b8b0a0', '#706858'),
    category: 'accessories',
    description: 'Soft merino wool beanie knit in a classic ribbed pattern.',
  },
  {
    id: 'leather-wallet',
    name: 'Vegetable-Tanned Wallet',
    price: 6500,
    image: makePlaceholder('Leather Wallet', '#c2b49e', '#7a6e58'),
    category: 'accessories',
    badge: 'New',
    description: 'Full-grain leather wallet that develops a rich patina over time.',
  },
  {
    id: 'cotton-throw',
    name: 'Woven Cotton Throw',
    price: 7200,
    image: makePlaceholder('Cotton Throw', '#d0c7b5', '#877b69'),
    category: 'home',
    description: 'Textured cotton throw blanket woven on a traditional loom.',
  },
  {
    id: 'stoneware-bowl',
    name: 'Stoneware Serving Bowl',
    price: 4200,
    image: makePlaceholder('Serving Bowl', '#cdc3b2', '#857965'),
    category: 'home',
    description: 'Large stoneware bowl with a reactive glaze finish.',
  },
  {
    id: 'organic-tee',
    name: 'Organic Cotton Tee',
    price: 3800,
    image: makePlaceholder('Cotton Tee', '#c9c0ae', '#7d7564'),
    category: 'clothing',
    description: 'Heavyweight organic cotton tee with a boxy, relaxed fit.',
  },
  {
    id: 'brass-keychain',
    name: 'Solid Brass Keychain',
    price: 2200,
    image: makePlaceholder('Brass Keychain', '#d5cbb8', '#928571'),
    category: 'accessories',
    description: 'Machined solid brass keychain with a screw-lock clasp.',
  },
  {
    id: 'linen-apron',
    name: 'Washed Linen Apron',
    price: 5400,
    image: makePlaceholder('Linen Apron', '#bfb7a5', '#74694f'),
    category: 'home',
    description: 'Pre-washed linen apron with adjustable leather straps.',
  },
  {
    id: 'cork-notebook',
    name: 'Cork Cover Notebook',
    price: 1800,
    image: makePlaceholder('Cork Notebook', '#d2c9b7', '#8a7d6b'),
    category: 'accessories',
    description: 'A5 notebook with a natural cork cover and dotted pages.',
  },
];

// ─── Helpers ───────────────────────────────────────────────

export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
