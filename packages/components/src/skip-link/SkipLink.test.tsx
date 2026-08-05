import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('renders a link with default text and target', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('applies the base class', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link')).toHaveClass('ds-skip-link');
  });

  it('accepts a custom href', () => {
    render(<SkipLink href="#product-list" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '#product-list');
  });

  it('accepts custom children', () => {
    render(<SkipLink>Skip to products</SkipLink>);
    expect(screen.getByRole('link', { name: 'Skip to products' })).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<SkipLink className="custom" />);
    expect(screen.getByRole('link')).toHaveClass('custom', 'ds-skip-link');
  });

  it('passes through html attributes', () => {
    render(<SkipLink data-testid="skip" />);
    expect(screen.getByTestId('skip')).toBeInTheDocument();
  });

  it('forwards ref to the anchor element', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<SkipLink ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('is the first element reached when tabbing', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SkipLink />
        <a href="/shop">Shop</a>
      </div>,
    );
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
  });

  /* ─── Accessibility ──────────────────────────────────────────── */

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <SkipLink />
        <main id="main-content" tabIndex={-1}>
          Content
        </main>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
