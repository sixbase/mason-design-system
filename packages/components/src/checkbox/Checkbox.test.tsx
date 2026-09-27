import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Checkbox', () => {
  it('renders a checkbox button', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders the label when provided', () => {
    render(<Checkbox label="Remember me" />);
    expect(screen.getByText('Remember me')).toBeInTheDocument();
  });

  it('associates label with checkbox', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
  });

  it('renders hint text', () => {
    render(<Checkbox label="Newsletter" hint="We send at most one email per week" />);
    expect(screen.getByText('We send at most one email per week')).toBeInTheDocument();
  });

  it('renders error with role alert', () => {
    render(<Checkbox label="Terms" error="You must accept the terms" />);
    expect(screen.getByRole('alert')).toHaveTextContent('You must accept the terms');
  });

  it('hides hint when error is present', () => {
    render(<Checkbox label="Terms" hint="Required" error="Must accept" />);
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Checkbox label="Terms" error="Required" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('is unchecked by default', () => {
    render(<Checkbox label="Option" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('can be checked by clicking the label', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Option" />);
    await user.click(screen.getByText('Option'));
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('fires onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Option" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Checkbox label="Option" disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('does not fire onCheckedChange when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Option" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('applies size class', () => {
    render(<Checkbox size="sm" label="Small" />);
    expect(document.querySelector('.ds-checkbox-box--sm')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Checkbox label="Remember me" />
        <Checkbox label="Newsletter" hint="Weekly digest" />
        <Checkbox label="Terms" error="You must accept the terms" />
        <Checkbox label="Disabled" disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });


  // ─── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    it('aria-describedby never points at the hidden hint while an error shows', () => {
      render(<Checkbox label="Terms" hint="Read them" error="Must accept" />);
      const ids = (screen.getByRole('checkbox').getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(document.getElementById(id), `dangling id ${id}`).not.toBeNull();
    });

    describe('with component CSS', () => {
      let style: HTMLStyleElement;
      beforeEach(() => {
        style = document.createElement('style');
        style.textContent = readFileSync(resolve(__dirname, 'Checkbox.css'), 'utf8');
        document.head.appendChild(style);
      });
      afterEach(() => style.remove());

      it('sm hint is indented to the 13px sm box, not the md box', () => {
        render(<Checkbox size="sm" label="Small" hint="Hint" />);
        const cs = getComputedStyle(screen.getByText('Hint'));
        expect(cs.paddingInlineStart || cs.paddingLeft).toContain('--size-checkbox-sm');
      });

      // The dash used to be a ::before background, which forced-colors mode
      // repaints to the canvas colour — indeterminate looked unchecked.
      it('indeterminate shows a stroked dash glyph and hides the check', () => {
        const { container } = render(<Checkbox label="All" checked="indeterminate" />);
        const dash = container.querySelector('.ds-checkbox-icon--dash');
        const check = container.querySelector('.ds-checkbox-icon--check');
        expect(dash).not.toBeNull();
        expect(getComputedStyle(dash!).display).not.toBe('none');
        expect(getComputedStyle(check!).display).toBe('none');
      });

      it('checked shows the check and hides the dash', () => {
        const { container } = render(<Checkbox label="One" checked />);
        expect(getComputedStyle(container.querySelector('.ds-checkbox-icon--dash')!).display).toBe('none');
        expect(getComputedStyle(container.querySelector('.ds-checkbox-icon--check')!).display).not.toBe('none');
      });
    });
  });

  // Regression: excluding error boxes from hover raised the hover rule to
  // 0-4-0, above the 0-3-0 press rule, so a mouse press (also a hover) never
  // showed the pressed edge. jsdom has no :hover/:active, so the cascade is
  // checked in source: press rules match hover's weight and come after it.
  it('orders the pressed edge after both hover rules', () => {
    const css = readFileSync(resolve(__dirname, 'Checkbox.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const lastHover = css.lastIndexOf(':hover:not([data-disabled])');
    const press = css.indexOf('.ds-checkbox-box:active:not([data-disabled]):not(.ds-checkbox-box--error) {');
    const checkedPress = css.indexOf('.ds-checkbox-box[data-state="checked"]:active:not([data-disabled])');
    expect(lastHover).toBeGreaterThan(-1);
    expect(press).toBeGreaterThan(lastHover);
    expect(checkedPress).toBeGreaterThan(lastHover);
  });
});
