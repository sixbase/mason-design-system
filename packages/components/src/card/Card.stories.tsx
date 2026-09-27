import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { PRODUCTS } from '../story-fixtures';
import { Text } from '../typography/Typography';
import { Card, CardBody, CardFooter, CardImage } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'A plain panel that groups related content, with an optional picture and footer.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'ghost'] },
    interactive: { control: 'boolean' },
    noPadding: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

/** One card column: fills a phone, stops at a comfortable width on desktop. */
const column = { width: '100%', maxWidth: 'var(--size-modal-sm)' };

export const Elevated: Story = {
  render: () => (
    <Card style={column}>
      <CardBody>
        <Text weight="semibold">Free returns for 30 days</Text>
        <Text muted size="sm">Send anything back within 30 days of delivery — we cover the postage.</Text>
      </CardBody>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" style={column}>
      <CardBody>
        <Text weight="semibold">Order #1042</Text>
        <Text muted size="sm">Placed March 10 · 3 items · Shipped</Text>
      </CardBody>
    </Card>
  ),
};

export const Ghost: Story = {
  render: () => (
    <Card variant="ghost" style={column}>
      <CardBody>
        <Text weight="semibold">Gift wrapping</Text>
        <Text muted size="sm">Recycled kraft paper and cotton twine, $5 per order.</Text>
      </CardBody>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
      {([
        ['elevated', 'Elevated', 'Soft shadow'],
        ['outlined', 'Outlined', 'Thin border'],
        ['ghost', 'Ghost', 'Tinted, no edge'],
      ] as const).map(([variant, name, note]) => (
        <Card key={variant} variant={variant} style={{ width: 'var(--spacing-phi-89)' }}>
          <CardBody>
            <Text weight="semibold" size="sm">{name}</Text>
            <Text muted size="sm">{note}</Text>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};

/** `interactive` adds hover and keyboard-focus styles for a card that is one big link. */
export const ProductCard: Story = {
  name: 'Clickable, with picture and footer',
  render: () => (
    // No noPadding here: CardImage is already full-bleed, and noPadding
    // would also strip the body/footer padding (text flush to the edge).
    <Card interactive style={{ ...column, maxWidth: 'calc(var(--spacing-phi-55) * 2)' }}>
      <CardImage src={PRODUCTS.tote.image} alt={PRODUCTS.tote.imageAlt} aspectRatio="4/5" />
      <CardBody>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-2)' }}>
          <Text weight="semibold" size="sm">{PRODUCTS.tote.name}</Text>
          <Badge variant="default" size="sm">New</Badge>
        </div>
        <Text muted size="sm">Organic canvas, leather handles</Text>
        <Text weight="semibold">$48.00</Text>
      </CardBody>
      <CardFooter>
        <Button fullWidth size="sm">Add to bag</Button>
      </CardFooter>
    </Card>
  ),
};

/** Every `CardImage` `aspectRatio` preset; omitting it falls back to 4/3. */
export const ImageAspectRatios: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {(['1/1', '4/5', '4/3', '3/2', '16/9'] as const).map((ratio) => (
        <Card key={ratio} variant="outlined" style={{ width: 'var(--spacing-phi-89)' }}>
          <CardImage src={PRODUCTS.mug.image} alt={PRODUCTS.mug.imageAlt} aspectRatio={ratio} />
          <CardBody>
            <Text size="sm">{ratio}</Text>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};

/** `noPadding` removes body/footer padding for content that brings its own (a flush list). */
export const NoPadding: Story = {
  render: () => (
    <Card variant="outlined" noPadding style={column}>
      <CardBody>
        {['Order #1042', 'Order #1041', 'Order #1039'].map((order) => (
          <Text
            key={order}
            size="sm"
            style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: 'var(--border-width-sm) solid var(--color-border)' }}
          >
            {order}
          </Text>
        ))}
      </CardBody>
    </Card>
  ),
};
