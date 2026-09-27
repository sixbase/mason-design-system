import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDevWarnings } from '../internal/dev-warning';
import { Select, SelectItem, SelectGroup, SelectSeparator } from './Select';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Radix Select uses portals — wrap in a container that supports them
function SizeSelect(props: { error?: string; hint?: string; label?: string; disabled?: boolean }) {
  return (
    <Select label={props.label} hint={props.hint} error={props.error} disabled={props.disabled}>
      <SelectItem value="xs">XS</SelectItem>
      <SelectItem value="sm">SM</SelectItem>
      <SelectItem value="md">MD</SelectItem>
      <SelectItem value="lg">LG</SelectItem>
    </Select>
  );
}

describe('Select', () => {
  it('renders a trigger button', () => {
    render(<SizeSelect />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders the label when provided', () => {
    render(<SizeSelect label="Size" />);
    expect(screen.getByText('Size')).toBeInTheDocument();
  });

  it('wraps the value in the truncating .ds-select-value span (Radix drops className on Select.Value)', () => {
    render(
      <Select placeholder="Versandkostenfreigrenze überschritten — bitte wählen" aria-label="Versand">
        <SelectItem value="a">A</SelectItem>
      </Select>,
    );
    const value = screen.getByRole('combobox').querySelector('.ds-select-value');
    // Was: the class was passed to Radix and silently discarded, so long
    // localized values pushed the chevron outside the trigger.
    expect(value).not.toBeNull();
    expect(value).toHaveTextContent('Versandkostenfreigrenze');
  });

  it('renders hint text when provided', () => {
    render(<SizeSelect hint="Choose your size" />);
    expect(screen.getByText('Choose your size')).toBeInTheDocument();
  });

  it('renders error message with role alert', () => {
    render(<SizeSelect error="Please select a size" />);
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Please select a size');
  });

  it('does not render hint when error is present', () => {
    render(<SizeSelect hint="Helper text" error="Error message" />);
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('sets aria-invalid on trigger when error is present', () => {
    render(<SizeSelect error="Required" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables trigger when disabled prop is set', () => {
    render(<SizeSelect disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies error class to trigger', () => {
    render(<SizeSelect error="Error" />);
    expect(screen.getByRole('combobox')).toHaveClass('ds-select-trigger--error');
  });

  it('applies size class', () => {
    render(
      <Select size="sm">
        <SelectItem value="a">A</SelectItem>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toHaveClass('ds-select-trigger--sm');
  });

  it('applies full-width class', () => {
    render(
      <Select fullWidth>
        <SelectItem value="a">A</SelectItem>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toHaveClass('ds-select-trigger--full-width');
  });

  // Opened, so the portalled list exists — the old version only checked the
  // trigger, and passed with the group label deleted.
  it('renders SelectGroup with label', () => {
    render(
      <Select label="Garment" defaultOpen>
        <SelectGroup label="Tops">
          <SelectItem value="shirt">Shirt</SelectItem>
        </SelectGroup>
      </Select>,
    );
    expect(screen.getByRole('group', { name: 'Tops' })).toBeInTheDocument();
  });

  it('renders SelectSeparator without crashing', () => {
    render(
      <Select>
        <SelectItem value="a">A</SelectItem>
        <SelectSeparator />
        <SelectItem value="b">B</SelectItem>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Select label="Size" defaultValue="md">
          <SelectItem value="sm">SM</SelectItem>
          <SelectItem value="md">MD</SelectItem>
          <SelectItem value="lg">LG</SelectItem>
        </Select>
        <SizeSelect label="Quantity" error="Please select a quantity" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });


  // ─── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    it('links the error to the trigger via aria-describedby', () => {
      render(<SizeSelect label="Size" error="Pick a size" />);
      expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Pick a size');
    });

    it('links the hint to the trigger via aria-describedby', () => {
      render(<SizeSelect label="Size" hint="Runs small" />);
      expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Runs small');
    });

    // Same bug as Input: the hint is hidden while an error shows, and its id
    // must leave aria-describedby with it.
    it('aria-describedby never points at the hidden hint while an error shows', () => {
      render(<SizeSelect label="Size" hint="Runs small" error="Pick a size" />);
      const ids = (screen.getByRole('combobox').getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(document.getElementById(id), `dangling id ${id}`).not.toBeNull();
    });

    // A combobox never takes its name from its content — without this a
    // label-less toolbar select was unnamed (axe button-name, critical).
    it('forwards aria-label to the trigger when there is no visible label', async () => {
      const { container } = render(
        <Select aria-label="Sort by">
          <SelectItem value="a">A</SelectItem>
        </Select>,
      );
      expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('forwards aria-labelledby to the trigger', () => {
      render(
        <>
          <span id="size-label">Device size</span>
          <Select aria-labelledby="size-label">
            <SelectItem value="a">A</SelectItem>
          </Select>
        </>,
      );
      expect(screen.getByRole('combobox', { name: 'Device size' })).toBeInTheDocument();
    });

    // Radix sets data-placeholder on the trigger itself; the old descendant
    // selector never matched, so the placeholder looked like a chosen value.
    it('styles the placeholder (selector matches the Radix DOM)', () => {
      const style = document.createElement('style');
      style.textContent = readFileSync(resolve(__dirname, 'Select.css'), 'utf8');
      document.head.appendChild(style);
      try {
        render(<SizeSelect label="Size" />);
        expect(getComputedStyle(screen.getByRole('combobox')).color).toBe(
          'var(--color-foreground-secondary)',
        );
      } finally {
        style.remove();
      }
    });
  });

  describe('placeholder', () => {
    it('shows the default placeholder when nothing is selected', () => {
      render(<SizeSelect label="Size" />);
      expect(screen.getByRole('combobox')).toHaveTextContent('Select an option');
    });

    it('shows a custom placeholder', () => {
      render(
        <Select label="Size" placeholder="Choose a size">
          <SelectItem value="m">M</SelectItem>
        </Select>,
      );
      expect(screen.getByRole('combobox')).toHaveTextContent('Choose a size');
    });
  });

  describe('fullWidth', () => {
    it('adds the full-width modifier to the root and the trigger', () => {
      const { container } = render(
        <Select label="Size" fullWidth>
          <SelectItem value="m">M</SelectItem>
        </Select>,
      );
      expect(container.querySelector('.ds-select-root')).toHaveClass('ds-select-root--full-width');
      expect(screen.getByRole('combobox')).toHaveClass('ds-select-trigger--full-width');
    });
  });

  describe('dev warnings', () => {
    beforeEach(() => resetDevWarnings());

    it('warns when the select has no accessible name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<SizeSelect />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Select: pass `label`'));
      warn.mockRestore();
    });

    it('stays quiet with a label or aria-label', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <>
          <SizeSelect label="Size" />
          <Select aria-label="Sort by">
            <SelectItem value="new">Newest</SelectItem>
          </Select>
        </>,
      );
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });
});
