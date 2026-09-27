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

    // The item is a role-less div: aria-disabled there is ignored by
    // assistive tech. The disabled trigger button carries the state.
    it('puts the disabled state on the trigger, not as aria-disabled on the role-less item', () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a" disabled>
            <AccordionTrigger>Section A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      const item = container.querySelector('.ds-accordion__item');
      expect(item).not.toHaveAttribute('role');
      expect(item).not.toHaveAttribute('aria-disabled');
      expect(screen.getByRole('button', { name: 'Section A' })).toBeDisabled();
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

  // ── Regressions (QA break pass) ─────────────────────────

  describe('heading level', () => {
    it('renders item headers as h3 by default', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>Ships in 2 days.</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByRole('heading', { level: 3, name: 'Shipping' })).toHaveClass(
        'ds-accordion__header',
      );
    });

    it('renders headers at the level set on the root (checkbox variant too)', () => {
      render(
        <Accordion type="multiple" headingLevel={2}>
          <AccordionItem value="a">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>Ships in 2 days.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger checked={false}>Marketing</AccordionTrigger>
            <AccordionContent>Optional.</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByRole('heading', { level: 2, name: 'Shipping' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Marketing' })).toBeInTheDocument();
    });

    // The checkbox used to sit inside the heading, so the heading's name
    // was "Functional Cookies Functional Cookies".
    it('reads the checkbox variant heading name once, with the checkbox beside it', () => {
      render(
        <Accordion type="multiple">
          <AccordionItem value="functional">
            <AccordionTrigger checked={false}>Functional Cookies</AccordionTrigger>
            <AccordionContent>Remembers your preferences.</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      const heading = screen.getByRole('heading', { level: 3, name: 'Functional Cookies' });
      expect(within(heading).getByRole('button', { name: 'Functional Cookies' })).toBeInTheDocument();
      expect(within(heading).queryByRole('checkbox')).toBeNull();
      expect(screen.getByRole('checkbox', { name: 'Functional Cookies' })).toBeInTheDocument();
    });

    it('keeps each nested accordion at its own level', () => {
      render(
        <Accordion type="single" defaultValue="outer" headingLevel={2}>
          <AccordionItem value="outer">
            <AccordionTrigger>Outer</AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" defaultValue="inner" headingLevel={3}>
                <AccordionItem value="inner">
                  <AccordionTrigger>Inner</AccordionTrigger>
                  <AccordionContent>Inner content</AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByRole('heading', { level: 2, name: 'Outer' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Inner' })).toBeInTheDocument();
    });
  });

  it('applies the Trigger/Content size prop as a scoped modifier class', () => {
    // The prop was typed and documented but did nothing.
    const { container } = render(
      <Accordion type="single" defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger size="sm">Care</AccordionTrigger>
          <AccordionContent size="sm">Hand wash only.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: 'Care' })).toHaveClass('ds-accordion__trigger--sm');
    expect(container.querySelector('.ds-accordion__content')).toHaveClass(
      'ds-accordion__content--sm',
    );
  });

  // Regression: the content fade played on page load too, so panels open by
  // default (the first filter groups, a PDP details panel) were invisible
  // for a beat and then faded in. Only a panel opened later fades.
  it('fades in only panels opened after the first render', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple" defaultValue={['a']}>
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
    expect(screen.getByText('Content A')).toHaveClass('ds-accordion__content-inner');
    expect(screen.getByText('Content A')).not.toHaveClass('ds-accordion__content-inner--enter');

    await user.click(screen.getByRole('button', { name: 'Section B' }));
    expect(screen.getByText('Content B')).toHaveClass('ds-accordion__content-inner--enter');

    // Closing and reopening a panel that started open fades it too.
    await user.click(screen.getByRole('button', { name: 'Section A' }));
    await user.click(screen.getByRole('button', { name: 'Section A' }));
    expect(screen.getByText('Content A')).toHaveClass('ds-accordion__content-inner--enter');
  });
});
