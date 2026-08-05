import { Caption, LayoutGrid, LayoutGridItem, Section, Text } from '@ds/components';
import type { LayoutGridVariant } from '@ds/components';
import { Preview } from './Preview';

function Block({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--color-background-subtle)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-4)',
        minHeight: tall ? 'var(--spacing-phi-89)' : undefined,
        textAlign: 'center',
      }}
    >
      <Text as="span" size="sm" muted>
        {label}
      </Text>
    </div>
  );
}

const variantBlocks: { variant: LayoutGridVariant; title: string; labels: string[] }[] = [
  { variant: 'full', title: 'Full (12)', labels: ['12 columns'] },
  { variant: 'halves', title: 'Halves (6 + 6)', labels: ['6 cols', '6 cols'] },
  { variant: 'golden', title: 'Golden (7 + 5) — default two-column', labels: ['Primary — 7 cols', 'Secondary — 5 cols'] },
  { variant: 'golden-reverse', title: 'Reverse golden (5 + 7)', labels: ['Secondary — 5 cols', 'Primary — 7 cols'] },
  { variant: 'thirds', title: 'Thirds (4 + 4 + 4)', labels: ['4 cols', '4 cols', '4 cols'] },
  { variant: 'quarters', title: 'Quarters (3 + 3 + 3 + 3)', labels: ['3 cols', '3 cols', '3 cols', '3 cols'] },
  { variant: 'wide-narrow', title: 'Wide + narrow (8 + 4)', labels: ['Primary — 8 cols', 'Sidebar — 4 cols'] },
];

export function LayoutGridVariants() {
  return (
    <Preview stack>
      {variantBlocks.map(({ variant, title, labels }) => (
        <div key={variant} style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
          <Caption>{title}</Caption>
          <LayoutGrid variant={variant}>
            {labels.map((label, i) => (
              <LayoutGridItem key={i}>
                <Block label={label} />
              </LayoutGridItem>
            ))}
          </LayoutGrid>
        </div>
      ))}
    </Preview>
  );
}

export function LayoutGridSticky() {
  return (
    <Preview stack>
      <LayoutGrid variant="golden">
        <LayoutGridItem>
          <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
            <Block label="Scrollable content" tall />
            <Block label="Scrollable content" tall />
            <Block label="Scrollable content" tall />
          </div>
        </LayoutGridItem>
        <LayoutGridItem sticky>
          <Block label="Sticky sidebar — stays put while the left column scrolls" tall />
        </LayoutGridItem>
      </LayoutGrid>
    </Preview>
  );
}

export function LayoutGridSections() {
  return (
    <Preview stack>
      <div>
        <Section>
          <Block label="Section one" />
        </Section>
        <Section>
          <Block label="Section two — 64px rhythm above" />
        </Section>
        <LayoutGrid variant="halves" section>
          <LayoutGridItem>
            <Block label="Section three, left" />
          </LayoutGridItem>
          <LayoutGridItem>
            <Block label="Section three, right" />
          </LayoutGridItem>
        </LayoutGrid>
      </div>
    </Preview>
  );
}

export function LayoutGridSpanAll() {
  return (
    <Preview stack>
      <LayoutGrid variant="thirds">
        <LayoutGridItem spanAll>
          <Block label="spanAll — full 12 columns" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="4 cols" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="4 cols" />
        </LayoutGridItem>
        <LayoutGridItem>
          <Block label="4 cols" />
        </LayoutGridItem>
      </LayoutGrid>
    </Preview>
  );
}
