import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { ColorSwatch } from './ColorSwatch';

const meta: Meta<typeof ColorSwatch> = {
  title: 'Foundation/Colors',
  component: ColorSwatch,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Shows one colour from the design system with its name — the building block of the colour sheets.',
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
    value: '#342F2A',
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
      <ColorSwatch color="var(--color-stone-0)" name="stone-0" value="#FFFFFF" />
      <ColorSwatch color="var(--color-stone-50)" name="stone-50" value="#FAF9F7" />
      <ColorSwatch color="var(--color-stone-100)" name="stone-100" value="#F2F0EB" />
      <ColorSwatch color="var(--color-stone-200)" name="stone-200" value="#E3DED6" />
      <ColorSwatch color="var(--color-stone-300)" name="stone-300" value="#C8C2B8" />
      <ColorSwatch color="var(--color-stone-400)" name="stone-400" value="#A59E94" />
      <ColorSwatch color="var(--color-stone-500)" name="stone-500" value="#847D73" />
      <ColorSwatch color="var(--color-stone-600)" name="stone-600" value="#675F56" />
      <ColorSwatch color="var(--color-stone-700)" name="stone-700" value="#4E473F" />
      <ColorSwatch color="var(--color-stone-800)" name="stone-800" value="#342F2A" />
      <ColorSwatch color="var(--color-stone-900)" name="stone-900" value="#1F1C18" />
      <ColorSwatch color="var(--color-stone-950)" name="stone-950" value="#131010" />
    </div>
  ),
};

export const BrandPalettes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      <div>
        <Text size="xs" weight="semibold" muted style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)', marginBottom: 'var(--spacing-3)' }}>
          Brick
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <ColorSwatch color="var(--color-brick-50)" name="brick-50" value="#FDF0ED" />
          <ColorSwatch color="var(--color-brick-100)" name="brick-100" value="#FAE0D8" />
          <ColorSwatch color="var(--color-brick-400)" name="brick-400" value="#E07060" />
          <ColorSwatch color="var(--color-brick-500)" name="brick-500" value="#C45040" />
          <ColorSwatch color="var(--color-brick-600)" name="brick-600" value="#A03830" />
          <ColorSwatch color="var(--color-brick-700)" name="brick-700" value="#7D2A24" />
        </div>
      </div>
      <div>
        <Text size="xs" weight="semibold" muted style={{ textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wider)', marginBottom: 'var(--spacing-3)' }}>
          Sage
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <ColorSwatch color="var(--color-sage-50)" name="sage-50" value="#F2F7F0" />
          <ColorSwatch color="var(--color-sage-100)" name="sage-100" value="#E0EDD9" />
          <ColorSwatch color="var(--color-sage-400)" name="sage-400" value="#82B074" />
          <ColorSwatch color="var(--color-sage-500)" name="sage-500" value="#5E8F50" />
          <ColorSwatch color="var(--color-sage-600)" name="sage-600" value="#4A7040" />
          <ColorSwatch color="var(--color-sage-700)" name="sage-700" value="#375530" />
        </div>
      </div>
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    color: 'var(--color-brick-500)',
    name: 'brick-500',
    value: '#C45040',
  },
};
