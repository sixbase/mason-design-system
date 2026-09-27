import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  /* ─── Image mode ─────────────────────────────────────────────── */

  it('renders an image with the name as alt text', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.jpg" />);
    const img = screen.getByAltText('Ada Lovelace');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/ada.jpg');
  });

  it('does not apply role="img" to the root when the image renders', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" src="/ada.jpg" />);
    expect(screen.getByTestId('avatar')).not.toHaveAttribute('role');
  });

  /* ─── Fallback mode ──────────────────────────────────────────── */

  it('renders initials when no src is provided', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('derives a single initial from a one-word name', () => {
    render(<Avatar name="Plato" />);
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('caps initials at 2 characters using first and last words', () => {
    render(<Avatar name="Mary Jane Watson" />);
    expect(screen.getByText('MW')).toBeInTheDocument();
  });

  it('applies role="img" and aria-label in fallback mode', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
  });

  it('hides the initials text from assistive tech', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toHaveAttribute('aria-hidden', 'true');
  });

  it('falls back to initials when the image fails to load', () => {
    render(<Avatar name="Ada Lovelace" src="/broken.jpg" />);
    fireEvent.error(screen.getByAltText('Ada Lovelace'));
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.queryByAltText('Ada Lovelace')).toBeNull();
  });

  /* ─── Fallback tone ──────────────────────────────────────────── */

  it('applies a deterministic tone class keyed by name', () => {
    const { unmount } = render(<Avatar data-testid="a" name="Ada Lovelace" />);
    const first = [...screen.getByTestId('a').classList].find((c) =>
      c.startsWith('ds-avatar--tone-'),
    );
    unmount();
    render(<Avatar data-testid="b" name="Ada Lovelace" />);
    const second = [...screen.getByTestId('b').classList].find((c) =>
      c.startsWith('ds-avatar--tone-'),
    );
    expect(first).toBeDefined();
    expect(second).toBe(first);
  });

  it('does not apply a tone class in image mode', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" src="/ada.jpg" />);
    const toneClass = [...screen.getByTestId('avatar').classList].find((c) =>
      c.startsWith('ds-avatar--tone-'),
    );
    expect(toneClass).toBeUndefined();
  });

  /* ─── Sizes and shape ────────────────────────────────────────── */

  it('applies default size class', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" />);
    expect(screen.getByTestId('avatar')).toHaveClass('ds-avatar--md');
  });

  it('applies size class', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" size="lg" />);
    expect(screen.getByTestId('avatar')).toHaveClass('ds-avatar--lg');
  });

  it('applies square shape class', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" shape="square" />);
    expect(screen.getByTestId('avatar')).toHaveClass('ds-avatar--square');
  });

  it('does not apply a shape modifier for the default circle', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" />);
    expect(screen.getByTestId('avatar')).not.toHaveClass('ds-avatar--square');
  });

  it('merges custom className', () => {
    render(<Avatar data-testid="avatar" name="Ada Lovelace" className="custom" />);
    expect(screen.getByTestId('avatar')).toHaveClass('custom', 'ds-avatar');
  });

  /* ─── Accessibility ──────────────────────────────────────────── */

  /* ─── Regressions ────────────────────────────────────────────── */

  // Regression: charAt(0) split emoji into a lone surrogate (rendered �).
  it('keeps emoji initials intact', () => {
    const { container } = render(<Avatar name="😀 Smile" />);
    expect(container.querySelector('.ds-avatar__initials')?.textContent).toBe('😀S');
  });

  describe('image that settled before hydration', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    // Regression: an SSR <img> that failed before React attached onError
    // kept its broken-image glyph forever instead of showing initials.
    it('falls back to initials when the image already failed', () => {
      vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
      vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0);
      render(<Avatar name="Ada Lovelace" src="/broken.jpg" />);
      expect(screen.getByRole('img', { name: 'Ada Lovelace' }).tagName).toBe('SPAN');
    });

    it('keeps an image that already loaded', () => {
      vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
      vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(120);
      render(<Avatar name="Ada Lovelace" src="/ok.jpg" />);
      expect(screen.getByRole('img', { name: 'Ada Lovelace' }).tagName).toBe('IMG');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Avatar name="Ada Lovelace" src="/ada.jpg" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Mason Supply" shape="square" size="lg" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
