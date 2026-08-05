import { Grid, Text } from '@ds/components';
import { Preview } from './Preview';

function Cell({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--color-background-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: tall ? 'var(--spacing-16) var(--spacing-4)' : 'var(--spacing-4)',
        textAlign: 'center',
      }}
    >
      <Text as="span" size="sm" muted>
        {label}
      </Text>
    </div>
  );
}

const cells = (n: number) => Array.from({ length: n }, (_, i) => <Cell key={i} label={`${i + 1}`} />);

export function GridResponsive() {
  return (
    <Preview>
      <div style={{ width: '100%' }}>
        <Grid>{cells(8)}</Grid>
      </div>
    </Preview>
  );
}

export function GridPerAxisGaps() {
  return (
    <Preview>
      <div style={{ width: '100%' }}>
        <Grid colsMd={3} colsLg={3} rowGap={8} columnGap={3}>
          {cells(6)}
        </Grid>
      </div>
    </Preview>
  );
}

export function GridAlignment() {
  return (
    <Preview>
      <div style={{ width: '100%' }}>
        <Grid colsMd={3} colsLg={3} alignItems="center">
          <Cell label="Tall" tall />
          <Cell label="Centered on the block axis" />
          <Cell label="Tall" tall />
        </Grid>
      </div>
    </Preview>
  );
}

export function GridAutoFit() {
  return (
    <Preview>
      <div style={{ width: '100%' }}>
        {/* Token gap: no small width token exists for card minimums yet —
            using a ch measure until one lands. */}
        <Grid minChildWidth="18ch">{cells(8)}</Grid>
      </div>
    </Preview>
  );
}
