import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders a switch button', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders the label when provided', () => {
    render(<Switch label="Email notifications" />);
    expect(screen.getByText('Email notifications')).toBeInTheDocument();
  });

  it('associates label with switch', () => {
    render(<Switch label="Gift wrapping" />);
    expect(screen.getByRole('switch', { name: 'Gift wrapping' })).toBeInTheDocument();
  });

  it('renders hint text', () => {
    render(<Switch label="Gift wrapping" hint="Adds $5.00 at checkout" />);
    expect(screen.getByText('Adds $5.00 at checkout')).toBeInTheDocument();
  });

  it('associates hint via aria-describedby', () => {
    render(<Switch label="Gift wrapping" hint="Adds $5.00 at checkout" />);
    const switchEl = screen.getByRole('switch');
    const hintId = switchEl.getAttribute('aria-describedby');
    expect(hintId).toBeTruthy();
    expect(document.getElementById(hintId!)).toHaveTextContent('Adds $5.00 at checkout');
  });

  it('renders error with role alert', () => {
    render(<Switch label="Terms" error="You must enable this to continue" />);
    expect(screen.getByRole('alert')).toHaveTextContent('You must enable this to continue');
  });

  it('hides hint when error is present', () => {
    render(<Switch label="Terms" hint="Required" error="Must enable" />);
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Switch label="Terms" error="Required" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  it('is unchecked by default', () => {
    render(<Switch label="Option" />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('can be toggled by clicking the label', async () => {
    const user = userEvent.setup();
    render(<Switch label="Option" />);
    await user.click(screen.getByText('Option'));
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('fires onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Option" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('toggles with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Switch label="Option" />);
    const switchEl = screen.getByRole('switch');
    switchEl.focus();
    await user.keyboard(' ');
    expect(switchEl).toBeChecked();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Switch label="Option" disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('does not fire onCheckedChange when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Option" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('applies size class', () => {
    render(<Switch size="sm" label="Small" />);
    expect(document.querySelector('.ds-switch-track--sm')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Switch label="Email notifications" />
        <Switch label="Gift wrapping" hint="Adds $5.00 at checkout" />
        <Switch label="Terms" error="You must enable this to continue" />
        <Switch label="Disabled" disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
