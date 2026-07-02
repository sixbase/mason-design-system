import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Container>;

const Placeholder = ({ label }: { label: string }) => (
  <div style={{
    background: 'var(--color-background-subtle)',
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-8)',
    textAlign: 'center',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-foreground-subtle)',
  }}>
    {label}
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
