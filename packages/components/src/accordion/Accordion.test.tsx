import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';

expect.extend(toHaveNoViolations);

describe('Accordion', () => {
  // ─── Base rendering ─────────────────────────────────────

  it('renders items with correct structure', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText('Section A')).toBeInTheDocument();
  });

  it('expands and collapses on trigger click', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByText('Section A');
    const content = container.querySelector('.ds-accordion__content')!;

    // Initially closed
    expect(content).toHaveAttribute('data-state', 'closed');

    await user.click(trigger);
    expect(content).toHaveAttribute('data-state', 'open');

    await user.click(trigger);
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('supports multiple mode', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple">
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Section B</AccordionTrigger>
          <AccordionContent>Content B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await user.click(screen.getByText('Section A'));
    await user.click(screen.getByText('Section B'));
    expect(screen.getByText('Content A')).toBeVisible();
    expect(screen.getByText('Content B')).toBeVisible();
  });

  it('applies size class', () => {
    const { container } = render(
      <Accordion type="single" size="lg">
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(container.querySelector('.ds-accordion--lg')).toBeInTheDocument();
  });

  it('applies flush class', () => {
    const { container } = render(
      <Accordion type="single" flush>
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(container.querySelector('.ds-accordion--flush')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // ─── Disabled item ──────────────────────────────────────

  describe('disabled item', () => {
    it('applies the disabled modifier class', () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a" disabled>
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(container.querySelector('.ds-accordion__item--disabled')).toBeInTheDocument();
    });

    it('disables the trigger button', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a" disabled>
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByText('Section A').closest('button')).toBeDisabled();
    });

    it('does not expand when a disabled trigger is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a" disabled>
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByText('Section A'));
      expect(container.querySelector('.ds-accordion__content')).toHaveAttribute(
        'data-state',
        'closed',
      );
    });

    it('leaves sibling items interactive', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a" disabled>
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Section B</AccordionTrigger>
            <AccordionContent>Content B</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByText('Section B'));
      const contents = container.querySelectorAll('.ds-accordion__content');
      expect(contents[1]).toHaveAttribute('data-state', 'open');
    });

    it('has no accessibility violations with a disabled item', async () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a" disabled>
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Section B</AccordionTrigger>
            <AccordionContent>Content B</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // ─── Checkbox variant ───────────────────────────────────

  describe('checkbox variant', () => {
    function CheckboxAccordion() {
      const [checked, setChecked] = useState(false);
      return (
        <Accordion type="multiple">
          <AccordionItem value="cookies">
            <AccordionTrigger
              checked={checked}
              onCheckedChange={(c) => setChecked(c === true)}
              checkboxLabel="Functional Cookies"
            >
              Functional Cookies
            </AccordionTrigger>
            <AccordionContent>These cookies enable enhanced functionality.</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    it('renders a checkbox when checked prop is provided', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger checked={false} checkboxLabel="Test">
              Section A
            </AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByRole('checkbox', { name: 'Test' })).toBeInTheDocument();
    });

    it('does not render a checkbox when checked prop is undefined', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('renders trigger-row wrapper when checkbox is present', () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger checked={false} checkboxLabel="Test">
              Section A
            </AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(container.querySelector('.ds-accordion__trigger-row')).toBeInTheDocument();
    });

    it('fires onCheckedChange when checkbox is clicked', async () => {
      const onCheckedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger
              checked={false}
              onCheckedChange={onCheckedChange}
              checkboxLabel="Functional"
            >
              Functional
            </AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByRole('checkbox', { name: 'Functional' }));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('does not expand accordion when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<CheckboxAccordion />);

      const checkbox = screen.getByRole('checkbox', { name: 'Functional Cookies' });
      await user.click(checkbox);

      // Content should still be closed (accordion not expanded)
      const content = container.querySelector('.ds-accordion__content')!;
      expect(content).toHaveAttribute('data-state', 'closed');
    });

    it('does not toggle checkbox when accordion trigger is clicked', async () => {
      const onCheckedChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger
              checked={false}
              onCheckedChange={onCheckedChange}
              checkboxLabel="Test"
            >
              Section A
            </AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      // Click on the trigger text, not the checkbox
      const triggerButton = screen.getByText('Section A').closest('button');
      await user.click(triggerButton!);

      // Checkbox should not have been toggled
      expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('respects checkboxDisabled prop', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger
              checked={true}
              checkboxDisabled
              checkboxLabel="Essential"
            >
              Essential Cookies
            </AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const checkbox = screen.getByRole('checkbox', { name: 'Essential' });
      expect(checkbox).toBeDisabled();
    });

    it('uses children text as checkbox label fallback', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger checked={false}>
              Performance Cookies
            </AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('checkbox', { name: 'Performance Cookies' })).toBeInTheDocument();
    });

    it('has no accessibility violations with checkbox variant', async () => {
      const { container } = render(
        <Accordion type="multiple">
          <AccordionItem value="essential">
            <AccordionTrigger checked={true} checkboxDisabled checkboxLabel="Essential">
              Essential Cookies
            </AccordionTrigger>
            <AccordionContent>Required cookies.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="functional">
            <AccordionTrigger checked={false} checkboxLabel="Functional">
              Functional Cookies
            </AccordionTrigger>
            <AccordionContent>Optional cookies.</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
