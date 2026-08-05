import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders without crashing', () => {
    const { container } = render(<Alert>Test message</Alert>);
    expect(container.querySelector('.ds-alert')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<Alert>Test</Alert>);
    const el = screen.getByRole('status');
    expect(el.tagName).toBe('DIV');
  });

  it('applies variant class correctly', () => {
    const { container } = render(<Alert variant="success">Done</Alert>);
    expect(container.querySelector('.ds-alert--success')).toBeInTheDocument();
  });

  it('defaults to info variant', () => {
    const { container } = render(<Alert>Info message</Alert>);
    expect(container.querySelector('.ds-alert--info')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Alert title="Heads up">Body text</Alert>);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(<Alert>Description only</Alert>);
    expect(screen.getByText('Description only')).toBeInTheDocument();
    expect(screen.queryByText('.ds-alert__title')).not.toBeInTheDocument();
  });

  it('applies compact class when no title is provided', () => {
    const { container } = render(<Alert>Single line</Alert>);
    expect(container.querySelector('.ds-alert--compact')).toBeInTheDocument();
  });

  it('does not apply compact class when title is provided', () => {
    const { container } = render(<Alert title="Heads up">Body</Alert>);
    expect(container.querySelector('.ds-alert--compact')).not.toBeInTheDocument();
  });

  it('uses role="alert" for destructive variant', () => {
    render(<Alert variant="destructive">Error occurred</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="alert" for warning variant', () => {
    render(<Alert variant="warning">Caution</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for info variant', () => {
    render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="status" for success variant', () => {
    render(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows dismiss button when dismissible', () => {
    render(<Alert dismissible>Dismissible</Alert>);
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
  });

  it('does not show dismiss button by default', () => {
    render(<Alert>Not dismissible</Alert>);
    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();

    render(
      <Alert dismissible onDismiss={handleDismiss}>
        Dismissible alert
      </Alert>,
    );

    await user.click(screen.getByLabelText('Dismiss alert'));
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Alert ref={ref}>Test</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes additional props to the root element', () => {
    render(<Alert data-testid="my-alert">Test</Alert>);
    expect(screen.getByTestId('my-alert')).toBeInTheDocument();
  });

  it('accepts custom icon', () => {
    render(
      <Alert icon={<span data-testid="custom-icon">!</span>}>
        Custom icon alert
      </Alert>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('has no accessibility violations (info)', async () => {
    const { container } = render(
      <Alert variant="info" title="Information">
        This is an informational message.
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (destructive, dismissible)', async () => {
    const { container } = render(
      <Alert variant="destructive" title="Error" dismissible onDismiss={() => {}}>
        Something went wrong.
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
