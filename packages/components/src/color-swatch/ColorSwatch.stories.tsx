import type { Meta, StoryObj } from '@storybook/react';
import { ColorSwatch } from './ColorSwatch';

const meta: Meta<typeof ColorSwatch> = {
  title: 'Foundation/Colors',
  component: ColorSwatch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Displays a single color token visually. Used in the docs token page to showcase the design system palette.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorSwatch>;

export const Default: Story = {
  args: {
    color: 'var(--color-primary)',
    name: '--color-primary',
    value: '#1F1C18',
  },
};

export const SemanticTokens: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
      <ColorSwatch color="var(--color-background)" name="--color-background" />
      <ColorSwatch color="var(--color-background-subtle)" name="--color-background-subtle" />
      <ColorSwatch color="var(--color-foreground)" name="--color-foreground" />
      <ColorSwatch color="var(--color-foreground-subtle)" name="--color-foreground-subtle" />
      <ColorSwatch color="var(--color-border)" name="--color-border" />
      <ColorSwatch color="var(--color-primary)" name="--color-primary" />
      <ColorSwatch color="var(--color-secondary)" name="--color-secondary" />
      <ColorSwatch color="var(--color-destructive)" name="--color-destructive" />
      <ColorSwatch color="var(--color-success)" name="--color-success" />
      <ColorSwatch color="var(--color-warning)" name="--color-warning" />
    </div>
  ),
};

export const StonePalette: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
      <ColorSwatch color="#FFFFFF" name="stone-0" value="#FFFFFF" />
      <ColorSwatch color="#FAF9F7" name="stone-50" value="#FAF9F7" />
      <ColorSwatch color="#F2F0EB" name="stone-100" value="#F2F0EB" />
      <ColorSwatch color="#E3DED6" name="stone-200" value="#E3DED6" />
      <ColorSwatch color="#C8C2B8" name="stone-300" value="#C8C2B8" />
      <ColorSwatch color="#A59E94" name="stone-400" value="#A59E94" />
      <ColorSwatch color="#847D73" name="stone-500" value="#847D73" />
      <ColorSwatch color="#675F56" name="stone-600" value="#675F56" />
      <ColorSwatch color="#4E473F" name="stone-700" value="#4E473F" />
      <ColorSwatch color="#342F2A" name="stone-800" value="#342F2A" />
      <ColorSwatch color="#1F1C18" name="stone-900" value="#1F1C18" />
      <ColorSwatch color="#131010" name="stone-950" value="#131010" />
    </div>
  ),
};

export const BrandPalettes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      <div>
        <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)', marginBottom: 'var(--spacing-3)', color: 'var(--color-foreground-muted)' }}>Brick</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <ColorSwatch color="#FDF0ED" name="brick-50" value="#FDF0ED" />
          <ColorSwatch color="#FAE0D8" name="brick-100" value="#FAE0D8" />
          <ColorSwatch color="#E07060" name="brick-400" value="#E07060" />
          <ColorSwatch color="#C45040" name="brick-500" value="#C45040" />
          <ColorSwatch color="#A03830" name="brick-600" value="#A03830" />
          <ColorSwatch color="#7D2A24" name="brick-700" value="#7D2A24" />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)', marginBottom: 'var(--spacing-3)', color: 'var(--color-foreground-muted)' }}>Sage</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <ColorSwatch color="#F2F7F0" name="sage-50" value="#F2F7F0" />
          <ColorSwatch color="#E0EDD9" name="sage-100" value="#E0EDD9" />
          <ColorSwatch color="#82B074" name="sage-400" value="#82B074" />
          <ColorSwatch color="#5E8F50" name="sage-500" value="#5E8F50" />
          <ColorSwatch color="#4A7040" name="sage-600" value="#4A7040" />
          <ColorSwatch color="#375530" name="sage-700" value="#375530" />
        </div>
      </div>
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    color: '#C45040',
    name: 'brick-500',
    value: '#C45040',
  },
};
