import type { Meta, StoryObj } from '@storybook/react';
import { Highlight, Highlights } from './Highlights';

const meta: Meta<typeof Highlights> = {
  title: 'Components/Highlights',
  component: Highlights,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Highlights>;

/* ─── Placeholder imagery ──────────────────────────────────────── */

const highlightImage = (label: string, bg: string, fg: string, alt: string) => (
  <img
    src={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23${bg}"/><text x="200" y="250" text-anchor="middle" fill="%23${fg}" font-size="20">${encodeURIComponent(label)}</text></svg>`}
    alt={alt}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
);

/* ─── Stories ──────────────────────────────────────────────────── */

export const Default: Story = {
  render: () => (
    <Highlights>
      <Highlight
        image={highlightImage('Foundry', 'C8C2B8', '675F56', 'Molten iron poured into skillet molds')}
        title="Cast with intent."
        description="Every piece starts as raw stock in our Ohio foundry."
      />
      <Highlight
        image={highlightImage('Workshop', 'E3DED6', '847D73', 'A craftsman hand-finishing a walnut board')}
        title="Finished by hand."
        description="Oiled, buffed, and inspected before it ships."
      />
      <Highlight
        image={highlightImage('Kitchen', 'A59E94', '342F2A', 'Cast iron skillet over an open flame')}
        title="Built to be used."
        description="Tools that improve with every season."
      />
    </Highlights>
  ),
};

export const Placeholders: Story = {
  render: () => (
    <Highlights>
      <Highlight title="Cast with intent." description="Every piece starts as raw stock in our Ohio foundry." />
      <Highlight title="Finished by hand." description="Oiled, buffed, and inspected before it ships." />
      <Highlight title="Built to be used." description="Tools that improve with every season." />
    </Highlights>
  ),
};

export const ImagesOnly: Story = {
  render: () => (
    <Highlights>
      <Highlight image={highlightImage('Foundry', 'C8C2B8', '675F56', 'Molten iron poured into skillet molds')} />
      <Highlight image={highlightImage('Workshop', 'E3DED6', '847D73', 'A craftsman hand-finishing a walnut board')} />
      <Highlight image={highlightImage('Kitchen', 'A59E94', '342F2A', 'Cast iron skillet over an open flame')} />
    </Highlights>
  ),
};

export const TwoUp: Story = {
  render: () => (
    <Highlights>
      <Highlight
        image={highlightImage('Foundry', 'C8C2B8', '675F56', 'Molten iron poured into skillet molds')}
        title="Cast with intent."
        description="Every piece starts as raw stock in our Ohio foundry."
      />
      <Highlight
        image={highlightImage('Workshop', 'E3DED6', '847D73', 'A craftsman hand-finishing a walnut board')}
        title="Finished by hand."
        description="Oiled, buffed, and inspected before it ships."
      />
    </Highlights>
  ),
};
