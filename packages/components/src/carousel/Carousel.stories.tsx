import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { Carousel, CarouselSlide } from './Carousel';

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
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

/* ─── Placeholder product imagery ──────────────────────────────── */

const placeholder = (label: string, bg: string, fg: string) =>
  `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23${bg}"/><text x="200" y="250" text-anchor="middle" fill="%23${fg}" font-size="20">${encodeURIComponent(label)}</text></svg>`;

const products = [
  { name: 'No. 8 Cast Iron Skillet', price: '$48.00', src: placeholder('Skillet', 'E3DED6', '847D73') },
  { name: 'Walnut End-Grain Cutting Board', price: '$86.00', src: placeholder('Cutting board', 'C8C2B8', '675F56') },
  { name: 'Enameled Dutch Oven, 5.5 qt', price: '$120.00', src: placeholder('Dutch oven', 'A59E94', '342F2A') },
  { name: 'Forged Carbon Steel Chef Knife', price: '$95.00', src: placeholder('Chef knife', '847D73', 'FAF9F7') },
  { name: 'Brass Cabinet Pull, Satin', price: '$14.00', src: placeholder('Cabinet pull', 'E3DED6', '675F56') },
  { name: 'Copper Measuring Cups, Set of 4', price: '$52.00', src: placeholder('Measuring cups', 'C8C2B8', '342F2A') },
];

const ProductSlideContent = ({ name, price, src }: (typeof products)[number]) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
    <img src={src} alt={name} style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
    <Text size="sm">{name}</Text>
    <Text size="sm" muted>{price}</Text>
  </div>
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
    <Carousel gap="sm" aria-label="Kitchen essentials">
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
    <Carousel gap="lg" aria-label="Workshop picks">
      {products.map((product) => (
        <CarouselSlide key={product.name}>
          <ProductSlideContent {...product} />
        </CarouselSlide>
      ))}
    </Carousel>
  ),
};
