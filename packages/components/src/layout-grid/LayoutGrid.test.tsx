import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { LayoutGrid, LayoutGridItem, PageContainer, Section } from './LayoutGrid';

describe('LayoutGrid', () => {
  it('renders children', () => {
    render(
      <LayoutGrid>
        <div>Item</div>
      </LayoutGrid>,
    );
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('applies base class and full variant by default', () => {
    const { container } = render(<LayoutGrid>Content</LayoutGrid>);
    expect(container.firstChild).toHaveClass('ds-layout', 'ds-layout--full');
  });

  it.each([
    'full',
    'halves',
    'golden',
    'golden-reverse',
    'thirds',
    'quarters',
    'wide-narrow',
  ] as const)('applies the %s variant modifier', (variant) => {
    const { container } = render(<LayoutGrid variant={variant}>Content</LayoutGrid>);
    expect(container.firstChild).toHaveClass('ds-layout', `ds-layout--${variant}`);
  });

  it('adds section rhythm class when section is set', () => {
    const { container } = render(<LayoutGrid section>Content</LayoutGrid>);
    expect(container.firstChild).toHaveClass('ds-section');
  });

  it('does not add the section class by default', () => {
    const { container } = render(<LayoutGrid>Content</LayoutGrid>);
    expect(container.firstChild).not.toHaveClass('ds-section');
  });

  it('merges custom className', () => {
    const { container } = render(<LayoutGrid className="custom">Content</LayoutGrid>);
    expect(container.firstChild).toHaveClass('ds-layout', 'custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<LayoutGrid ref={ref}>Content</LayoutGrid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes through html attributes', () => {
    render(<LayoutGrid data-testid="layout">Content</LayoutGrid>);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });
});

describe('LayoutGridItem', () => {
  it('renders a plain div without modifiers by default', () => {
    const { container } = render(<LayoutGridItem>Cell</LayoutGridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.getAttribute('class')).toBeNull();
  });

  it('applies the sticky utility class', () => {
    const { container } = render(<LayoutGridItem sticky>Sidebar</LayoutGridItem>);
    expect(container.firstChild).toHaveClass('ds-layout__sticky');
  });

  it('applies the span-all utility class', () => {
    const { container } = render(<LayoutGridItem spanAll>Wide</LayoutGridItem>);
    expect(container.firstChild).toHaveClass('ds-layout__span-all');
  });

  it('merges custom className', () => {
    const { container } = render(
      <LayoutGridItem sticky className="custom">
        Cell
      </LayoutGridItem>,
    );
    expect(container.firstChild).toHaveClass('ds-layout__sticky', 'custom');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<LayoutGridItem ref={ref}>Cell</LayoutGridItem>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('PageContainer', () => {
  it('renders a div with the page container class by default', () => {
    const { container } = render(<PageContainer>Page</PageContainer>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ds-page-container');
  });

  it('renders as main when requested', () => {
    render(<PageContainer as="main">Page</PageContainer>);
    expect(screen.getByRole('main')).toHaveClass('ds-page-container');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null };
    render(<PageContainer ref={ref}>Page</PageContainer>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe('Section', () => {
  it('renders a section element with the rhythm class by default', () => {
    const { container } = render(<Section>Block</Section>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('SECTION');
    expect(el).toHaveClass('ds-section');
  });

  it('renders as div when requested', () => {
    const { container } = render(<Section as="div">Block</Section>);
    expect((container.firstChild as HTMLElement).tagName).toBe('DIV');
  });

  it('merges custom className', () => {
    const { container } = render(<Section className="custom">Block</Section>);
    expect(container.firstChild).toHaveClass('ds-section', 'custom');
  });
});

describe('LayoutGrid accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <PageContainer as="main">
        <Section>
          <LayoutGrid variant="golden">
            <LayoutGridItem>Primary content</LayoutGridItem>
            <LayoutGridItem sticky>Sticky sidebar</LayoutGridItem>
          </LayoutGrid>
        </Section>
        <Section>
          <LayoutGrid variant="thirds">
            <LayoutGridItem>One</LayoutGridItem>
            <LayoutGridItem>Two</LayoutGridItem>
            <LayoutGridItem>Three</LayoutGridItem>
          </LayoutGrid>
        </Section>
      </PageContainer>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
