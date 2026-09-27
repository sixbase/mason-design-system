import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '../typography/Typography';
import { FeatureBlock } from './FeatureBlock';

const meta: Meta<typeof FeatureBlock> = {
  title: 'Components/FeatureBlock',
  component: FeatureBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A picture beside a short headline and paragraph — for telling the brand or product story.',
      },
    },
  },
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

/**
 * A section of blocks under its own h2: each block's title drops to h3
 * (`headingLevel="h3"`) — same size on screen, correct page outline.
 */
export const AlternatingSection: Story = {
  name: 'Alternating, under a section heading',
  render: () => (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
      <Heading as="h2" size="2xl">How it’s made</Heading>
      <FeatureBlock
        headingLevel="h3"
        title="Cast for a lifetime"
        description="Every skillet is poured, seasoned, and inspected in our Ohio foundry. Heavier stock, a polished cooking surface, and a handle balanced for the home kitchen."
        image={foundryImage}
      />
      <FeatureBlock
        headingLevel="h3"
        title="Finished by hand"
        description="Our cutting boards are milled from single-source American walnut, then oiled and buffed by hand before they leave the workshop."
        image={workshopImage}
        reverse
      />
    </section>
  ),
};
