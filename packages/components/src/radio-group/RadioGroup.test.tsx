import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

function ShippingOptions(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup label="Shipping method" {...props}>
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express" />
      <RadioGroupItem value="overnight" label="Overnight" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('renders a radiogroup', () => {
    render(<ShippingOptions />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders one radio per item', () => {
    render(<ShippingOptions />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('names the group via its label', () => {
    render(<ShippingOptions />);
    expect(screen.getByRole('radiogroup', { name: 'Shipping method' })).toBeInTheDocument();
  });

  it('associates item labels with radios', () => {
    render(<ShippingOptions />);
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeInTheDocument();
  });

  it('renders item description and associates it via aria-describedby', () => {
    render(
      <RadioGroup label="Shipping method">
        <RadioGroupItem value="standard" label="Standard" description="4–7 business days" />
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Standard' });
    const descriptionId = radio.getAttribute('aria-describedby');
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toHaveTextContent('4–7 business days');
  });

  it('renders group hint text', () => {
    render(<ShippingOptions hint="Delivery times exclude weekends" />);
    expect(screen.getByText('Delivery times exclude weekends')).toBeInTheDocument();
  });

  it('renders group error with role alert', () => {
    render(<ShippingOptions error="Please choose a shipping method" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Please choose a shipping method');
  });

  it('hides hint when error is present', () => {
    render(<ShippingOptions hint="Pick one" error="Required" />);
    expect(screen.queryByText('Pick one')).not.toBeInTheDocument();
  });

  it('sets aria-invalid on the group when error is present', () => {
    render(<ShippingOptions error="Required" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  it('respects defaultValue', () => {
    render(<ShippingOptions defaultValue="express" />);
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
  });

  it('selects an item by clicking its label', async () => {
    const user = userEvent.setup();
    render(<ShippingOptions />);
    await user.click(screen.getByText('Express'));
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
  });

  it('fires onValueChange when a selection is made', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ShippingOptions onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'Overnight' }));
    expect(onValueChange).toHaveBeenCalledWith('overnight');
  });

  it('moves focus with arrow keys', async () => {
    const user = userEvent.setup();
    render(<ShippingOptions defaultValue="standard" />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveFocus();
  });

  // Regression (keyboard audit): orientation was handed to Radix's roving
  // focus, which then ignored Left/Right in a vertical group (and Up/Down in
  // a horizontal one). Native radios and the APG radio pattern use all four.
  it('moves on both arrow pairs whatever the orientation', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ShippingOptions defaultValue="standard" />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveFocus();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'vertical');
    unmount();

    render(<ShippingOptions defaultValue="standard" orientation="horizontal" />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveFocus();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('disables all items when the group is disabled', () => {
    render(<ShippingOptions disabled />);
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  // Regression (visual QA): an item-level `disabled` looked identical to
  // its enabled siblings — only the group-level prop had a dimmed style.
  it('marks a single disabled item so it can be styled as disabled', () => {
    render(
      <RadioGroup label="Shipping method" defaultValue="standard">
        <RadioGroupItem value="standard" label="Standard" />
        <RadioGroupItem value="overnight" label="Overnight" disabled />
      </RadioGroup>,
    );
    const overnight = screen.getByRole('radio', { name: 'Overnight' });
    const standard = screen.getByRole('radio', { name: 'Standard' });
    expect(overnight).toBeDisabled();
    expect(overnight.closest('.ds-radio-item')).toHaveClass('ds-radio-item--disabled');
    expect(standard.closest('.ds-radio-item')).not.toHaveClass('ds-radio-item--disabled');
  });

  it('does not fire onValueChange when disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ShippingOptions disabled onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'Standard' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies size class to items', () => {
    render(
      <RadioGroup label="Sizes" size="sm">
        <RadioGroupItem value="a" label="Option A" />
      </RadioGroup>,
    );
    expect(document.querySelector('.ds-radio-item-circle--sm')).toBeInTheDocument();
  });

  it('sets orientation on the group', () => {
    render(<ShippingOptions orientation="horizontal" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <RadioGroup label="Shipping method" defaultValue="standard">
          <RadioGroupItem value="standard" label="Standard" description="4–7 business days" />
          <RadioGroupItem value="express" label="Express" description="1–2 business days" />
        </RadioGroup>
        <RadioGroup label="Billing" error="Please choose a billing option">
          <RadioGroupItem value="card" label="Card" />
          <RadioGroupItem value="paypal" label="PayPal" />
        </RadioGroup>
        <RadioGroup label="Frequency" disabled>
          <RadioGroupItem value="weekly" label="Weekly" />
        </RadioGroup>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });


  // ─── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    it('aria-describedby never points at the hidden hint while an error shows', () => {
      render(
        <RadioGroup label="Shipping" hint="Pick one" error="Required">
          <RadioGroupItem value="a" label="A" />
        </RadioGroup>);
      const ids = (screen.getByRole('radiogroup').getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(document.getElementById(id), `dangling id ${id}`).not.toBeNull();
    });
  });

  // Regression: excluding error circles from hover raised the hover rule to
  // 0-4-0, above the 0-3-0 press rule, so a mouse press (also a hover) never
  // showed the pressed edge. jsdom has no :hover/:active, so the cascade is
  // checked in source: press rules match hover's weight and come after it.
  it('orders the pressed edge after both hover rules', () => {
    const css = readFileSync(resolve(__dirname, 'RadioGroup.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const lastHover = css.lastIndexOf(':hover:not([data-disabled])');
    const press = css.indexOf('.ds-radio-item-circle:active:not([data-disabled]):not(.ds-radio-item-circle--error) {');
    const checkedPress = css.indexOf('.ds-radio-item-circle[data-state="checked"]:active:not([data-disabled])');
    expect(lastHover).toBeGreaterThan(-1);
    expect(press).toBeGreaterThan(lastHover);
    expect(checkedPress).toBeGreaterThan(lastHover);
  });

  // Regression: every pointer got a 44px zone on a 21px circle, and stacked
  // options sit 31–33px apart, so each zone overlapped its neighbour's by
  // 11–13px (measured in the workbench). Now 24px for every pointer; 44px
  // only on coarse pointers, where the row grows to 44px so zones stay in
  // their own row. jsdom has no layout, so the rules are checked in source.
  describe('hit area', () => {
    const css = readFileSync(resolve(__dirname, 'RadioGroup.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
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
      const rule = base.match(/\.ds-radio-item-circle::after\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(rule).toMatch(/width:\s*max\(100%, var\(--spacing-6\)\)/);
      expect(rule).toMatch(/height:\s*max\(100%, var\(--spacing-6\)\)/);
      expect(base).not.toContain('--size-hit-area');
    });

    it('grows to 44px on coarse pointers, with 44px rows so stacked zones never overlap', () => {
      expect(coarseStart).toBeGreaterThan(-1);
      expect(coarse).toMatch(/\.ds-radio-item-circle::after\s*\{[^}]*height:\s*max\(100%, var\(--size-hit-area\)\)/);
      expect(coarse).toMatch(/\.ds-radio-item-field\s*\{[^}]*min-height:\s*var\(--size-hit-area\)/);
    });
  });
});
