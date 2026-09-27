import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          'Buttons that switch between panels of related content — Description, Reviews, Specifications.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="description">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
      </TabsList>
      <TabsContent value="description">
        Crafted from sustainably sourced clay and finished with a matte glaze, each piece
        is shaped by hand for quiet, organic character. No two are exactly alike.
      </TabsContent>
      <TabsContent value="reviews">
        Customers love the tactile quality and understated beauty of this piece.
        Average rating: 4.8 out of 5 stars from 127 reviews.
      </TabsContent>
      <TabsContent value="specs">
        Material: Stoneware clay. Dimensions: 14cm × 14cm × 8cm.
        Weight: 320g. Dishwasher safe. Microwave safe.
      </TabsContent>
    </Tabs>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <Tabs defaultValue="description">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="reviews" badge={127}>Reviews</TabsTrigger>
        <TabsTrigger value="questions" badge={4}>Questions</TabsTrigger>
      </TabsList>
      <TabsContent value="description">
        A minimal stoneware bowl with a matte finish.
      </TabsContent>
      <TabsContent value="reviews">
        127 reviews — 4.8 average. Customers highlight the weight and texture.
      </TabsContent>
      <TabsContent value="questions">
        4 answered questions about care, sizing, and shipping.
      </TabsContent>
    </Tabs>
  ),
};

/** Opened on a chosen tab by the page — e.g. a “Read reviews” link jumps straight to Reviews. */
export const Controlled: Story = {
  name: 'Opened on Reviews by the page',
  render: function ControlledStory() {
    const [value, setValue] = useState('reviews');
    return (
      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          A minimal stoneware bowl with a matte finish.
        </TabsContent>
        <TabsContent value="reviews">
          127 reviews — 4.8 average. Customers highlight the weight and texture.
        </TabsContent>
        <TabsContent value="specs">
          Stoneware, 14cm diameter, 320g, dishwasher and microwave safe.
        </TabsContent>
      </Tabs>
    );
  },
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="description">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="reviews" disabled>Reviews (Coming Soon)</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
      </TabsList>
      <TabsContent value="description">
        Hand-thrown stoneware with a speckled matte glaze. Holds 350 ml.
      </TabsContent>
      <TabsContent value="reviews">
        Reviews open once the first orders arrive.
      </TabsContent>
      <TabsContent value="specs">
        Stoneware, 350 ml, dishwasher and microwave safe.
      </TabsContent>
    </Tabs>
  ),
};

/** More tabs than fit: the row scrolls sideways and keeps the chosen tab in view. */
export const ManyTabs: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--size-modal-sm)' }}>
      <Tabs defaultValue="tab-1">
        <TabsList>
          <TabsTrigger value="tab-1">Description</TabsTrigger>
          <TabsTrigger value="tab-2">Reviews</TabsTrigger>
          <TabsTrigger value="tab-3">Specifications</TabsTrigger>
          <TabsTrigger value="tab-4">Shipping</TabsTrigger>
          <TabsTrigger value="tab-5">Returns</TabsTrigger>
          <TabsTrigger value="tab-6">Warranty</TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1">Hand-thrown stoneware with a speckled matte glaze.</TabsContent>
        <TabsContent value="tab-2">4.8 out of 5 from 127 reviews.</TabsContent>
        <TabsContent value="tab-3">Stoneware, 350 ml, dishwasher and microwave safe.</TabsContent>
        <TabsContent value="tab-4">Free standard shipping on orders over $50.</TabsContent>
        <TabsContent value="tab-5">Free returns within 30 days of delivery.</TabsContent>
        <TabsContent value="tab-6">Chips and cracks from normal use are covered for a year.</TabsContent>
      </Tabs>
    </div>
  ),
};

export const SingleTab: Story = {
  render: () => (
    <Tabs defaultValue="only">
      <TabsList>
        <TabsTrigger value="only">Product Details</TabsTrigger>
      </TabsList>
      <TabsContent value="only">
        Hand-thrown stoneware with a speckled matte glaze. Holds 350 ml.
      </TabsContent>
    </Tabs>
  ),
};
