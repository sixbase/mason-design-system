import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Caption, Code, Heading, Text } from './Typography';

/** Loads a component stylesheet into jsdom (no @media support) for computed-style checks. */
function injectCss(file: string): () => void {
  const style = document.createElement('style');
  style.textContent = readFileSync(resolve(__dirname, file), 'utf8');
  document.head.appendChild(style);
  return () => style.remove();
}

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

  it('maps sizes to the fluid display scale when display is set', () => {
    render(
      <div>
        <Heading as="h1" display>Hero</Heading>
        <Heading as="h2" size="3xl" display>Campaign</Heading>
        <Heading as="h3" size="2xl" display>Editorial</Heading>
        <Heading as="h4" size="xl" display>Kicker</Heading>
      </div>,
    );
    // Rank-preserving mapping: 4xl→2xl, 3xl→xl, 2xl→lg, xl→md
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('ds-heading--display-2xl');
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('ds-heading--display-xl');
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('ds-heading--display-lg');
    expect(screen.getByRole('heading', { level: 4 })).toHaveClass('ds-heading--display-md');
  });

  it('drops the normal size class in display mode', () => {
    render(<Heading as="h1" display>Hero</Heading>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).not.toHaveClass('ds-heading--4xl');
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

  it('supports the xs and xl sizes', () => {
    render(
      <div>
        <Text size="xs">Fine print</Text>
        <Text size="xl">Lead</Text>
      </div>,
    );
    expect(screen.getByText('Fine print')).toHaveClass('ds-text--xs');
    expect(screen.getByText('Lead')).toHaveClass('ds-text--xl');
  });

  it('applies the line clamp class', () => {
    render(<Text lineClamp={2}>Clamped copy</Text>);
    expect(screen.getByText('Clamped copy')).toHaveClass('ds-text--clamp-2');
  });

  it('does not apply a clamp class by default', () => {
    render(<Text>Unclamped</Text>);
    expect(screen.getByText('Unclamped').className).toBe('ds-text ds-text--base');
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

describe('Typography styles', () => {
  let removeCss: () => void;
  beforeEach(() => {
    removeCss = injectCss('Typography.css');
  });
  afterEach(() => removeCss());

  // Regression: long unbroken strings overflowed narrow columns at 320px.
  it('wraps long unbroken words in Text and Heading', () => {
    render(
      <div>
        <Heading as="h1">Pneumonoultramicroscopicsilicovolcanoconiosis</Heading>
        <Text>https://example.com/products/aramid-fiber-case?variant=1234567890</Text>
      </div>,
    );
    expect(getComputedStyle(screen.getByRole('heading')).overflowWrap).toBe('break-word');
    expect(getComputedStyle(screen.getByText(/example\.com/)).overflowWrap).toBe('break-word');
  });

  // Regression: `ds-text--normal` / `ds-heading--semibold` had no rules,
  // so weight="normal" couldn't un-bold a <strong> or bold context.
  // A computed check can't prove the heading default has a rule — base
  // .ds-heading is already semibold, so it passed with the rule missing.
  // Every modifier is checked in source; Text's reset of a bold <strong>,
  // which the UA stylesheet makes observable, is checked computed.
  it('gives every weight value a rule, including the defaults', () => {
    const css = readFileSync(resolve(__dirname, 'Typography.css'), 'utf8');
    for (const weight of ['normal', 'medium', 'semibold', 'bold']) {
      for (const block of ['heading', 'text']) {
        expect(css).toMatch(
          new RegExp(`\\.ds-${block}--${weight}\\s*\\{\\s*font-weight: var\\(--font-weight-${weight}\\);`),
        );
      }
    }
    render(<Text as="strong" weight="normal">Unbolded</Text>);
    expect(getComputedStyle(screen.getByText('Unbolded')).fontWeight).toBe('var(--font-weight-normal)');
  });

  // Regression: overflow is ignored on plain inline boxes, so
  // <Text as="span" truncate> never truncated.
  it('gives inline truncated Text an atomic box so the ellipsis applies', () => {
    render(<Text as="span" truncate>Very long inline label</Text>);
    expect(getComputedStyle(screen.getByText('Very long inline label')).display).toBe('inline-block');
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
