import { useRef, useState } from 'react';
import {
  AddToCartButton,
  Button,
  Heading,
  ProductCard,
  SegmentedControl,
  SegmentedControlItem,
  ShoppingBag,
  Text,
} from '@ds/components';
import type { AddToCartStatus } from '@ds/components';
import { enter, flyToCart, useFlip, useReveal } from '@ds/motion/react';
import { motion } from '@ds/tokens';
import type { MotionEasing } from '@ds/tokens';
import { PRODUCTS } from './data/products';
import './MotionDemo.css';

// ─── Easing curves ──────────────────────────────────────────

const EASINGS: Array<{ name: MotionEasing; use: string }> = [
  { name: 'emphasized', use: 'Arrivals — reveals, the hero, overlays opening' },
  { name: 'emphasized-in', use: 'Exits — overlays closing, items leaving' },
  { name: 'glide', use: 'Moves — layout (FLIP) changes, a thumb sliding' },
  { name: 'spring', use: 'Confirmations — a badge bump, a check landing' },
  { name: 'default', use: 'Micro-interactions — hover, focus, color' },
];

/** SVG path for a cubic-bezier, drawn in a 100×100 box (y flipped). */
function curvePath([x1, y1, x2, y2]: readonly number[]): string {
  const pt = (x: number, y: number) => `${(x * 100).toFixed(1)},${((1 - y) * 100).toFixed(1)}`;
  return `M0,100 C${pt(x1 ?? 0, y1 ?? 0)} ${pt(x2 ?? 1, y2 ?? 1)} 100,0`;
}

export function EasingGallery() {
  const [played, setPlayed] = useState(false);
  return (
    <div className={['motion-demo', played && 'motion-demo--played'].filter(Boolean).join(' ')}>
      <div className="motion-demo__toolbar">
        <Text size="sm" muted>
          Every dot travels for 686ms — only the curve changes.
        </Text>
        <Button size="sm" variant="secondary" onClick={() => setPlayed((p) => !p)}>
          {played ? 'Play back' : 'Play'}
        </Button>
      </div>
      <ul className="motion-demo__easings">
        {EASINGS.map(({ name, use }) => (
          <li key={name} className="motion-demo__easing">
            <svg className="motion-demo__curve" viewBox="-6 -30 112 136" aria-hidden="true" focusable="false">
              <path className="motion-demo__curve-axis" d="M0,100 L100,100 M0,100 L0,0" />
              <path className="motion-demo__curve-line" d={curvePath(motion.easing[name])} />
            </svg>
            <div className="motion-demo__easing-body">
              <Text size="sm" weight="medium" className="motion-demo__mono">
                --transition-easing-{name}
              </Text>
              <Text size="sm" muted>
                {use}
              </Text>
              <div className="motion-demo__track">
                <span className={['motion-demo__dot', `motion-demo__dot--${name}`].join(' ')} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Durations ──────────────────────────────────────────────

const DURATIONS: Array<{ name: keyof typeof motion.duration; use: string }> = [
  { name: 'fast', use: 'Hover, press, focus rings' },
  { name: 'normal', use: 'Color and state changes, small toggles' },
  { name: 'slow', use: 'Overlays, popovers, accordion height' },
  { name: 'slower', use: 'Layout moves (FLIP), drawers, staggered items' },
  { name: 'slowest', use: 'Hero and section reveals, fly-to-cart' },
];

export function DurationGallery() {
  const [played, setPlayed] = useState(false);
  return (
    <div className={['motion-demo', played && 'motion-demo--played'].filter(Boolean).join(' ')}>
      <div className="motion-demo__toolbar">
        <Text size="sm" muted>
          Each step is the previous × φ (1.618), eased with emphasized.
        </Text>
        <Button size="sm" variant="secondary" onClick={() => setPlayed((p) => !p)}>
          {played ? 'Play back' : 'Play'}
        </Button>
      </div>
      <ul className="motion-demo__durations">
        {DURATIONS.map(({ name, use }) => (
          <li key={name} className="motion-demo__duration">
            <div className="motion-demo__duration-label">
              <Text size="sm" weight="medium" className="motion-demo__mono">
                {name} · {motion.duration[name]}ms
              </Text>
              <Text size="sm" muted>
                {use}
              </Text>
            </div>
            <div className="motion-demo__track">
              <span className={['motion-demo__dot', `motion-demo__dot--d-${name}`].join(' ')} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Reveal patterns ────────────────────────────────────────

type RevealKind = 'reveal' | 'stagger' | 'split' | 'media';

const PATTERNS: Array<{ kind: RevealKind; title: string; body: string }> = [
  {
    kind: 'reveal',
    title: 'reveal',
    body: 'A section rises 26px and fades in. The default for content blocks.',
  },
  {
    kind: 'stagger',
    title: 'stagger',
    body: 'Direct children arrive one after another, 62ms apart.',
  },
  {
    kind: 'split',
    title: 'split',
    body: 'Heading lines rise out of a mask — reserved for editorial headlines.',
  },
  {
    kind: 'media',
    title: 'media',
    body: 'An image frame settles from 104% scale. For photography.',
  },
];

function PatternSample({ kind }: { kind: RevealKind }) {
  if (kind === 'stagger') {
    return (
      <ul className="motion-demo__chips" data-motion-sample="">
        {['Canvas', 'Linen', 'Stoneware', 'Leather', 'Wool'].map((m) => (
          <li key={m} className="motion-demo__chip">
            {m}
          </li>
        ))}
      </ul>
    );
  }
  if (kind === 'split') {
    return (
      <Heading as="h3" size="xl" className="motion-demo__split" data-motion-sample="">
        Fewer things, made better — built to outlast the trend cycle.
      </Heading>
    );
  }
  if (kind === 'media') {
    return (
      <div className="motion-demo__media-frame">
        <img
          className="motion-demo__media"
          src={PRODUCTS[0]?.image}
          alt="Minimal canvas tote on a plain backdrop"
          width={800}
          height={1000}
          data-motion-sample=""
        />
      </div>
    );
  }
  return (
    <div className="motion-demo__block" data-motion-sample="">
      <Heading as="h3" size="xl">
        Made to last
      </Heading>
      <Text size="sm" muted>
        Organic cotton canvas, reinforced handles, and a lifetime repair promise.
      </Text>
    </div>
  );
}

export function RevealGallery() {
  const cells = useRef<Record<string, HTMLDivElement | null>>({});

  const replay = (kind: RevealKind) => {
    const sample = cells.current[kind]?.querySelector<HTMLElement>('[data-motion-sample]');
    if (sample) void enter(sample, kind);
  };

  return (
    <div className="motion-demo motion-demo--patterns">
      {PATTERNS.map(({ kind, title, body }) => (
        <div
          key={kind}
          className="motion-demo__pattern"
          ref={(node) => {
            cells.current[kind] = node;
          }}
        >
          <div className="motion-demo__pattern-head">
            <div>
              <Text size="sm" weight="medium" className="motion-demo__mono">
                data-motion=&quot;{title}&quot;
              </Text>
              <Text size="sm" muted>
                {body}
              </Text>
            </div>
            <Button size="sm" variant="secondary" onClick={() => replay(kind)} aria-label={`Replay ${title}`}>
              Replay
            </Button>
          </div>
          <div className="motion-demo__stage">
            <PatternSample kind={kind} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Scroll reveal — live on this page ──────────────────────

export function ScrollRevealGallery() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="motion-demo motion-demo--scroll">
      <div data-motion="reveal" className="motion-demo__block">
        <Heading as="h3" size="xl">
          This block revealed as you scrolled to it
        </Heading>
        <Text size="sm" muted>
          It was hidden only after GSAP had loaded and only because it was below the fold. Reload the page scrolled
          down here and it simply stays visible.
        </Text>
      </div>
      <ul data-motion="stagger" className="motion-demo__tiles">
        {PRODUCTS.slice(0, 4).map((p) => (
          <li key={p.id}>
            <ProductCard name={p.name} price={p.price} image={p.image} fluid />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── FLIP — filter + sort ───────────────────────────────────

const FILTERS = ['all', 'home', 'accessories', 'clothing'] as const;
type Filter = (typeof FILTERS)[number];
type Sort = 'featured' | 'low' | 'high';

export function FlipGallery() {
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('featured');
  const { ref, capture } = useFlip<HTMLUListElement>();

  const items = PRODUCTS.slice(0, 8)
    .filter((p) => filter === 'all' || p.category === filter)
    .sort((a, b) => (sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0));

  return (
    <div className="motion-demo">
      <div className="motion-demo__controls">
        <SegmentedControl
          aria-label="Category"
          size="sm"
          value={filter}
          onValueChange={(v) => {
            capture();
            setFilter(v as Filter);
          }}
        >
          {FILTERS.map((f) => (
            <SegmentedControlItem key={f} value={f}>
              {f === 'all' ? 'All' : f[0]!.toUpperCase() + f.slice(1)}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <SegmentedControl
          aria-label="Sort by price"
          size="sm"
          value={sort}
          onValueChange={(v) => {
            capture();
            setSort(v as Sort);
          }}
        >
          <SegmentedControlItem value="featured">Featured</SegmentedControlItem>
          <SegmentedControlItem value="low">Price ↑</SegmentedControlItem>
          <SegmentedControlItem value="high">Price ↓</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <Text size="sm" muted aria-live="polite" className="motion-demo__count">
        {items.length} {items.length === 1 ? 'product' : 'products'}
      </Text>
      <ul ref={ref} className="motion-demo__tiles">
        {items.map((p) => (
          <li key={p.id} data-flip-id={p.id}>
            <ProductCard name={p.name} price={p.price} image={p.image} fluid />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Fly to cart ────────────────────────────────────────────

export function FlyToCartGallery() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<AddToCartStatus>('idle');
  const cardRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLButtonElement>(null);
  const product = PRODUCTS[1]!;

  const add = () => {
    if (status !== 'idle') return;
    setStatus('loading');
    // Simulated network round-trip; the animation starts on success.
    window.setTimeout(() => {
      setStatus('success');
      setCount((c) => c + 1);
      void flyToCart(cardRef.current, cartRef.current);
      window.setTimeout(() => setStatus('idle'), 1600);
    }, 420);
  };

  return (
    <div className="motion-demo motion-demo--store">
      <div className="motion-demo__store-bar">
        <img
          className="motion-demo__logo"
          src={`${import.meta.env.BASE_URL}mason-supply-co-logo.svg`}
          alt="Mason Supply Co."
          width={136}
          height={17}
        />
        <button
          ref={cartRef}
          type="button"
          className="motion-demo__cart"
          aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
        >
          <ShoppingBag size="md" />
          {count > 0 && (
            <span className="motion-demo__cart-count" aria-hidden="true">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </div>
      <div className="motion-demo__store-body">
        <div ref={cardRef} className="motion-demo__store-card">
          <ProductCard name={product.name} price={product.price} image={product.image} fluid />
        </div>
        <div className="motion-demo__store-actions">
          <Text size="sm" muted>
            The copy lifts first, then sweeps into the cart; the cart answers with a spring. The count and the screen
            reader label update without waiting for any of it.
          </Text>
          <AddToCartButton status={status} onClick={add} />
        </div>
      </div>
    </div>
  );
}
