import { useState } from 'react';
import { Check, Tag } from '@ds/components';
import { Preview } from './Preview';

export function TagVariants() {
  return (
    <Preview>
      <Tag variant="default">Blue</Tag>
      <Tag variant="outline">Size: M</Tag>
    </Preview>
  );
}

export function TagSizes() {
  return (
    <Preview>
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
    </Preview>
  );
}

export function TagWithIcon() {
  return (
    <Preview>
      <Tag icon={<Check />}>In stock</Tag>
      <Tag variant="outline" icon={<Check />}>Free shipping</Tag>
    </Preview>
  );
}

export function TagActiveFilters() {
  const [filters, setFilters] = useState(['Blue', 'Size: M', 'Under $50', 'In stock']);
  return (
    <Preview>
      {filters.map((filter) => (
        <Tag
          key={filter}
          onDismiss={() => setFilters((prev) => prev.filter((f) => f !== filter))}
        >
          {filter}
        </Tag>
      ))}
    </Preview>
  );
}
