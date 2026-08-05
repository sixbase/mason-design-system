import { Container, Text } from '@ds/components';
import { Preview } from './Preview';

function Block({ label }: { label: string }) {
  return (
    <div
      style={{
        background: 'var(--color-background-subtle)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-6)',
        textAlign: 'center',
      }}
    >
      <Text as="span" size="sm" muted>
        {label}
      </Text>
    </div>
  );
}

export function ContainerSizes() {
  return (
    <Preview stack flush>
      <Container size="sm">
        <Block label="sm — 640px" />
      </Container>
      <Container size="md">
        <Block label="md — 768px" />
      </Container>
      <Container size="lg">
        <Block label="lg — 960px" />
      </Container>
      <Container>
        <Block label="xl — 1280px (default)" />
      </Container>
    </Preview>
  );
}

export function ContainerFluid() {
  return (
    <Preview stack flush>
      <Container fluid>
        <Block label="Fluid — no max-width, responsive padding only" />
      </Container>
    </Preview>
  );
}

export function ContainerNested() {
  return (
    <Preview stack flush>
      <Container size="lg">
        <Container noPadding>
          <Block label="Nested container with noPadding — the parent already handles padding and safe areas" />
        </Container>
      </Container>
    </Preview>
  );
}
