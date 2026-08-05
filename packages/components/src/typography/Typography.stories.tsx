import type { Meta, StoryObj } from '@storybook/react';
import { Caption, Code, Heading, Text } from './Typography';

const meta: Meta = {
  title: 'Components/Typography',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

export const HeadingScale: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <Heading as="h1">Heading 1 — Page title</Heading>
      <Heading as="h2">Heading 2 — Section title</Heading>
      <Heading as="h3">Heading 3 — Subsection</Heading>
      <Heading as="h4">Heading 4 — Card title</Heading>
    </div>
  ),
};

export const DisplayScale: StoryObj = {
  name: 'Display scale (fluid, editorial)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <Heading as="h1" display>Hero headline</Heading>
      <Heading as="h2" display>Campaign title</Heading>
      <Heading as="h3" display>Editorial subhead</Heading>
      <Heading as="h4" display>Display kicker</Heading>
    </div>
  ),
};

export const BodyScale: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <Text size="xl">Extra large body — for standout intros and pull quotes.</Text>
      <Text size="lg">Large body — for lead paragraphs and introductory text.</Text>
      <Text size="base">Base body — the default size for most content.</Text>
      <Text size="sm">Small body — for secondary content, form hints, and labels.</Text>
      <Text size="xs">Extra small body — for fine print and dense metadata.</Text>
    </div>
  ),
};

export const Weights: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      <Text weight="normal">Normal weight (400)</Text>
      <Text weight="medium">Medium weight (500)</Text>
      <Text weight="semibold">Semibold weight (600)</Text>
      <Text weight="bold">Bold weight (700)</Text>
    </div>
  ),
};

export const Muted: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      <Heading as="h3">Normal heading</Heading>
      <Heading as="h3" muted>Muted heading</Heading>
      <Text>Normal text</Text>
      <Text muted>Muted text</Text>
    </div>
  ),
};

export const CaptionAndCode: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
      <Caption>Last modified March 14, 2026 · 2 min read</Caption>
      <Text>
        Use the <Code>Button</Code> component with <Code>variant="primary"</Code> for primary
        actions.
      </Text>
    </div>
  ),
};

export const Truncate: StoryObj = {
  render: () => (
    <div style={{ width: '200px' }}>
      <Text truncate>This is a very long line of text that should be truncated with an ellipsis</Text>
      <Heading as="h4" truncate>A very long heading that gets a single-line ellipsis</Heading>
    </div>
  ),
};

export const LineClamp: StoryObj = {
  name: 'Line clamp (multi-line truncation)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', maxWidth: 'var(--size-modal-sm)' }}>
      <Text lineClamp={1}>
        One line only. Our phone cases are made from aramid fiber, the same material used in
        aerospace and body armor, precision-cut for your exact device model.
      </Text>
      <Text lineClamp={2}>
        Two lines max. Our phone cases are made from aramid fiber, the same material used in
        aerospace and body armor. At 0.65mm thin, they add virtually no bulk while protecting
        against drops up to 6 feet.
      </Text>
      <Text lineClamp={3}>
        Three lines max. Our phone cases are made from aramid fiber, the same material used in
        aerospace and body armor. At 0.65mm thin, they add virtually no bulk while protecting
        against drops up to 6 feet. Each case is precision-cut for your exact device model with
        openings for every port and button.
      </Text>
    </div>
  ),
};
