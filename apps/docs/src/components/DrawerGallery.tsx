import { useState } from 'react';
import { Button, Drawer, Text, Heading } from '@ds/components';

export function DrawerDefault() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ds-gallery-row">
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer open={open} onOpenChange={setOpen} title="Default drawer">
        <div className="ds-gallery-stack">
          <Heading level={3} size="md">Drawer content</Heading>
          <Text>
            A generic slide-out panel. Use it as the base for cart drawers,
            mobile navigation menus, and filter sidebars.
          </Text>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </Drawer>
    </div>
  );
}

export function DrawerLeftSide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ds-gallery-row">
      <Button onClick={() => setOpen(true)}>Open left drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        side="left"
        title="Navigation menu"
      >
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {['Home', 'Shop', 'Collections', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <Button variant="ghost" fullWidth>{item}</Button>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>
    </div>
  );
}

export function DrawerCustomWidth() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ds-gallery-row">
      <Button onClick={() => setOpen(true)}>Open narrow drawer (360px)</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        width="360px"
        title="Shopping cart"
      >
        <div className="ds-gallery-stack">
          <Heading level={3} size="md">Your cart</Heading>
          <Text muted>Your cart is empty. Start shopping to add items.</Text>
          <Button onClick={() => setOpen(false)}>Continue shopping</Button>
        </div>
      </Drawer>
    </div>
  );
}

export function DrawerBottomSheet() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ds-gallery-row">
      <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        side="bottom"
        title="Filter and sort"
        description="Refine the product list by category and price"
      >
        <div className="ds-gallery-stack">
          <Heading level={3} size="md">Sort by</Heading>
          {['Newest', 'Price: low to high', 'Price: high to low', 'Best selling'].map(
            (option) => (
              <Button key={option} variant="ghost" fullWidth>
                {option}
              </Button>
            ),
          )}
          <Button fullWidth onClick={() => setOpen(false)}>
            Apply
          </Button>
        </div>
      </Drawer>
    </div>
  );
}

export function DrawerSizes() {
  const [openSize, setOpenSize] = useState<'sm' | 'md' | 'lg' | null>(null);
  return (
    <div className="ds-gallery-row">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Button key={size} variant="secondary" onClick={() => setOpenSize(size)}>
          Open {size}
        </Button>
      ))}
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Drawer
          key={size}
          open={openSize === size}
          onOpenChange={(open) => setOpenSize(open ? size : null)}
          size={size}
          title={`${size} drawer`}
        >
          <div className="ds-gallery-stack">
            <Heading level={3} size="md">Size preset: {size}</Heading>
            <Text>
              This drawer uses the <code>{size}</code> width preset, which maps
              to <code>--size-modal-{size}</code>.
            </Text>
          </div>
        </Drawer>
      ))}
    </div>
  );
}

export function DrawerScrollable() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ds-gallery-row">
      <Button onClick={() => setOpen(true)}>Open with long content</Button>
      <Drawer open={open} onOpenChange={setOpen} title="Filter products">
        <div className="ds-gallery-stack">
          <Heading level={3} size="md">Filters</Heading>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--spacing-3)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Text>Filter option {i + 1}</Text>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
