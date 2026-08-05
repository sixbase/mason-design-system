import { useState } from 'react';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Badge, Breadcrumb, Button, Caption,
  Carousel, CarouselSlide, ColorPicker, CookieConsent,
  FeatureBlock, Heading, ImageGallery,
  PriceDisplay, QuantitySelector, Select, SelectItem,
  StarRating, StockIndicator, Text,
} from '@ds/components';
import type { ColorOption } from '@ds/components';
import { makePlaceholder } from '../lib/placeholder';
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

  const breadcrumbItems = [
    { label: 'Home', href: `${basePath}/` },
    { label: 'Accessories', href: '#' },
    { label: 'Phone Cases', href: '#' },
    { label: 'Carbon Fiber iPhone Case' },
  ];

  return (
    <>
      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <Breadcrumb items={breadcrumbItems} maxItems={3} />

      {/* ── Product: gallery + details ─────────────────────── */}
      <div className="ds-pdp ds-layout ds-layout--golden ds-section">
        <div className="ds-pdp__gallery">
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
            <Button fullWidth size="lg">Add to Bag</Button>
            <StockIndicator />
            <div className="ds-pdp__trust-signals">
              <Caption>Free shipping over $50</Caption>
              <Caption aria-hidden="true">·</Caption>
              <Caption>30-day returns</Caption>
            </div>
          </div>

          {/* ── Accordion ── */}
          <div className="ds-pdp__accordion-section">
            <Accordion type="multiple" size="sm">
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
          <Heading as="h2">In the Wild</Heading>
          <Text muted>See it in action</Text>
        </div>
        <Carousel label="Lifestyle photos">
          {lifestyleImages.map((img) => (
            <CarouselSlide key={img.alt}>
              <img src={img.src} alt={img.alt} className="ds-pdp__lifestyle-img" />
            </CarouselSlide>
          ))}
        </Carousel>
      </section>

      {/* ── Feature blocks ── */}
      <div className="ds-section">
        <FeatureBlock
          title="Engineered for Everyday Protection"
          description="Woven from 600D aramid fiber — the same material used in aerospace and body armor — this case delivers military-grade impact resistance at just 0.65mm thin. The precision-cut design wraps your device without adding bulk, while the raised camera lip keeps your lenses safe on any surface."
          image={<img src={makePlaceholder('Engineered Protection', '#C8C1B6', '#4E473D')} alt="Aramid fiber weave close-up" className="ds-demo-cover-image" />}
        />
      </div>

      <div className="ds-section">
        <FeatureBlock
          reverse
          title="Seamless MagSafe Integration"
          description="Precision-aligned magnets ensure a perfect snap every time. Charge wirelessly, attach your favorite accessories, and never worry about compatibility. The ultra-thin profile means zero interference with MagSafe's full magnetic strength."
          image={<img src={makePlaceholder('MagSafe Ready', '#B3AC9F', '#413A31')} alt="MagSafe alignment magnets" className="ds-demo-cover-image" />}
        />
      </div>

      <div className="ds-section">
        <FeatureBlock
          title="12 Grams of Confidence"
          description="At just 12 grams, you'll forget it's there — until you need it. The minimal footprint preserves the feel of your device while adding a layer of protection that stands up to everyday drops, scratches, and pocket wear."
          image={<img src={makePlaceholder('Featherlight', '#A9A295', '#342F27')} alt="Case on precision scale" className="ds-demo-cover-image" />}
        />
      </div>

      <CookieConsent
        categories={[
          { id: 'essential', label: 'Strictly Necessary Cookies', description: "These keep the site running — things like staying logged in, keeping your cart, and processing secure payments. They can't be turned off.", required: true, defaultChecked: true, learnMoreHref: '#' },
          { id: 'functional', label: 'Functional Cookies', description: "These remember your preferences — like your language, region, or how you've customized the site. Some are set by us, others by third-party services we use to enhance your experience. If you turn these off, some of those features may not work as expected.", defaultChecked: true, learnMoreHref: '#' },
          { id: 'performance', label: 'Performance Cookies', description: "These help us understand how the site is performing and how people are using it — things like which pages get the most visits, where traffic is coming from, and where things could be smoother. This data helps us improve the experience. None of it is tied to you personally.", defaultChecked: true, learnMoreHref: '#' },
          { id: 'targeting', label: 'Targeting Cookies', description: "These may be placed by our advertising partners to build a profile of your interests based on your browsing activity. They're used to show you more relevant ads on other sites. They don't store personal information directly, but work by identifying your browser and device. If you turn these off, you'll see less targeted advertising.", learnMoreHref: '#' },
        ]}
        onAccept={(ids) => console.log('Accepted:', ids)}
        onReject={() => console.log('Rejected all')}
      />
    </>
  );
}
