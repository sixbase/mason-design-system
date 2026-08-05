import { Badge } from '@ds/components';
import { Preview } from './Preview';

export function BadgeVariants() {
  return (
    <Preview>
      <Badge variant="default">New</Badge>
      <Badge variant="secondary">Sale</Badge>
      <Badge variant="success">In stock</Badge>
      <Badge variant="warning">Low stock</Badge>
      <Badge variant="destructive">Out of stock</Badge>
      <Badge variant="outline">Archive</Badge>
    </Preview>
  );
}

export function BadgeStatusDots() {
  return (
    <Preview>
      <Badge variant="success" dot>In stock</Badge>
      <Badge variant="warning" dot>Low stock</Badge>
      <Badge variant="destructive" dot>Out of stock</Badge>
      <Badge variant="outline" dot>Discontinued</Badge>
    </Preview>
  );
}

export function BadgeSizes() {
  return (
    <Preview>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
    </Preview>
  );
}

export function BadgeEcommerce() {
  return (
    <Preview>
      <Badge variant="default" size="sm">New arrival</Badge>
      <Badge variant="secondary" size="sm">20% off</Badge>
      <Badge variant="success" size="sm">Free shipping</Badge>
      <Badge variant="destructive" size="sm">Final sale</Badge>
      <Badge variant="warning" size="sm">2 left</Badge>
    </Preview>
  );
}
