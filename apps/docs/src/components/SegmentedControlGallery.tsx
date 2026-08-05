import { useState } from 'react';
import { Icon, SegmentedControl, SegmentedControlItem, Text } from '@ds/components';
import { Preview } from './Preview';

function GridGlyph() {
  return (
    <Icon size="sm">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Icon>
  );
}

function ListGlyph() {
  return (
    <Icon size="sm">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </Icon>
  );
}

export function SegmentedControlDefault() {
  return (
    <Preview>
      <SegmentedControl aria-label="View" defaultValue="grid">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>
    </Preview>
  );
}

export function SegmentedControlThreeSegments() {
  return (
    <Preview>
      <SegmentedControl aria-label="Sort by" defaultValue="newest">
        <SegmentedControlItem value="newest">Newest</SegmentedControlItem>
        <SegmentedControlItem value="price">Price</SegmentedControlItem>
        <SegmentedControlItem value="rating">Rating</SegmentedControlItem>
      </SegmentedControl>
    </Preview>
  );
}

export function SegmentedControlIcons() {
  return (
    <Preview>
      <SegmentedControl aria-label="View" defaultValue="grid">
        <SegmentedControlItem value="grid" aria-label="Grid view">
          <GridGlyph />
        </SegmentedControlItem>
        <SegmentedControlItem value="list" aria-label="List view">
          <ListGlyph />
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="View" defaultValue="grid">
        <SegmentedControlItem value="grid">
          <GridGlyph />
          Grid
        </SegmentedControlItem>
        <SegmentedControlItem value="list">
          <ListGlyph />
          List
        </SegmentedControlItem>
      </SegmentedControl>
    </Preview>
  );
}

export function SegmentedControlSizes() {
  return (
    <Preview>
      <SegmentedControl aria-label="View" defaultValue="grid" size="md">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="View" defaultValue="grid" size="sm">
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
      </SegmentedControl>
    </Preview>
  );
}

export function SegmentedControlDisabled() {
  return (
    <Preview>
      <SegmentedControl aria-label="Availability" defaultValue="all">
        <SegmentedControlItem value="all">All</SegmentedControlItem>
        <SegmentedControlItem value="in-stock">In stock</SegmentedControlItem>
        <SegmentedControlItem value="preorder" disabled>Preorder</SegmentedControlItem>
      </SegmentedControl>
    </Preview>
  );
}

export function SegmentedControlControlled() {
  const [view, setView] = useState('grid');

  return (
    <Preview stack>
      <SegmentedControl aria-label="View" value={view} onValueChange={setView}>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="map">Map</SegmentedControlItem>
      </SegmentedControl>
      <Text size="sm" muted>Selected view: {view}</Text>
    </Preview>
  );
}
