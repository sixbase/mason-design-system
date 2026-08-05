import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

expect.extend(toHaveNoViolations);

function renderTabs(props: Record<string, unknown> = {}) {
  return render(
    <Tabs defaultValue="description" {...props}>
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
      </TabsList>
      <TabsContent value="description">Product description content.</TabsContent>
      <TabsContent value="reviews">Customer reviews content.</TabsContent>
      <TabsContent value="specs">Technical specifications content.</TabsContent>
    </Tabs>,
  );
}

describe('Tabs', () => {
  // ─── Base rendering ─────────────────────────────────────

  it('renders without crashing', () => {
    renderTabs();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders correct HTML elements', () => {
    renderTabs();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('applies ds-tabs class to root', () => {
    const { container } = renderTabs();
    expect(container.querySelector('.ds-tabs')).toBeInTheDocument();
  });

  // ─── Active state ───────────────────────────────────────

  it('shows the default active tab content', () => {
    renderTabs();
    expect(screen.getByText('Product description content.')).toBeVisible();
  });

  it('switches tab content on click', async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole('tab', { name: 'Reviews' }));
    expect(screen.getByText('Customer reviews content.')).toBeVisible();
  });

  // ─── Keyboard navigation ───────────────────────────────

  it('navigates between tabs with arrow keys', async () => {
    const user = userEvent.setup();
    renderTabs();

    const descriptionTab = screen.getByRole('tab', { name: 'Description' });
    descriptionTab.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Specifications' })).toHaveFocus();

    // Wraps around
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Description' })).toHaveFocus();
  });

  // ─── Controlled mode ───────────────────────────────────

  it('calls onValueChange when tab changes', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Tabs value="description" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description">Description content</TabsContent>
        <TabsContent value="reviews">Reviews content</TabsContent>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Reviews' }));
    expect(onValueChange).toHaveBeenCalledWith('reviews');
  });

  // ─── Disabled state ─────────────────────────────────────

  it('does not activate a disabled tab on click', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews" disabled>Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description">Description content</TabsContent>
        <TabsContent value="reviews">Reviews content</TabsContent>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Reviews' }));
    // Description content should still be visible
    expect(screen.getByText('Description content')).toBeVisible();
  });

  // ─── Single tab edge case ──────────────────────────────

  it('renders correctly with a single tab', () => {
    render(
      <Tabs defaultValue="only">
        <TabsList>
          <TabsTrigger value="only">Only Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="only">Only content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Only Tab' })).toBeInTheDocument();
    expect(screen.getByText('Only content')).toBeVisible();
  });

  // ─── Custom className ──────────────────────────────────

  it('merges custom className', () => {
    const { container } = render(
      <Tabs defaultValue="a" className="custom-class">
        <TabsList className="list-class">
          <TabsTrigger value="a" className="trigger-class">Tab A</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="content-class">Content A</TabsContent>
      </Tabs>,
    );

    expect(container.querySelector('.ds-tabs.custom-class')).toBeInTheDocument();
    expect(container.querySelector('.ds-tabs__list.list-class')).toBeInTheDocument();
    expect(container.querySelector('.ds-tabs__trigger.trigger-class')).toBeInTheDocument();
    expect(container.querySelector('.ds-tabs__content.content-class')).toBeInTheDocument();
  });

  // ─── Badge slot ─────────────────────────────────────────

  it('renders a numeric badge inside a Badge chip', () => {
    const { container } = render(
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews" badge={12}>Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">Reviews content</TabsContent>
      </Tabs>,
    );

    const badge = container.querySelector('.ds-tabs__badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('ds-badge');
    expect(badge).toHaveTextContent('12');
  });

  it('includes the badge in the tab accessible name', () => {
    render(
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews" badge={12}>Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">Reviews content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: /Reviews\s*12/ })).toBeInTheDocument();
  });

  it('renders a custom node badge as-is', () => {
    const { container } = render(
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews" badge={<em data-testid="custom-badge">New</em>}>
            Reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">Reviews content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    expect(container.querySelector('.ds-tabs__badge .ds-badge')).not.toBeInTheDocument();
  });

  it('renders no badge slot when badge is omitted', () => {
    const { container } = renderTabs();
    expect(container.querySelector('.ds-tabs__badge')).not.toBeInTheDocument();
  });

  it('wraps the trigger label for safe truncation', () => {
    const { container } = renderTabs();
    expect(container.querySelectorAll('.ds-tabs__trigger-label')).toHaveLength(3);
  });

  // ─── Accessibility ─────────────────────────────────────

  it('has no accessibility violations', async () => {
    const { container } = renderTabs();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with badges', async () => {
    const { container } = render(
      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews" badge={127}>Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description">Description content</TabsContent>
        <TabsContent value="reviews">Reviews content</TabsContent>
      </Tabs>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
