import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../typography/Typography';
import { LayoutGrid, LayoutGridItem, PageContainer, Section } from './LayoutGrid';

const meta: Meta<typeof LayoutGrid> = {
  title: 'Layout/LayoutGrid',
  component: LayoutGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The page’s 12-column structure and its fixed splits (7 + 5, halves, thirds…). Pages are built on these.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LayoutGrid>;

const Block = ({ label, tall = false }: { label: string; tall?: boolean }) => (
  <div
    style={{
      background: 'var(--color-background-subtle)',
      border: 'var(--border-width-sm) dashed var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--spacing-6)',
      minHeight: tall ? 'var(--spacing-phi-89)' : undefined,
      textAlign: 'center',
    }}
  >
    <Text as="span" size="sm" muted>{label}</Text>
  </div>
);

export const Full: Story = {
  name: 'Full (12)',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="full">
        <LayoutGridItem>
          <Block label="12 columns" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const Halves: Story = {
  name: 'Halves (6 + 6)',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="halves">
        <LayoutGridItem>
          <Block label="6 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="6 columns" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const Golden: Story = {
  name: 'Golden (7 + 5) — default two-column',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="golden">
        <LayoutGridItem>
          <Block label="Primary — 7 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="Secondary — 5 columns" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const GoldenReverse: Story = {
  name: 'Reverse golden (5 + 7)',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="golden-reverse">
        <LayoutGridItem>
          <Block label="Secondary — 5 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="Primary — 7 columns" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const Thirds: Story = {
  name: 'Thirds (4 + 4 + 4)',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="thirds">
        <LayoutGridItem>
          <Block label="4 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="4 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="4 columns" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const Quarters: Story = {
  name: 'Quarters (3 + 3 + 3 + 3)',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="quarters">
        <LayoutGridItem>
          <Block label="3 cols" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="3 cols" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="3 cols" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="3 cols" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const WideNarrow: Story = {
  name: 'Wide + narrow (8 + 4)',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="wide-narrow">
        <LayoutGridItem>
          <Block label="Primary — 8 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="Sidebar — 4 columns" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const StickySidebar: Story = {
  name: 'Sticky sidebar (PDP/Cart pattern)',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="golden">
        <LayoutGridItem>
          <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
            <Block label="Scrollable content" tall />
            <Block label="Scrollable content" tall />
            <Block label="Scrollable content" tall />
          </div>
        </LayoutGridItem>
        <LayoutGridItem sticky>
          <Block label="Sticky sidebar — stays visible while scrolling" tall />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const SectionRhythm: Story = {
  name: 'Section rhythm (64px)',
  render: () => (
    <PageContainer>
      <Section>
        <Block label="Section one" />
      </Section>
      <Section>
        <Block label="Section two — 64px above" />
      </Section>
      <LayoutGrid variant="halves" section>
        <LayoutGridItem>
          <Block label="Section three, left" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="Section three, right" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};

export const SpanAll: Story = {
  name: 'One item across the full width',
  render: () => (
    <PageContainer>
      <LayoutGrid variant="thirds">
        <LayoutGridItem spanAll>
          <Block label="Spans all 12 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="4 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="4 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="4 columns" />
        </LayoutGridItem>
      </LayoutGrid>
    </PageContainer>
  ),
};
