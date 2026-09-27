import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Switch', () => {
  it('renders a switch button', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders the label when provided', () => {
    render(<Switch label="Email notifications" />);
    expect(screen.getByText('Email notifications')).toBeInTheDocument();
  });

  it('associates label with switch', () => {
    render(<Switch label="Gift wrapping" />);
    expect(screen.getByRole('switch', { name: 'Gift wrapping' })).toBeInTheDocument();
  });

  it('renders hint text', () => {
    render(<Switch label="Gift wrapping" hint="Adds $5.00 at checkout" />);
    expect(screen.getByText('Adds $5.00 at checkout')).toBeInTheDocument();
  });

  it('associates hint via aria-describedby', () => {
    render(<Switch label="Gift wrapping" hint="Adds $5.00 at checkout" />);
    const switchEl = screen.getByRole('switch');
    const hintId = switchEl.getAttribute('aria-describedby');
    expect(hintId).toBeTruthy();
    expect(document.getElementById(hintId!)).toHaveTextContent('Adds $5.00 at checkout');
  });

  it('renders error with role alert', () => {
    render(<Switch label="Terms" error="You must enable this to continue" />);
    expect(screen.getByRole('alert')).toHaveTextContent('You must enable this to continue');
  });

  it('hides hint when error is present', () => {
    render(<Switch label="Terms" hint="Required" error="Must enable" />);
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Switch label="Terms" error="Required" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  it('is unchecked by default', () => {
    render(<Switch label="Option" />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('can be toggled by clicking the label', async () => {
    const user = userEvent.setup();
    render(<Switch label="Option" />);
    await user.click(screen.getByText('Option'));
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('fires onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Option" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('toggles with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Switch label="Option" />);
    const switchEl = screen.getByRole('switch');
    switchEl.focus();
    await user.keyboard(' ');
    expect(switchEl).toBeChecked();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Switch label="Option" disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('does not fire onCheckedChange when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Option" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('applies size class', () => {
    render(<Switch size="sm" label="Small" />);
    expect(document.querySelector('.ds-switch-track--sm')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Switch label="Email notifications" />
        <Switch label="Gift wrapping" hint="Adds $5.00 at checkout" />
        <Switch label="Terms" error="You must enable this to continue" />
        <Switch label="Disabled" disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });


  // ─── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    it('aria-describedby never points at the hidden hint while an error shows', () => {
      render(<Switch label="Gift wrap" hint="Adds $5" error="Required" />);
      const ids = (screen.getByRole('switch').getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(document.getElementById(id), `dangling id ${id}`).not.toBeNull();
    });

    // Unchecked error used --color-destructive-subtle, a near-white fill:
    // track and white thumb vanished against the page (~1.05:1).
    it('unchecked error track keeps a visible fill (not the near-white destructive tint)', () => {
      const style = document.createElement('style');
      style.textContent = readFileSync(resolve(__dirname, 'Switch.css'), 'utf8');
      document.head.appendChild(style);
      try {
        render(<Switch label="Terms" error="Required" />);
        const track = screen.getByRole('switch');
        const cs = getComputedStyle(track);
        expect(cs.backgroundColor).not.toContain('destructive-subtle');
        expect(cs.getPropertyValue('--switch-bg')).not.toContain('destructive-subtle');
      } finally {
        style.remove();
      }
    });

    // Every pointer got a 44px zone reaching 9–14px past the track, so
    // switches stacked closer than that overlapped and a click near the
    // edge flipped the neighbour. Now 24px for every pointer; 44px only on
    // coarse pointers, where the row grows to 44px so the zone stays inside
    // the switch. jsdom has no layout, so the rules are checked in source.
    describe('hit area', () => {
      const css = readFileSync(resolve(__dirname, 'Switch.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const coarseStart = css.indexOf('@media (pointer: coarse)');
      const coarse = (() => {
        let depth = 0;
        for (let i = css.indexOf('{', coarseStart); i < css.length; i++) {
          if (css[i] === '{') depth++;
          if (css[i] === '}' && --depth === 0) return css.slice(coarseStart, i + 1);
        }
        return '';
      })();
      const base = css.replace(coarse, '');

      it('gives every pointer a 24px zone, not 44px', () => {
        const rule = base.match(/\.ds-switch-track::after\s*\{([^}]*)\}/)?.[1] ?? '';
        expect(rule).toMatch(/width:\s*max\(100%, var\(--spacing-6\)\)/);
        expect(rule).toMatch(/height:\s*max\(100%, var\(--spacing-6\)\)/);
        expect(base).not.toContain('--size-hit-area');
      });

      it('grows to 44px on coarse pointers, with a 44px row so stacked switches never overlap', () => {
        expect(coarseStart).toBeGreaterThan(-1);
        expect(coarse).toMatch(/\.ds-switch-track::after\s*\{[^}]*height:\s*max\(100%, var\(--size-hit-area\)\)/);
        expect(coarse).toMatch(/\.ds-switch-field\s*\{[^}]*min-height:\s*var\(--size-hit-area\)/);
      });
    });
  });
});
