import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Grid>;

const Cell = ({ n }: { n: number }) => (
  <div style={{
    background: 'var(--color-background-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-6)',
    textAlign: 'center',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-foreground-subtle)',
  }}>
    {n}
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
  render: () => (
    <Grid gap={8}>
      {cells}
    </Grid>
  ),
};
