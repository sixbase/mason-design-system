import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { Grid } from './Grid';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: {
    docs: {
      description: {
        component:
          'Lays items out in even columns that change with screen width — product grids, card rows.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

const Cell = ({ n }: { n: number }) => (
  <div style={{
    background: 'var(--color-background-subtle)',
    border: 'var(--border-width-sm) solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-6)',
    textAlign: 'center',
  }}>
    <Text as="span" size="sm" muted>{n}</Text>
  </div>
);

const cells = Array.from({ length: 12 }, (_, i) => <Cell key={i} n={i + 1} />);

export const Default: Story = {
  render: () => <Grid>{cells}</Grid>,
};

export const ProductGrid: Story = {
  name: 'Product grid (2→3→4)',
  render: () => (
    <Grid cols={2} colsSm={2} colsMd={3} colsLg={4}>
      {cells}
    </Grid>
  ),
};

export const FixedTwoColumns: Story = {
  name: 'Fixed 2 columns',
  render: () => <Grid cols={2} colsSm={2} colsMd={2} colsLg={2}>{cells}</Grid>,
};

export const CustomGap: Story = {
  name: 'Wider gap',
  render: () => (
    <Grid gap={8}>
      {cells}
    </Grid>
  ),
};

export const PerAxisGaps: Story = {
  name: 'Per-axis gaps (rowGap / columnGap)',
  render: () => (
    <Grid colsMd={3} colsLg={3} rowGap={12} columnGap={4}>
      {cells}
    </Grid>
  ),
};

const UnEvenCell = ({ n, tall }: { n: number; tall?: boolean }) => (
  <div style={{
    background: 'var(--color-background-subtle)',
    border: 'var(--border-width-sm) solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: tall ? 'var(--spacing-16) var(--spacing-6)' : 'var(--spacing-6)',
    textAlign: 'center',
  }}>
    <Text as="span" size="sm" muted>{n}</Text>
  </div>
);

export const Alignment: Story = {
  name: 'Item alignment (alignItems="center")',
  render: () => (
    <Grid colsMd={3} colsLg={3} alignItems="center">
      <UnEvenCell n={1} tall />
      <UnEvenCell n={2} />
      <UnEvenCell n={3} tall />
    </Grid>
  ),
};

export const AutoFit: Story = {
  name: 'Auto-fit (minChildWidth)',
  render: () => (
    // Token gap: no small width token exists yet for card minimums —
    // flagged in the playbook. Using a ch measure until one lands.
    <Grid minChildWidth="24ch">
      {cells}
    </Grid>
  ),
};
