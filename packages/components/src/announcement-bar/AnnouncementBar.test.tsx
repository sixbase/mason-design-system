import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { AnnouncementBar } from './AnnouncementBar';

describe('AnnouncementBar', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <AnnouncementBar>Free shipping on orders over $50</AnnouncementBar>,
    );
    expect(container.querySelector('.ds-announcement-bar')).toBeInTheDocument();
  });

  it('renders as an aside element', () => {
    render(<AnnouncementBar>Free shipping</AnnouncementBar>);
    const el = screen.getByRole('region');
    expect(el.tagName).toBe('ASIDE');
  });

  it('has correct aria-label', () => {
    render(<AnnouncementBar>Free shipping</AnnouncementBar>);
    expect(screen.getByLabelText('Store announcement')).toBeInTheDocument();
  });

  it('renders message text', () => {
    render(<AnnouncementBar>Free shipping on orders over $50</AnnouncementBar>);
    expect(screen.getByText('Free shipping on orders over $50')).toBeInTheDocument();
  });

  it('renders message as plain text when no href', () => {
    const { container } = render(
      <AnnouncementBar>Plain message</AnnouncementBar>,
    );
    expect(container.querySelector('.ds-announcement-bar__link')).not.toBeInTheDocument();
    expect(container.querySelector('.ds-announcement-bar__message')).toBeInTheDocument();
  });

  it('wraps message in a link when href is provided', () => {
    const { container } = render(
      <AnnouncementBar href="/sale">Shop the sale</AnnouncementBar>,
    );
    const link = container.querySelector('.ds-announcement-bar__link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/sale');
  });

  it('does not show dismiss button by default', () => {
    render(<AnnouncementBar>Message</AnnouncementBar>);
    expect(screen.queryByLabelText('Dismiss announcement')).not.toBeInTheDocument();
  });

  it('shows dismiss button when dismissible', () => {
    render(<AnnouncementBar dismissible>Message</AnnouncementBar>);
    expect(screen.getByLabelText('Dismiss announcement')).toBeInTheDocument();
  });

  it('hides the bar when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    render(<AnnouncementBar dismissible>Dismissible message</AnnouncementBar>);

    expect(screen.getByText('Dismissible message')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Dismiss announcement'));
    expect(screen.queryByText('Dismissible message')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();

    render(
      <AnnouncementBar dismissible onDismiss={handleDismiss}>
        Dismissible
      </AnnouncementBar>,
    );

    await user.click(screen.getByLabelText('Dismiss announcement'));
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<AnnouncementBar ref={ref}>Test</AnnouncementBar>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('passes additional props to the root element', () => {
    render(<AnnouncementBar data-testid="my-bar">Test</AnnouncementBar>);
    expect(screen.getByTestId('my-bar')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    const { container } = render(
      <AnnouncementBar className="custom-class">Test</AnnouncementBar>,
    );
    const el = container.querySelector('.ds-announcement-bar');
    expect(el).toHaveClass('ds-announcement-bar', 'custom-class');
  });

  it('has no accessibility violations (default)', async () => {
    const { container } = render(
      <AnnouncementBar>Free shipping on orders over $50.</AnnouncementBar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (dismissible with link)', async () => {
    const { container } = render(
      <AnnouncementBar href="/sale" dismissible onDismiss={() => {}}>
        Summer sale — 20% off everything.
      </AnnouncementBar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
