import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
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

    it('passes rows to CSS as the minimum height, keeping the consumer style', () => {
      render(<Textarea label="Notes" autoResize rows={2} style={{ maxHeight: 'var(--spacing-64)' }} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea.style.getPropertyValue('--textarea-rows')).toBe('2');
      expect(textarea.style.maxHeight).toBe('var(--spacing-64)');
    });

    it('sets no rows property when autoResize is off', () => {
      render(<Textarea label="Notes" rows={2} />);
      expect(screen.getByRole('textbox').style.getPropertyValue('--textarea-rows')).toBe('');
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


  // ─── Regressions (QA break pass) ─────────────────────────

  describe('regressions', () => {
    it('aria-describedby never points at the hidden hint while an error shows', () => {
      render(<Textarea label="Notes" hint="Optional" error="Too short" />);
      const ids = (screen.getByRole('textbox').getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(document.getElementById(id), `dangling id ${id}`).not.toBeNull();
    });

    // jsdom has no field-sizing support, so the JS fallback path is active.
    function mockScrollHeight(get: () => number) {
      const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get });
      return () => {
        if (original) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', original);
      };
    }

    it('autoResize fallback sizes a pre-filled field on mount (was clipped at rows height)', () => {
      const restore = mockScrollHeight(() => 240);
      try {
        render(<Textarea label="Notes" autoResize defaultValue={'line\n'.repeat(8)} />);
        expect(screen.getByRole('textbox').style.height).toBe('240px');
      } finally {
        restore();
      }
    });

    it('autoResize fallback follows a controlled value set by the parent', () => {
      let height = 240;
      const restore = mockScrollHeight(() => height);
      try {
        const { rerender } = render(
          <Textarea label="Notes" autoResize value={'long\n'.repeat(10)} onChange={() => {}} />,
        );
        height = 80;
        rerender(<Textarea label="Notes" autoResize value="" onChange={() => {}} />);
        expect(screen.getByRole('textbox').style.height).toBe('80px');
      } finally {
        restore();
      }
    });

    it('autoResize fallback adds the borders back (border-box field was 2px short in Firefox)', () => {
      const restoreScroll = mockScrollHeight(() => 121);
      const saved = ['offsetHeight', 'clientHeight'].map(
        (name) => [name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)] as const,
      );
      // 1px top + bottom border: offsetHeight − clientHeight = 2
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 60 });
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 58 });
      try {
        render(<Textarea label="Notes" autoResize defaultValue={'line\n'.repeat(5)} />);
        expect(screen.getByRole('textbox').style.height).toBe('123px');
      } finally {
        restoreScroll();
        saved.forEach(([name, desc]) => {
          if (desc) Object.defineProperty(HTMLElement.prototype, name, desc);
          else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
        });
      }
    });

    it('autoResize fallback measures once per keystroke in a controlled field (performance)', async () => {
      let reads = 0;
      const restore = mockScrollHeight(() => {
        reads += 1;
        return 120;
      });
      try {
        function Controlled() {
          const [text, setText] = useState('');
          return <Textarea label="Notes" autoResize value={text} onChange={(e) => setText(e.target.value)} />;
        }
        render(<Controlled />);
        const user = userEvent.setup();
        await user.click(screen.getByRole('textbox'));
        reads = 0;
        await user.keyboard('abcd');
        // Was 8: the input handler fitted, then the value effect fitted the
        // same text again — two forced layouts per key.
        expect(reads).toBe(4);
        expect(screen.getByRole('textbox').style.height).toBe('120px');
      } finally {
        restore();
      }
    });
  });
});
