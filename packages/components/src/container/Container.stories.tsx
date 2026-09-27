import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Keeps page content to a readable width and adds side padding on small screens.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

const Placeholder = ({ label }: { label: string }) => (
  <div style={{
    background: 'var(--color-background-subtle)',
    border: 'var(--border-width-sm) dashed var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-8)',
    textAlign: 'center',
  }}>
    <Text as="span" size="sm" muted>{label}</Text>
  </div>
);

export const Default: Story = {
  render: () => (
    <Container>
      <Placeholder label="Default container (xl: 1280px)" />
    </Container>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <Container size="sm"><Placeholder label="sm (640px)" /></Container>
      <Container size="md"><Placeholder label="md (768px)" /></Container>
      <Container size="lg"><Placeholder label="lg (960px)" /></Container>
      <Container><Placeholder label="xl (1280px) — default" /></Container>
    </div>
  ),
};

export const Fluid: Story = {
  render: () => (
    <Container fluid>
      <Placeholder label="Fluid — no max-width, responsive padding only" />
    </Container>
  ),
};

/** `noPadding` drops the side padding — for a container nested inside another one. */
export const NoPadding: Story = {
  name: 'Nested, without side padding',
  render: () => (
    <Container>
      <Container size="md" noPadding>
        <Placeholder label="md container inside the default one — no extra side padding" />
      </Container>
    </Container>
  ),
};
