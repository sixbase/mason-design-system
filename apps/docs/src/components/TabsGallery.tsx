import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ds/components';
import { Preview } from './Preview';

export function TabsDefault() {
  return (
    <Preview>
      <div style={{ width: '100%' }}>
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
      </div>
    </Preview>
  );
}

export function TabsControlled() {
  const [value, setValue] = useState('reviews');
  return (
    <Preview>
      <div style={{ width: '100%' }}>
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
      </div>
    </Preview>
  );
}

export function TabsDisabled() {
  return (
    <Preview>
      <div style={{ width: '100%' }}>
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews" disabled>Reviews (Coming Soon)</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            This product description is available to read.
          </TabsContent>
          <TabsContent value="reviews">
            Reviews are not yet available for this product.
          </TabsContent>
          <TabsContent value="specs">
            Technical specifications for this product.
          </TabsContent>
        </Tabs>
      </div>
    </Preview>
  );
}

export function TabsWithBadges() {
  return (
    <Preview>
      <div style={{ width: '100%' }}>
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
      </div>
    </Preview>
  );
}

export function TabsOverflow() {
  return (
    <Preview>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Tabs defaultValue="tab-1">
          <TabsList>
            <TabsTrigger value="tab-1">Description</TabsTrigger>
            <TabsTrigger value="tab-2">Reviews</TabsTrigger>
            <TabsTrigger value="tab-3">Specifications</TabsTrigger>
            <TabsTrigger value="tab-4">Shipping</TabsTrigger>
            <TabsTrigger value="tab-5">Returns</TabsTrigger>
            <TabsTrigger value="tab-6">Warranty</TabsTrigger>
          </TabsList>
          <TabsContent value="tab-1">Description content with horizontal scroll on overflow.</TabsContent>
          <TabsContent value="tab-2">Reviews content.</TabsContent>
          <TabsContent value="tab-3">Specifications content.</TabsContent>
          <TabsContent value="tab-4">Shipping information.</TabsContent>
          <TabsContent value="tab-5">Returns policy.</TabsContent>
          <TabsContent value="tab-6">Warranty details.</TabsContent>
        </Tabs>
      </div>
    </Preview>
  );
}
