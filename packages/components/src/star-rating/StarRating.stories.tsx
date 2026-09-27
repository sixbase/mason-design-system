import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StarRating } from './StarRating';

const meta: Meta<typeof StarRating> = {
  title: 'Components/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Stars out of five with the number of reviews. It can also let a customer pick a rating.',
      },
    },
  },
  argTypes: {
    rating: { control: { type: 'number', min: 0, max: 5, step: 0.5 } },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: { rating: 4.5, reviewCount: 128 },
};

export const FullStars: Story = {
  args: { rating: 5, reviewCount: 42 },
};

export const HalfStar: Story = {
  args: { rating: 3.5, reviewCount: 17 },
};

export const WithoutCount: Story = {
  args: { rating: 4 },
};

export const WithLabel: Story = {
  args: { rating: 4.5, reviewCount: 128, label: 'Customer rating' },
};

function InteractiveDemo() {
  const [rating, setRating] = useState(0);
  return <StarRating rating={rating} onRate={setRating} label="Your rating" />;
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <StarRating rating={4.5} reviewCount={128} size="sm" />
      <StarRating rating={4.5} reviewCount={128} size="md" />
      <StarRating rating={4.5} reviewCount={128} size="lg" />
    </div>
  ),
};

export const NoReviews: Story = {
  args: { rating: 0, reviewCount: 0 },
};

export const SingleReview: Story = {
  args: { rating: 5, reviewCount: 1 },
};

/** `locale` groups the review count the local way: 1,284 in the US, 1.284 in Germany. */
export const GermanNumberFormat: Story = {
  name: 'Large count, German number format',
  args: { rating: 4.5, reviewCount: 1284, locale: 'de-DE' },
};

/**
 * Passing `onRate` turns the rating into a radiogroup: click or use arrow
 * keys to select 1–5 stars. Hover previews the fill; 44px hit areas apply
 * on touch devices.
 */
export const Interactive: Story = {
  name: 'Try it: pick a rating',
  render: () => <InteractiveDemo />,
};
