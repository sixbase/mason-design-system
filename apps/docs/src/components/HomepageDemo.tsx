import { useState } from 'react';
import {
  Button, Carousel, CarouselSlide,
  Heading, Input, ProductCard, Text,
} from '@ds/components';
import { PRODUCTS } from '../data/products';
import { makePlaceholder } from '../lib/placeholder';
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

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="ds-homepage__hero ds-section">
        <div className="ds-homepage__hero-content">
          <Heading level={1} size="4xl">
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
      <section className="ds-section">
        <div className="ds-homepage__section-header">
          <Heading level={2} size="2xl">
            Featured Products
          </Heading>
          <Text size="sm" muted>
            Our most-loved pieces, curated for you.
          </Text>
        </div>

        <Carousel gap="md">
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
      <section className="ds-section">
        <div className="ds-homepage__highlights">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="ds-homepage__highlight">
              <div className="ds-homepage__highlight-media">
                <img
                  src={feature.image}
                  alt=""
                  className="ds-homepage__highlight-img"
                />
              </div>
              <p className="ds-homepage__highlight-text">
                <span className="ds-homepage__highlight-title">{feature.title}</span>{' '}
                <span className="ds-homepage__highlight-desc">{feature.description}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <section className="ds-homepage__newsletter">
        <div className="ds-homepage__newsletter-content">
          <Heading level={3} size="xl">
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
          <Input
            type="email"
            placeholder="your@email.com"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="primary" size="md" type="submit">
            Subscribe
          </Button>
        </form>
      </section>
    </div>
  );
}
