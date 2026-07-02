import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Caption, Code, Heading, Text } from './Typography';

describe('Heading', () => {
  it('renders an h2 by default', () => {
    render(<Heading>Section title</Heading>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Section title' });
    expect(heading).toHaveClass('ds-heading', 'ds-heading--3xl');
  });

  it('renders the semantic level from `as` with its mapped size', () => {
    render(<Heading as="h1">Page title</Heading>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('ds-heading--4xl');
  });

  it('decouples visual size from semantic level', () => {
    render(<Heading as="h3" size="4xl">Big h3</Heading>);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveClass('ds-heading--4xl');
  });

  it('applies weight, muted, and truncate classes', () => {
    render(
      <Heading weight="normal" muted truncate>
        Styled
      </Heading>,
    );
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('ds-heading--normal', 'ds-heading--muted', 'ds-heading--truncate');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Heading ref={ref}>Title</Heading>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('Text', () => {
  it('renders a p element with base size by default', () => {
    render(<Text>Body copy</Text>);
    const el = screen.getByText('Body copy');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('ds-text', 'ds-text--base');
  });

  it('renders the element from `as`', () => {
    render(<Text as="span">Inline</Text>);
    expect(screen.getByText('Inline').tagName).toBe('SPAN');
  });

  it('applies size class', () => {
    render(<Text size="sm">Helper</Text>);
    expect(screen.getByText('Helper')).toHaveClass('ds-text--sm');
  });

  it('applies weight, muted, and truncate classes', () => {
    render(
      <Text weight="medium" muted truncate>
        Styled
      </Text>,
    );
    expect(screen.getByText('Styled')).toHaveClass('ds-text--medium', 'ds-text--muted', 'ds-text--truncate');
  });

  it('merges custom className', () => {
    render(<Text className="custom">Body</Text>);
    expect(screen.getByText('Body')).toHaveClass('custom', 'ds-text');
  });
});

describe('Caption', () => {
  it('renders a span with the caption class', () => {
    render(<Caption>Last updated 2 hours ago</Caption>);
    const el = screen.getByText('Last updated 2 hours ago');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('ds-caption');
  });
});

describe('Code', () => {
  it('renders a code element with the code class', () => {
    render(<Code>pnpm build</Code>);
    const el = screen.getByText('pnpm build');
    expect(el.tagName).toBe('CODE');
    expect(el).toHaveClass('ds-code');
  });
});

describe('Typography accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Heading as="h1">Cast Iron Care Guide</Heading>
        <Heading as="h2" muted>Seasoning basics</Heading>
        <Text>Rub a thin coat of oil over the whole pan, then bake it upside down for an hour.</Text>
        <Text size="sm" muted>
          Works for skillets, griddles, and dutch ovens.
        </Text>
        <Caption>Last updated 2 hours ago</Caption>
        <Text>
          Run <Code>pnpm build</Code> to rebuild the tokens.
        </Text>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
