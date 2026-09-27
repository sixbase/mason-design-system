import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

// Radix Tooltip renders content in a portal and duplicates it in a
// visually-hidden live region — prefer role queries and getAllBy* variants.

describe('Tooltip', () => {
  it('renders the trigger', () => {
    render(
      <Tooltip content="More info">
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
  });

  it('does not show content until triggered', () => {
    render(
      <Tooltip content="Hidden content">
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows content when the trigger receives keyboard focus', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Keyboard help" delayDuration={0}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('hides content when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Dismissable" delayDuration={0}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    await user.tab();
    await screen.findByRole('tooltip');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when opening', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tooltip content="Tracked" delayDuration={0} onOpenChange={onOpenChange}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    await user.tab();
    await screen.findByRole('tooltip');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders open by default with defaultOpen', async () => {
    render(
      <Tooltip content="Already open" defaultOpen>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('applies the ds-tooltip class to content', async () => {
    render(
      <Tooltip content="Styled" defaultOpen>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    await screen.findByRole('tooltip');
    // The visible (styled) content is the element carrying the class
    const visible = document.querySelector('.ds-tooltip');
    expect(visible).not.toBeNull();
  });

  it('forwards a custom className', async () => {
    render(
      <Tooltip content="Custom" defaultOpen className="custom-class">
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    await screen.findByRole('tooltip');
    const visible = document.querySelector('.ds-tooltip');
    expect(visible?.className).toContain('custom-class');
  });

  it('respects the side prop', async () => {
    render(
      <Tooltip content="Below" side="bottom" defaultOpen>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    await screen.findByRole('tooltip');
    const visible = document.querySelector('.ds-tooltip');
    expect(visible).toHaveAttribute('data-side', 'bottom');
  });

  // The tooltip portals to <body>; scanning `container` checked only the trigger.
  it('has no accessibility violations when open', async () => {
    const { baseElement } = render(
      <Tooltip content="Accessible tooltip" defaultOpen>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    await screen.findByRole('tooltip');
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('has no accessibility violations when closed', async () => {
    const { container } = render(
      <Tooltip content="Closed tooltip">
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
