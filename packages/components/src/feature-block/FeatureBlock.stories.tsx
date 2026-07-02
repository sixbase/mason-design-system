import type { Meta, StoryObj } from '@storybook/react';
import { FeatureBlock } from './FeatureBlock';

const meta: Meta<typeof FeatureBlock> = {
  title: 'Components/FeatureBlock',
  component: FeatureBlock,
  tags: ['autodocs'],
  argTypes: {
    reverse: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof FeatureBlock>;

/* ─── Placeholder imagery ──────────────────────────────────────── */

const foundryImage = (
  <img
    src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%23C8C2B8"/><text x="300" y="225" text-anchor="middle" fill="%23675F56" font-size="22">Foundry</text></svg>'
    alt="Molten iron being poured into skillet molds at the Mason foundry"
    style={{ width: '100%', borderRadius: 'var(--radius-lg)' }}
  />
);

const workshopImage = (
  <img
    src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="600" height="450" fill="%23E3DED6"/><text x="300" y="225" text-anchor="middle" fill="%23847D73" font-size="22">Workshop</text></svg>'
    alt="A craftsman hand-finishing a walnut cutting board"
    style={{ width: '100%', borderRadius: 'var(--radius-lg)' }}
  />
);

/* ─── Stories ──────────────────────────────────────────────────── */

export const Default: Story = {
  args: {
    title: 'Cast for a lifetime',
    description:
      'Every skillet is poured, seasoned, and inspected in our Ohio foundry. Heavier stock, a polished cooking surface, and a handle balanced for the home kitchen.',
    image: foundryImage,
  },
};

export const Reversed: Story = {
  args: {
    title: 'Finished by hand',
    description:
      'Our cutting boards are milled from single-source American walnut, then oiled and buffed by hand before they leave the workshop.',
    image: workshopImage,
    reverse: true,
  },
};

export const AlternatingSection: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
      <FeatureBlock
        title="Cast for a lifetime"
        description="Every skillet is poured, seasoned, and inspected in our Ohio foundry. Heavier stock, a polished cooking surface, and a handle balanced for the home kitchen."
        image={foundryImage}
      />
      <FeatureBlock
        title="Finished by hand"
        description="Our cutting boards are milled from single-source American walnut, then oiled and buffed by hand before they leave the workshop."
        image={workshopImage}
        reverse
      />
    </div>
  ),
};
