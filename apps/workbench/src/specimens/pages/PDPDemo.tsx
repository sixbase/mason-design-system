import { useRef, useState } from 'react';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  AddToCartButton, Badge, Breadcrumb, Caption,
  Carousel, CarouselSlide, ColorPicker,
  FeatureBlock, Heading, ImageGallery,
  PriceDisplay, QuantitySelector, Select, SelectItem,
  StarRating, StockIndicator, Text,
} from '@ds/components';
import type { AddToCartStatus, ColorOption } from '@ds/components';
import { flyToCart, useReveal } from '@ds/motion/react';
import { makePlaceholder } from '../data/placeholder';
import { addToCartCount } from '../data/cart-count';
import './PDPDemo.css';

const portrait = { width: 800, height: 1000, fontSize: 32 };

const galleryImages = [
  { src: makePlaceholder('Front', '#E3DED6', '#675F56', portrait), alt: 'Aramid Fiber Case — Front' },
  { src: makePlaceholder('Back', '#C8C2B8', '#4E473F', portrait), alt: 'Aramid Fiber Case — Back' },
  { src: makePlaceholder('Side', '#A59E94', '#342F2A', portrait), alt: 'Aramid Fiber Case — Side' },
  { src: makePlaceholder('Detail', '#847D73', '#FAF9F7', portrait), alt: 'Aramid Fiber Case — Detail' },
];

const lifestyleImages = [
  { src: makePlaceholder('Lifestyle 1', '#D6D0C7', '#6B6359'), alt: 'Lifestyle — desk setup' },
  { src: makePlaceholder('Lifestyle 2', '#C8C1B6', '#5A5248'), alt: 'Lifestyle — in hand' },
  { src: makePlaceholder('Lifestyle 3', '#BEB7AC', '#4E473D'), alt: 'Lifestyle — pocket' },
  { src: makePlaceholder('Lifestyle 4', '#B3AC9F', '#413A31'), alt: 'Lifestyle — outdoor' },
  { src: makePlaceholder('Lifestyle 5', '#A9A295', '#342F27'), alt: 'Lifestyle — travel' },
];

const colorOptions: ColorOption[] = [
  { value: 'carbon-black', color: '#342F2A', label: 'Carbon Black' },
  { value: 'stone-gray', color: '#C8C2B8', label: 'Stone Gray' },
  { value: 'dark-olive', color: '#4E473F', label: 'Dark Olive' },
];

const SIZE_OPTIONS = [
  { value: 'iphone-17-pro-max', label: 'iPhone 17 Pro Max' },
  { value: 'iphone-17-pro', label: 'iPhone 17 Pro' },
  { value: 'iphone-17', label: 'iPhone 17' },
  { value: 'iphone-air', label: 'iPhone Air' },
  { value: 'iphone-16-pro-max', label: 'iPhone 16 Pro Max' },
  { value: 'iphone-16-pro', label: 'iPhone 16 Pro' },
  { value: 'iphone-16', label: 'iPhone 16' },
];

export function PDPDemo({ basePath = '' }: { basePath?: string }) {
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState('carbon-black');
  const [size, setSize] = useState('iphone-17-pro-max');
  const [cartStatus, setCartStatus] = useState<AddToCartStatus>('idle');
  const galleryRef = useRef<HTMLDivElement>(null);
  const revealRef = useReveal<HTMLDivElement>();

  // Simulated add-to-cart round trip. The flight starts only once the
  // "request" succeeds — motion confirms what happened, never predicts it.
  const addToBag = () => {
    if (cartStatus !== 'idle') return;
    setCartStatus('loading');
    window.setTimeout(() => {
      setCartStatus('success');
      addToCartCount(qty);
      void flyToCart(galleryRef.current);
      window.setTimeout(() => setCartStatus('idle'), 1600);
    }, 420);
  };

  const breadcrumbItems = [
    { label: 'Home', href: `${basePath}/` },
    { label: 'Accessories', href: '#' },
    { label: 'Phone Cases', href: '#' },
    { label: 'Carbon Fiber iPhone Case' },
  ];

  return (
    <div ref={revealRef}>
      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbItems} maxItems={3} />

      {/* ── Product: gallery + details ─────────────────────── */}
      <div className="ds-pdp ds-layout ds-layout--golden ds-section">
        <div className="ds-pdp__gallery" ref={galleryRef}>
          <ImageGallery
            images={galleryImages}
            aspectRatio="4/5"
            thumbnailPosition="left"
          />
        </div>

        <div className="ds-pdp__details ds-layout__sticky">
          {/* ── Header: title, price, rating ── */}
          <div className="ds-pdp__header">
            <Heading as="h1" size="2xl" weight="normal" className="ds-pdp__title">
              Carbon Fiber iPhone Case
            </Heading>
            <div className="ds-pdp__price-row">
              <PriceDisplay price="$68.00" comparePrice="$85.00" />
              <Badge variant="destructive" size="sm">Save 20%</Badge>
            </div>
            <StarRating rating={4.5} reviewCount={128} size="sm" />
          </div>

          {/* ── Description ── */}
          <Text size="sm" muted>
            Ultra-thin aramid fiber case with a precision-cut design.
            Weighs just 12g while providing military-grade protection.
            Compatible with MagSafe wireless charging.
          </Text>

          {/* ── Options ── */}
          <div className="ds-pdp__options-group">
            <div className="ds-pdp__option">
              <Text as="label" size="sm" weight="medium">Size</Text>
              <Select
                size="lg"
                value={size}
                onValueChange={setSize}
                placeholder="Select device"
                aria-label="Size"
              >
                {SIZE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="ds-pdp__option">
              <Text as="label" size="sm" weight="medium">Color</Text>
              <ColorPicker options={colorOptions} value={color} onChange={setColor} aria-label="Case color" />
            </div>

            <div className="ds-pdp__option">
              <Text as="label" size="sm" weight="medium">Quantity</Text>
              <QuantitySelector value={qty} onChange={setQty} min={1} max={10} />
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="ds-pdp__actions">
            <AddToCartButton fullWidth size="lg" status={cartStatus} onClick={addToBag} />
            <StockIndicator />
            <div className="ds-pdp__trust-signals">
              <Caption>Free shipping over $50</Caption>
              <Caption aria-hidden="true">·</Caption>
              <Caption>30-day returns</Caption>
            </div>
          </div>

          {/* ── Accordion ── */}
          <div className="ds-pdp__accordion-section">
            <Accordion type="multiple" size="sm" headingLevel={2}>
              <AccordionItem value="details">
                <AccordionTrigger>Details</AccordionTrigger>
                <AccordionContent>
                  <ul className="ds-pdp__accordion-list">
                    <li><Text as="span" size="sm" muted>600D aramid fiber construction</Text></li>
                    <li><Text as="span" size="sm" muted>Weight: 12g</Text></li>
                    <li><Text as="span" size="sm" muted>Thickness: 0.65mm</Text></li>
                    <li><Text as="span" size="sm" muted>MagSafe compatible</Text></li>
                    <li><Text as="span" size="sm" muted>Raised camera lip for lens protection</Text></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping & Delivery</AccordionTrigger>
                <AccordionContent>
                  <ul className="ds-pdp__accordion-list">
                    <li><Text as="span" size="sm" muted>Free standard shipping on orders over $50</Text></li>
                    <li><Text as="span" size="sm" muted>Express delivery: 1–2 business days</Text></li>
                    <li><Text as="span" size="sm" muted>Standard delivery: 3–5 business days</Text></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger>Returns & Warranty</AccordionTrigger>
                <AccordionContent>
                  <ul className="ds-pdp__accordion-list">
                    <li><Text as="span" size="sm" muted>30-day free returns</Text></li>
                    <li><Text as="span" size="sm" muted>1-year manufacturer warranty</Text></li>
                    <li><Text as="span" size="sm" muted>Items must be unused and in original packaging</Text></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* ── Lifestyle ── */}
      <section className="ds-section">
        <div className="ds-pdp__section-header">
          <Heading as="h2" data-motion="split">In the Wild</Heading>
          <Text muted data-motion="reveal">See it in action</Text>
        </div>
        <Carousel label="Lifestyle photos" data-motion="reveal">
          {lifestyleImages.map((img) => (
            <CarouselSlide key={img.alt}>
              <img src={img.src} alt={img.alt} className="ds-pdp__lifestyle-img" />
            </CarouselSlide>
          ))}
        </Carousel>
      </section>

      {/* ── Feature blocks ── */}
      <div className="ds-section" data-motion="reveal">
        <FeatureBlock
          title="Engineered for Everyday Protection"
          description="Woven from 600D aramid fiber — the same material used in aerospace and body armor — this case delivers military-grade impact resistance at just 0.65mm thin. The precision-cut design wraps your device without adding bulk, while the raised camera lip keeps your lenses safe on any surface."
          image={<img src={makePlaceholder('Engineered Protection', '#C8C1B6', '#4E473D')} alt="Aramid fiber weave close-up" className="ds-demo-cover-image" data-motion="parallax" />}
        />
      </div>

      <div className="ds-section" data-motion="reveal">
        <FeatureBlock
          reverse
          title="Seamless MagSafe Integration"
          description="Precision-aligned magnets ensure a perfect snap every time. Charge wirelessly, attach your favorite accessories, and never worry about compatibility. The ultra-thin profile means zero interference with MagSafe's full magnetic strength."
          image={<img src={makePlaceholder('MagSafe Ready', '#B3AC9F', '#413A31')} alt="MagSafe alignment magnets" className="ds-demo-cover-image" data-motion="parallax" />}
        />
      </div>

      <div className="ds-section" data-motion="reveal">
        <FeatureBlock
          title="12 Grams of Confidence"
          description="At just 12 grams, you'll forget it's there — until you need it. The minimal footprint preserves the feel of your device while adding a layer of protection that stands up to everyday drops, scratches, and pocket wear."
          image={<img src={makePlaceholder('Featherlight', '#A9A295', '#342F27')} alt="Case on precision scale" className="ds-demo-cover-image" data-motion="parallax" />}
        />
      </div>
    </div>
  );
}
