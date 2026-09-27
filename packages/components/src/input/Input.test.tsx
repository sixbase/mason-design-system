import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  describe('label', () => {
    it('renders a visible label', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('associates label with input via htmlFor', () => {
      render(<Input label="Email" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', input.id);
    });

    it('respects an explicit id', () => {
      render(<Input label="Email" id="email-field" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email-field');
    });
  });

  describe('size', () => {
    it('defaults to md', () => {
      render(<Input aria-label="Email" />);
      expect(screen.getByRole('textbox')).toHaveClass('ds-input-field--md');
    });

    it.each(['sm', 'lg'] as const)('applies the %s size class to the field', (size) => {
      render(<Input aria-label="Email" size={size} />);
      expect(screen.getByRole('textbox')).toHaveClass(`ds-input-field--${size}`);
    });
  });

  describe('ref and className', () => {
    it('forwards the ref and className to the <input> itself', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input label="Email" ref={ref} className="extra" />);
      const input = screen.getByRole('textbox');
      expect(ref.current).toBe(input);
      expect(input).toHaveClass('ds-input-field', 'extra');
    });
  });

  describe('trailingAdornment', () => {
    it('renders the trailing adornment hidden from assistive tech', () => {
      const { container } = render(<Input label="Price" trailingAdornment="USD" />);
      const adornment = container.querySelector('.ds-input-adornment--trailing');
      expect(adornment).toHaveTextContent('USD');
      expect(adornment).toHaveAttribute('aria-hidden', 'true');
      expect(container.querySelector('.ds-input-wrapper')).toHaveClass('ds-input-wrapper--trailing');
    });
  });

  describe('hint', () => {
    it('renders hint text', () => {
      render(<Input hint="We never share your email" />);
      expect(screen.getByText("We never share your email")).toBeInTheDocument();
    });

    it('associates hint via aria-describedby', () => {
      render(<Input hint="Helper text" />);
      const input = screen.getByRole('textbox');
      const hintId = input.getAttribute('aria-describedby');
      expect(hintId).toBeTruthy();
      expect(document.getElementById(hintId!)).toHaveTextContent('Helper text');
    });
  });

  describe('error state', () => {
    it('renders error message', () => {
      render(<Input error="Required field" />);
      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('sets aria-invalid when error is present', () => {
      render(<Input error="Required field" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('hides hint when error is shown', () => {
      render(<Input hint="Helper" error="Error" />);
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('error message has role=alert', () => {
      render(<Input error="Something went wrong" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is set', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('read-only state', () => {
    it('sets the readonly attribute', () => {
      render(<Input label="Order number" readOnly defaultValue="MS-1042" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('keeps the value when typing is attempted', async () => {
      const user = userEvent.setup();
      render(<Input label="Order number" readOnly defaultValue="MS-1042" />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'xyz');
      expect(input).toHaveValue('MS-1042');
    });
  });

  describe('required', () => {
    it('marks input as required', () => {
      render(<Input required label="Name" />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });
  });

  describe('adornments', () => {
    it('renders leading adornment, hidden from assistive tech', () => {
      render(<Input leadingAdornment={<span data-testid="icon" />} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders trailing adornment', () => {
      render(<Input trailingAdornment={<span data-testid="icon" />} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Input label="Email" hint="We never share your email" />
          <Input label="Name" required />
          <Input label="Postal code" error="Required field" />
          <Input label="Company" disabled />
          <Input label="Order number" readOnly defaultValue="MS-1042" />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });


  // ─── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    it('aria-describedby never points at the hidden hint while an error shows', () => {
      render(<Input label="Email" hint="We never share it" error="Required" />);
      const ids = (screen.getByRole('textbox').getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(document.getElementById(id), `dangling id ${id}`).not.toBeNull();
    });

    it('merges a consumer aria-describedby instead of dropping the error link', () => {
      render(
        <>
          <span id="extra">Extra</span>
          <Input label="Email" error="Required" aria-describedby="extra" />
        </>,
      );
      const ids = screen.getByRole('textbox').getAttribute('aria-describedby') ?? '';
      expect(ids).toContain('extra');
      expect(ids).toMatch(/-error/);
    });
  });
});
