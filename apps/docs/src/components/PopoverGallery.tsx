import {
  Button,
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@ds/components';
import { Preview } from './Preview';

export function PopoverDefault() {
  return (
    <Preview>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Size guide</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <Text size="sm">
            Measurements are in inches. Between sizes? Size up for a relaxed fit.
          </Text>
        </PopoverContent>
      </Popover>
    </Preview>
  );
}

export function PopoverWithClose() {
  return (
    <Preview>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Shipping info</Button>
        </PopoverTrigger>
        <PopoverContent showClose>
          <PopoverArrow />
          <div className="ds-gallery-popover-body">
            <Text size="sm">
              Free standard shipping on orders over $75. Express available at checkout.
            </Text>
          </div>
        </PopoverContent>
      </Popover>
    </Preview>
  );
}

export function PopoverComposedClose() {
  return (
    <Preview>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Confirm removal</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <div className="ds-gallery-stack">
            <Text size="sm">Remove this item from your cart?</Text>
            <div className="ds-gallery-row">
              <PopoverClose asChild>
                <Button size="sm" variant="secondary">Cancel</Button>
              </PopoverClose>
              <Button size="sm" variant="destructive">Remove</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Preview>
  );
}

export function PopoverSides() {
  return (
    <Preview>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="secondary">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side}>
            <PopoverArrow />
            <Text size="sm">Anchored to the {side} side.</Text>
          </PopoverContent>
        </Popover>
      ))}
    </Preview>
  );
}
