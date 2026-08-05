import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { VariantSelector } from './VariantSelector';
import type { VariantOption } from './VariantSelector';

expect.extend(toHaveNoViolations);

const sizeOption: VariantOption = {
  name: 'Size',
  type: 'button',
  values: [
    { label: 'S', value: 's' },
    { label: 'M', value: 'm' },
    { label: 'L', value: 'l' },
    { label: 'XL', value: 'xl' },
  ],
};

const colorOption: VariantOption = {
  name: 'Color',
  type: 'color',
  values: [
    { label: 'Black', value: 'black', colorHex: '#000000' },
    { label: 'White', value: 'white', colorHex: '#FFFFFF' },
    { label: 'Navy', value: 'navy', colorHex: '#1B2A4A' },
  ],
};

const defaultProps = {
  options: [colorOption, sizeOption],
  selectedValues: { Color: 'black', Size: 'm' },
  onValueChange: vi.fn(),
};

describe('VariantSelector', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<VariantSelector {...defaultProps} />);
      expect(screen.getByText('Color')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
    });

    it('renders correct root element with BEM classes', () => {
      const { container } = render(<VariantSelector {...defaultProps} />);
      const root = container.firstElementChild;
      expect(root).toHaveClass('ds-variant-selector', 'ds-variant-selector--md');
    });

    it('applies size class', () => {
      const { container } = render(<VariantSelector {...defaultProps} size="sm" />);
      expect(container.firstElementChild).toHaveClass('ds-variant-selector--sm');
    });

    it('merges custom className', () => {
      const { container } = render(
        <VariantSelector {...defaultProps} className="custom" />,
      );
      expect(container.firstElementChild).toHaveClass('ds-variant-selector', 'custom');
    });

    it('displays selected value label next to option name', () => {
      render(<VariantSelector {...defaultProps} />);
      expect(screen.getByText(': M')).toBeInTheDocument();
      expect(screen.getByText(': Black')).toBeInTheDocument();
    });
  });

  describe('button options', () => {
    it('renders button-type options with radio roles', () => {
      render(<VariantSelector {...defaultProps} />);
      const sizeGroup = screen.getByRole('radiogroup', { name: 'Size' });
      const radios = within(sizeGroup).getAllByRole('radio');
      expect(radios).toHaveLength(4);
    });

    it('marks selected value as checked', () => {
      render(<VariantSelector {...defaultProps} />);
      const mButton = screen.getByRole('radio', { name: 'M' });
      expect(mButton).toHaveAttribute('aria-checked', 'true');
    });

    it('applies selected class to active option', () => {
      render(<VariantSelector {...defaultProps} />);
      const mButton = screen.getByRole('radio', { name: 'M' });
      expect(mButton).toHaveClass('ds-variant-selector__option--selected');
    });

    it('fires onValueChange on click', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<VariantSelector {...defaultProps} onValueChange={onValueChange} />);
      await user.click(screen.getByRole('radio', { name: 'L' }));
      expect(onValueChange).toHaveBeenCalledWith('Size', 'l');
    });
  });

  describe('color options', () => {
    it('renders color-type options using ColorPicker', () => {
      render(<VariantSelector {...defaultProps} />);
      const colorGroup = screen.getAllByRole('radiogroup')[0];
      expect(colorGroup).toHaveAttribute('aria-label', 'Color');
    });
  });

  describe('unavailable state', () => {
    it('renders unavailable options with strikethrough and modified aria-label', () => {
      const unavailableOption: VariantOption = {
        name: 'Size',
        type: 'button',
        values: [
          { label: 'S', value: 's', available: false },
          { label: 'M', value: 'm' },
        ],
      };
      render(
        <VariantSelector
          options={[unavailableOption]}
          selectedValues={{ Size: 'm' }}
          onValueChange={vi.fn()}
        />,
      );
      const sButton = screen.getByRole('radio', { name: 'S (out of stock)' });
      expect(sButton).toHaveClass('ds-variant-selector__option--unavailable');
      expect(sButton).not.toBeDisabled();
    });
  });

  describe('unavailable color swatches', () => {
    it('exposes the out-of-stock suffix the CSS strikethrough hooks onto', () => {
      const colorWithStock: VariantOption = {
        name: 'Color',
        type: 'color',
        values: [
          { label: 'Black', value: 'black', colorHex: '#000000' },
          { label: 'White', value: 'white', colorHex: '#FFFFFF', available: false },
        ],
      };
      const { container } = render(
        <VariantSelector
          options={[colorWithStock]}
          selectedValues={{ Color: 'black' }}
          onValueChange={vi.fn()}
        />,
      );
      // VariantSelector.css draws the diagonal slash via this attribute selector
      expect(
        container.querySelector('.ds-color-picker__btn[aria-label$="(out of stock)"]'),
      ).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'White (out of stock)' })).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables fully disabled options', () => {
      const disabledOption: VariantOption = {
        name: 'Size',
        type: 'button',
        values: [
          { label: 'S', value: 's', disabled: true },
          { label: 'M', value: 'm' },
        ],
      };
      render(
        <VariantSelector
          options={[disabledOption]}
          selectedValues={{ Size: 'm' }}
          onValueChange={vi.fn()}
        />,
      );
      expect(screen.getByRole('radio', { name: 'S' })).toBeDisabled();
    });

    it('does not fire onValueChange for disabled options', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const disabledOption: VariantOption = {
        name: 'Size',
        type: 'button',
        values: [
          { label: 'S', value: 's', disabled: true },
          { label: 'M', value: 'm' },
        ],
      };
      render(
        <VariantSelector
          options={[disabledOption]}
          selectedValues={{ Size: 'm' }}
          onValueChange={onValueChange}
        />,
      );
      await user.click(screen.getByRole('radio', { name: 'S' }));
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates between button options with arrow keys', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <VariantSelector
          options={[sizeOption]}
          selectedValues={{ Size: 'm' }}
          onValueChange={onValueChange}
        />,
      );
      const mButton = screen.getByRole('radio', { name: 'M' });
      mButton.focus();
      await user.keyboard('{ArrowRight}');
      expect(onValueChange).toHaveBeenCalledWith('Size', 'l');
    });

    it('wraps around when reaching the end', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <VariantSelector
          options={[sizeOption]}
          selectedValues={{ Size: 'xl' }}
          onValueChange={onValueChange}
        />,
      );
      const xlButton = screen.getByRole('radio', { name: 'XL' });
      xlButton.focus();
      await user.keyboard('{ArrowRight}');
      expect(onValueChange).toHaveBeenCalledWith('Size', 's');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<VariantSelector {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('edge cases', () => {
    it('renders single option value', () => {
      const singleOption: VariantOption = {
        name: 'Style',
        type: 'button',
        values: [{ label: 'Classic', value: 'classic' }],
      };
      render(
        <VariantSelector
          options={[singleOption]}
          selectedValues={{ Style: 'classic' }}
          onValueChange={vi.fn()}
        />,
      );
      expect(screen.getByRole('radio', { name: 'Classic' })).toBeInTheDocument();
    });

    it('handles missing selectedValue gracefully', () => {
      render(
        <VariantSelector
          options={[sizeOption]}
          selectedValues={{}}
          onValueChange={vi.fn()}
        />,
      );
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-checked', 'false');
      });
    });
  });
});
