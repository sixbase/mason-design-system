import { Button, Heart, Tooltip } from '@ds/components';
import { Preview } from './Preview';

export function TooltipDefault() {
  return (
    <Preview>
      <Tooltip content="Add to wishlist">
        <Button variant="secondary" iconOnly aria-label="Add to wishlist">
          <Heart size="sm" />
        </Button>
      </Tooltip>
    </Preview>
  );
}

export function TooltipSides() {
  return (
    <Preview>
      <Tooltip content="Tooltip on top" side="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>
      <Tooltip content="Tooltip on right" side="right">
        <Button variant="secondary">Right</Button>
      </Tooltip>
      <Tooltip content="Tooltip on bottom" side="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>
      <Tooltip content="Tooltip on left" side="left">
        <Button variant="secondary">Left</Button>
      </Tooltip>
    </Preview>
  );
}

export function TooltipLongContent() {
  return (
    <Preview>
      <Tooltip content="Free standard shipping applies to orders over $75 after discounts and before taxes. Excludes oversized items.">
        <Button variant="secondary">Shipping details</Button>
      </Tooltip>
    </Preview>
  );
}

export function TooltipInstant() {
  return (
    <Preview>
      <Tooltip content="No delay on this one" delayDuration={0}>
        <Button variant="secondary">Hover me</Button>
      </Tooltip>
    </Preview>
  );
}
