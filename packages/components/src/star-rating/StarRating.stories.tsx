import type { Meta, StoryObj } from '@storybook/react';
import { StarRating } from './StarRating';

const meta: Meta<typeof StarRating> = {
  title: 'Components/StarRating',
  component: StarRating,
  tags: ['autodocs'],
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

export const NoReviews: Story = {
  args: { rating: 0, reviewCount: 0 },
};

export const WithoutCount: Story = {
  args: { rating: 4 },
};

export const SingleReview: Story = {
  args: { rating: 5, reviewCount: 1 },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <StarRating rating={4.5} reviewCount={128} size="sm" />
      <StarRating rating={4.5} reviewCount={128} size="md" />
      <StarRating rating={4.5} reviewCount={128} size="lg" />
    </div>
  ),
};
