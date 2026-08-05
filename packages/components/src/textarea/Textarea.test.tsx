import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  describe('label', () => {
    it('renders a visible label', () => {
      render(<Textarea label="Order notes" />);
      expect(screen.getByText('Order notes')).toBeInTheDocument();
    });

    it('associates label with textarea via htmlFor', () => {
      render(<Textarea label="Order notes" />);
      const textarea = screen.getByRole('textbox');
      const label = screen.getByText('Order notes');
      expect(label).toHaveAttribute('for', textarea.id);
    });

    it('respects an explicit id', () => {
      render(<Textarea label="Order notes" id="notes-field" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'notes-field');
    });
  });

  describe('hint', () => {
    it('renders hint text', () => {
      render(<Textarea hint="Printed on the packing slip" />);
      expect(screen.getByText('Printed on the packing slip')).toBeInTheDocument();
    });

    it('associates hint via aria-describedby', () => {
      render(<Textarea hint="Helper text" />);
      const textarea = screen.getByRole('textbox');
      const hintId = textarea.getAttribute('aria-describedby');
      expect(hintId).toBeTruthy();
      expect(document.getElementById(hintId!)).toHaveTextContent('Helper text');
    });
  });

  describe('error state', () => {
    it('renders error message', () => {
      render(<Textarea error="Required field" />);
      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('sets aria-invalid when error is present', () => {
      render(<Textarea error="Required field" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('hides hint when error is shown', () => {
      render(<Textarea hint="Helper" error="Error" />);
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('error message has role=alert', () => {
      render(<Textarea error="Something went wrong" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    });
  });

  describe('typing', () => {
    it('accepts typed input', async () => {
      const user = userEvent.setup();
      render(<Textarea label="Gift message" />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Happy birthday!');
      expect(textarea).toHaveValue('Happy birthday!');
    });
  });

  describe('rows', () => {
    it('defaults to 4 rows', () => {
      render(<Textarea label="Notes" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
    });

    it('respects an explicit rows value', () => {
      render(<Textarea label="Notes" rows={8} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8');
    });
  });

  describe('autoResize', () => {
    it('applies the auto-resize class', () => {
      render(<Textarea label="Notes" autoResize />);
      expect(screen.getByRole('textbox')).toHaveClass('ds-textarea-field--auto-resize');
    });

    it('does not break typing when autoResize is on', async () => {
      const user = userEvent.setup();
      render(<Textarea label="Notes" autoResize />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'line one{enter}line two');
      expect(textarea).toHaveValue('line one\nline two');
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is set', () => {
      render(<Textarea disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('required', () => {
    it('marks textarea as required', () => {
      render(<Textarea required label="Message" />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });
  });

  describe('accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Textarea label="Order notes" hint="Optional delivery instructions" />
          <Textarea label="Gift message" required />
          <Textarea label="Review" error="Please write at least 20 characters" />
          <Textarea label="Archived note" disabled />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
