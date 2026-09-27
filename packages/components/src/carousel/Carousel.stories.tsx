import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from '../product-card/ProductCard';
import { PRODUCTS } from '../story-fixtures';
import { Carousel, CarouselSlide } from './Carousel';

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component:
          'A row of items you swipe or scroll sideways through — product rows on the home page.',
      },
    },
  },
  argTypes: {
    gap: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    controls: { control: 'boolean' },
    indicators: { control: 'boolean' },
    loop: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>;

/* ─── Sample products (the shared story catalogue) ─────────────── */
const products = Object.values(PRODUCTS).slice(0, 6);

/* Slides compose the real ProductCard (fluid, so the slide owns the width)
   rather than a hand-rolled image + name + price, so the carousel demos show
   the same corners, insets and price typography as the store. */
const ProductSlideContent = ({ name, price, image, imageAlt }: (typeof products)[number]) => (
  <ProductCard fluid name={name} price={price} image={image} imageAlt={imageAlt} />
);

/* ─── Stories ──────────────────────────────────────────────────── */

export const Default: Story = {
  render: (args) => (
    <Carousel {...args} label="Featured products">
      {products.map((product) => (
        <CarouselSlide key={product.name}>
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};

export const WithControls: Story = {
  name: 'With arrows',
  render: () => (
    <Carousel controls label="Featured products">
      {products.map((product) => (
        <CarouselSlide key={product.name}>
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};

export const WithIndicators: Story = {
  name: 'With dots',
  render: () => (
    <Carousel indicators label="Featured products">
      {products.map((product) => (
        <CarouselSlide key={product.name}>
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};

export const ControlsAndIndicatorsLooping: Story = {
  name: 'Arrows and dots, wrapping round at the end',
  render: () => (
    <Carousel controls indicators loop label="Featured products">
      {products.map((product) => (
        <CarouselSlide key={product.name}>
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};

export const SmallSlides: Story = {
  render: () => (
    <Carousel aria-label="New arrivals">
      {products.map((product) => (
        <CarouselSlide key={product.name} size="sm">
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};

export const LargeSlides: Story = {
  render: () => (
    <Carousel aria-label="Bestsellers">
      {products.slice(0, 4).map((product) => (
        <CarouselSlide key={product.name} size="lg">
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};

export const SmallGap: Story = {
  render: () => (
    <Carousel gap="sm" aria-label="Everyday essentials">
      {products.map((product) => (
        <CarouselSlide key={product.name}>
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};

export const LargeGap: Story = {
  render: () => (
    <Carousel gap="lg" aria-label="Staff picks">
      {products.map((product) => (
        <CarouselSlide key={product.name}>
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};
