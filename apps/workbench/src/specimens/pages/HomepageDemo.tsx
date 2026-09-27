import { useState } from 'react';
import {
  Button, Carousel, CarouselSlide, Heading, Highlight, Highlights,
  Input, ProductCard, Text,
} from '@ds/components';
import { useReveal } from '@ds/motion/react';
import { PRODUCTS } from '../data/products';
import { makePlaceholder } from '../data/placeholder';
import './HomepageDemo.css';

// ─── Data ─────────────────────────────────────────────────

const FEATURED = PRODUCTS.slice(0, 6);

const FEATURES = [
  {
    title: 'Thoughtfully Sourced Materials',
    description:
      'Every product starts with the best raw materials — organic cotton, vegetable-tanned leather, and sustainably harvested wood. We partner directly with mills and tanneries to ensure quality from the source.',
    image: makePlaceholder('Materials', '#C8C1B6', '#4E473D'),
  },
  {
    title: 'Designed to Last',
    description:
      'We believe the most sustainable product is one you never have to replace. Our pieces are stress-tested and refined until they meet a standard of durability that makes fast fashion obsolete.',
    image: makePlaceholder('Durability', '#B3AC9F', '#413A31'),
  },
  {
    title: 'Small-Batch, Zero Waste',
    description:
      'We produce in small runs to minimize overstock and waste. Off-cuts are repurposed into accessories, and our packaging is 100% recyclable or compostable.',
    image: makePlaceholder('Zero Waste', '#A9A295', '#342F27'),
  },
];

// ─── Component ────────────────────────────────────────────

export function HomepageDemo({ basePath = '' }: { basePath?: string }) {
  const [email, setEmail] = useState('');
  // Below-the-fold sections reveal on scroll; the hero uses the CSS-only
  // entrance (data-motion="hero") so it plays at first paint.
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="ds-homepage__hero ds-section" aria-labelledby="home-hero-title">
        <div className="ds-homepage__hero-content" data-motion="hero">
          <Heading as="h1" size="4xl" id="home-hero-title">
            Everyday Essentials, Thoughtfully Made
          </Heading>
          <Text size="lg" muted>
            Sustainably crafted goods designed to stand the test of time. From canvas totes to ceramic mugs — fewer things, made better.
          </Text>
          <Button variant="primary" size="lg" asChild>
            <a href={`${basePath}/examples/collection`}>Shop the Collection</a>
          </Button>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────── */}
      {/* No aria-labelledby: the Carousel inside is already a region named
          "Featured products" — two landmarks with one name. */}
      <section className="ds-section">
        <div className="ds-homepage__section-header">
          <Heading as="h2" size="2xl" id="home-featured-title" data-motion="split">
            Featured Products
          </Heading>
          <Text size="sm" muted data-motion="reveal">
            Our most-loved pieces, curated for you.
          </Text>
        </div>

        <Carousel gap="md" label="Featured products" data-motion="reveal">
          {FEATURED.map((product) => (
            <CarouselSlide key={product.id} size="sm">
              <a
                href={`${basePath}/examples/product-detail`}
                className="ds-unstyled-link"
              >
                <ProductCard
                  fluid
                  name={product.name}
                  price={product.price}
                  image={product.image}
                />
              </a>
            </CarouselSlide>
          ))}
        </Carousel>
      </section>

      {/* ── Highlights ───────────────────────────────────── */}
      <section className="ds-section" aria-labelledby="home-why-title">
        <div className="ds-homepage__section-header">
          <Heading as="h2" size="2xl" id="home-why-title" data-motion="split">
            Why Mason
          </Heading>
          <Text size="sm" muted data-motion="reveal">
            Fewer things, made better — and made to last.
          </Text>
        </div>
        <Highlights data-motion="stagger">
          {FEATURES.map((feature) => (
            <Highlight
              key={feature.title}
              title={feature.title}
              description={feature.description}
              image={<img src={feature.image} alt="" className="ds-highlights__img" />}
            />
          ))}
        </Highlights>
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <section className="ds-homepage__newsletter" aria-labelledby="home-newsletter-title" data-motion="reveal">
        <div className="ds-homepage__newsletter-content">
          <Heading as="h2" size="xl" id="home-newsletter-title">
            Stay in the Loop
          </Heading>
          <Text size="sm" muted>
            New drops, restocks, and stories — delivered to your inbox. No spam, ever.
          </Text>
        </div>
        <form
          className="ds-homepage__newsletter-form"
          onSubmit={(e) => {
            e.preventDefault();
            setEmail('');
          }}
        >
          <div className="ds-homepage__newsletter-field">
            <Input
              type="email"
              aria-label="Email address"
              autoComplete="email"
              required
              placeholder="your@email.com"
              size="md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button variant="primary" size="md" type="submit">
            Subscribe
          </Button>
        </form>
      </section>
    </div>
  );
}
