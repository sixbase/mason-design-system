import { act, configure, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterAll, afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { Toast, ToastProvider, useToast } from './Toast';
import { Modal, ModalContent, ModalTitle, ModalTrigger } from '../modal';

// Helper component to trigger toasts from inside the provider
function ToastTrigger({
  options,
  triggerLabel = 'Show toast',
}: {
  options: Parameters<ReturnType<typeof useToast>['toast']>[0];
  triggerLabel?: string;
}) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast(options)}>
      {triggerLabel}
    </button>
  );
}

// The visible toast. Inside ToastProvider it is not itself a live region —
// the provider's persistent status/alert regions speak for it.
const getToast = () => document.querySelector('.ds-toast') as HTMLElement;

describe('Toast', () => {
  // Text queries look at the visible toasts. The provider's live regions
  // hold a screen-reader copy of the newest one; tests that care read those
  // by role.
  beforeAll(() => configure({ defaultIgnore: 'script, style, .ds-toast-announcer, .ds-toast-announcer *' }));
  afterAll(() => configure({ defaultIgnore: 'script, style' }));

  it('renders description text', () => {
    render(
      <ToastProvider>
        <ToastTrigger options={{ description: 'Item saved successfully', duration: 0 }} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByText('Item saved successfully')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <ToastProvider>
        <ToastTrigger
          options={{ title: 'Success', description: 'Your changes were saved', duration: 0 }}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Your changes were saved')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    render(
      <ToastProvider>
        <ToastTrigger
          options={{ description: 'Added to cart', variant: 'success', duration: 0 }}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show toast'));
    const toast = getToast();
    expect(toast.className).toContain('ds-toast--success');
  });

  it('announces an error through the assertive (alert) region', () => {
    render(
      <ToastProvider>
        <ToastTrigger
          options={{ description: 'Something went wrong', variant: 'error', duration: 0 }}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  // Regression: Radix dialogs hide the rest of the page from screen readers
  // (aria-hidden), sparing only elements with an aria-live attribute. The
  // alert region had role="alert" alone, so error toasts went silent while
  // a Modal or Drawer was open.
  it('still announces an error while a Modal is open', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Modal>
          <ModalTrigger>Edit address</ModalTrigger>
          <ModalContent aria-describedby={undefined}>
            <ModalTitle>Edit address</ModalTitle>
            <ToastTrigger options={{ description: 'Could not save', variant: 'error', duration: 0 }} />
          </ModalContent>
        </Modal>
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Edit address' }));
    await user.click(screen.getByText('Show toast'));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  });

  it('announces other variants through the polite (status) region', () => {
    render(
      <ToastProvider>
        <ToastTrigger
          options={{ description: 'Warning message', variant: 'warning', duration: 0 }}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByRole('status')).toHaveTextContent('Warning message');
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  // Regression: each toast was a live region inserted with its text already
  // inside — often skipped by NVDA and VoiceOver. The provider's regions
  // exist, empty, before any toast; a toast is a text change inside them.
  it('has its live regions in the page before the first toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger options={{ title: 'Added to cart', description: 'Canvas Tote', duration: 0 }} />
      </ToastProvider>,
    );
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();
    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('Added to cart. Canvas Tote');
    // Said once: the visible toast is not a second live region
    expect(getToast()).not.toHaveAttribute('role');
    expect(getToast()).not.toHaveAttribute('aria-live');
  });

  it('keeps a standalone <Toast> a live region of its own', () => {
    render(
      <Toast
        data={{ id: 't1', description: 'Saved', variant: 'default', duration: 0 }}
        onRemove={() => {}}
        position="bottom-right"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('dismiss button removes toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger
          options={{ description: 'Dismissible toast', duration: 0 }}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByText('Dismissible toast')).toBeInTheDocument();

    // Click dismiss — triggers closing state, reduced-motion fallback removes immediately
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    expect(screen.queryByText('Dismissible toast')).not.toBeInTheDocument();
  });

  // Regression (keyboard audit): Enter on × removed the focused toast and
  // keyboard focus fell to <body>. It returns to where it came from.
  it('hands focus back when a focused toast is dismissed from the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger options={{ description: 'Keyboard toast', duration: 0 }} />
      </ToastProvider>,
    );
    const trigger = screen.getByText('Show toast');
    await user.click(trigger);
    await user.tab();
    expect(screen.getByLabelText('Dismiss notification')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.queryByText('Keyboard toast')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  // Regression: the app removing a focused toast itself — an "Undo" action
  // that calls dismiss(id) — skipped the toast's close path, so focus fell
  // to <body> and onDismiss never fired (it fires for ×, timeout and
  // eviction). Every way out now hands focus back and reports once.
  it('hands focus back and fires onDismiss once when the app dismisses a focused toast', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    function RemoveItem() {
      const { toast, dismiss } = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            const id = toast({
              description: 'Removed Canvas Tote',
              duration: 0,
              onDismiss,
              action: { label: 'Undo', onClick: () => dismiss(id) },
            });
          }}
        >
          Remove item
        </button>
      );
    }
    render(
      <ToastProvider>
        <RemoveItem />
      </ToastProvider>,
    );
    const trigger = screen.getByText('Remove item');
    await user.click(trigger);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.queryByText('Removed Canvas Tote')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fires onDismiss once when the toast is closed with ×', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <ToastProvider>
        <ToastTrigger options={{ description: 'Saved', duration: 0, onDismiss }} />
      </ToastProvider>,
    );
    await user.click(screen.getByText('Show toast'));
    await user.click(screen.getByLabelText('Dismiss notification'));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('action button calls onClick', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();

    render(
      <ToastProvider>
        <ToastTrigger
          options={{
            description: 'Item deleted',
            action: { label: 'Undo', onClick: handleAction },
            duration: 0,
          }}
        />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show toast'));
    await user.click(screen.getByText('Undo'));
    expect(handleAction).toHaveBeenCalledOnce();
  });

  // Toasts portal to <body>; scanning `container` checked only the triggers.
  it('has no accessibility violations', async () => {
    const { baseElement } = render(
      <ToastProvider>
        <ToastTrigger
          options={{
            title: 'Success',
            description: 'Added to cart',
            variant: 'success',
            duration: 0,
          }}
          triggerLabel="Success toast"
        />
        <ToastTrigger
          options={{
            description: 'Something failed',
            variant: 'error',
            duration: 0,
          }}
          triggerLabel="Error toast"
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Success toast'));
    fireEvent.click(screen.getByText('Error toast'));

    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });

  describe('positions', () => {
    it('renders top-center container and motion class', () => {
      render(
        <ToastProvider position="top-center">
          <ToastTrigger options={{ description: 'Centered on top', duration: 0 }} />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Show toast'));
      const toast = getToast();
      expect(toast.className).toContain('ds-toast--enter-top');
      expect(document.querySelector('.ds-toast-container--top-center')).toBeInTheDocument();
    });

    it('defaults to bottom-right container', () => {
      render(
        <ToastProvider>
          <ToastTrigger options={{ description: 'Default position', duration: 0 }} />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText('Show toast'));
      expect(document.querySelector('.ds-toast-container--bottom-right')).toBeInTheDocument();
    });
  });

  describe('swipe to dismiss', () => {
    // jsdom has no PointerEvent constructor and fireEvent's fallback
    // drops pointer/coordinate props — dispatch a plain Event with the
    // properties assigned so React's synthetic event can read them.
    function firePointer(
      el: Element,
      type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
      init: { pointerId: number; pointerType: string; clientX: number; clientY: number },
    ) {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, init);
      fireEvent(el, event);
    }

    function renderSwipeToast(position?: 'top-right' | 'bottom-right' | 'bottom-center' | 'top-center') {
      render(
        <ToastProvider position={position}>
          <ToastTrigger options={{ description: 'Swipeable toast', duration: 0 }} />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByText('Show toast'));
      return getToast();
    }

    it('dismisses when swiped right past the threshold (right positions)', () => {
      const toast = renderSwipeToast('bottom-right');

      firePointer(toast, 'pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0 });
      firePointer(toast, 'pointermove', { pointerId: 1, pointerType: 'touch', clientX: 80, clientY: 0 });
      firePointer(toast, 'pointerup', { pointerId: 1, pointerType: 'touch', clientX: 80, clientY: 0 });

      expect(screen.queryByText('Swipeable toast')).not.toBeInTheDocument();
    });

    it('returns to rest when released below the threshold', () => {
      const toast = renderSwipeToast('bottom-right');

      firePointer(toast, 'pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0 });
      firePointer(toast, 'pointermove', { pointerId: 1, pointerType: 'touch', clientX: 20, clientY: 0 });
      firePointer(toast, 'pointerup', { pointerId: 1, pointerType: 'touch', clientX: 20, clientY: 0 });

      expect(screen.getByText('Swipeable toast')).toBeInTheDocument();
    });

    it('dismisses top-center toasts on upward swipe only', () => {
      const toast = renderSwipeToast('top-center');

      // Downward swipe is clamped — toast stays
      firePointer(toast, 'pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0 });
      firePointer(toast, 'pointermove', { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 80 });
      firePointer(toast, 'pointerup', { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 80 });
      expect(screen.getByText('Swipeable toast')).toBeInTheDocument();

      // Upward swipe past threshold dismisses
      firePointer(toast, 'pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 0, clientY: 100 });
      firePointer(toast, 'pointermove', { pointerId: 2, pointerType: 'touch', clientX: 0, clientY: 20 });
      firePointer(toast, 'pointerup', { pointerId: 2, pointerType: 'touch', clientX: 0, clientY: 20 });
      expect(screen.queryByText('Swipeable toast')).not.toBeInTheDocument();
    });

    it('ignores mouse pointers', () => {
      const toast = renderSwipeToast('bottom-right');

      firePointer(toast, 'pointerdown', { pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0 });
      firePointer(toast, 'pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 200, clientY: 0 });
      firePointer(toast, 'pointerup', { pointerId: 1, pointerType: 'mouse', clientX: 200, clientY: 0 });

      expect(screen.getByText('Swipeable toast')).toBeInTheDocument();
    });

    it('cancelled swipes never dismiss', () => {
      const toast = renderSwipeToast('bottom-right');

      firePointer(toast, 'pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 0, clientY: 0 });
      firePointer(toast, 'pointermove', { pointerId: 1, pointerType: 'touch', clientX: 120, clientY: 0 });
      firePointer(toast, 'pointercancel', { pointerId: 1, pointerType: 'touch', clientX: 120, clientY: 0 });

      expect(screen.getByText('Swipeable toast')).toBeInTheDocument();
    });
  });

  it('respects maxToasts limit', () => {
    function MultiTrigger() {
      const { toast } = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            toast({ description: 'Toast 1', duration: 0 });
            toast({ description: 'Toast 2', duration: 0 });
            toast({ description: 'Toast 3', duration: 0 });
            toast({ description: 'Toast 4', duration: 0 });
          }}
        >
          Fire all
        </button>
      );
    }

    render(
      <ToastProvider maxToasts={2}>
        <MultiTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Fire all'));

    // Only the last 2 should be visible
    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Toast 2')).not.toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
    expect(screen.getByText('Toast 4')).toBeInTheDocument();
  });

  // ─── Regressions ──────────────────────────────────────────

  it('keeps the countdown paused while focus is inside, even after hover-out', () => {
    // Bug: hover-out restarted the timer while keyboard focus was still on
    // the dismiss button; the toast vanished and focus fell to <body>.
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <ToastTrigger options={{ description: 'Focused toast', duration: 1000 }} />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByText('Show toast'));
      const toast = getToast();

      act(() => screen.getByLabelText('Dismiss notification').focus());
      fireEvent.mouseEnter(toast);
      fireEvent.mouseLeave(toast);
      act(() => vi.advanceTimersByTime(5000));
      expect(screen.getByText('Focused toast')).toBeInTheDocument();

      // Once focus leaves, the remaining time runs out as normal
      act(() => screen.getByLabelText('Dismiss notification').blur());
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.queryByText('Focused toast')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  describe('auto-dismiss timing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('dismisses after 5 seconds by default', () => {
      render(
        <ToastProvider>
          <ToastTrigger options={{ description: 'Default timing' }} />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByText('Show toast'));
      act(() => vi.advanceTimersByTime(4900));
      expect(screen.getByText('Default timing')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(200));
      expect(screen.queryByText('Default timing')).not.toBeInTheDocument();
    });

    it('resumes with the time that was left after a hover, not a fresh countdown', () => {
      render(
        <ToastProvider>
          <ToastTrigger options={{ description: 'Hovered toast', duration: 5000 }} />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByText('Show toast'));
      act(() => vi.advanceTimersByTime(3000));
      fireEvent.mouseEnter(getToast());
      act(() => vi.advanceTimersByTime(10000));
      expect(screen.getByText('Hovered toast')).toBeInTheDocument();
      fireEvent.mouseLeave(getToast());
      act(() => vi.advanceTimersByTime(2100));
      expect(screen.queryByText('Hovered toast')).not.toBeInTheDocument();
    });

    it('leaves no timer running once the provider unmounts', () => {
      const { unmount } = render(
        <ToastProvider>
          <ToastTrigger options={{ description: 'Unmounted', duration: 5000 }} />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByText('Show toast'));
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  it('removes evicted toasts for good and calls their onDismiss', () => {
    // Bug: toasts past maxToasts were only hidden — they piled up in state
    // and reappeared as soon as the newer toasts were dismissed.
    const onDismissA = vi.fn();
    function Fire() {
      const { toast } = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            toast({ description: 'A', duration: 0, onDismiss: onDismissA });
            toast({ description: 'B', duration: 0 });
            toast({ description: 'C', duration: 0 });
          }}
        >
          Fire
        </button>
      );
    }
    render(
      <ToastProvider maxToasts={2}>
        <Fire />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Fire'));
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(onDismissA).toHaveBeenCalledTimes(1);

    screen.getAllByLabelText('Dismiss notification').forEach((b) => fireEvent.click(b));
    expect(screen.queryByText('B')).not.toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('exposes the container as a labelled region', () => {
    render(
      <ToastProvider>
        <ToastTrigger options={{ description: 'Hello', duration: 0 }} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('does not re-render toasts already on screen when another arrives (performance)', () => {
    // forwardRef components render through `.render`; the provider's memo
    // wrapper calls the same function, so this counts every toast render.
    const renderToast = vi.spyOn(Toast as unknown as { render: (...args: unknown[]) => unknown }, 'render');
    render(
      <ToastProvider maxToasts={5}>
        <ToastTrigger options={{ description: 'Added to bag', duration: 0 }} />
      </ToastProvider>,
    );
    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getAllByText('Added to bag')).toHaveLength(4);
    // Was 4 + 3 + 2 + 1 = 10: every toast re-rendered on each later add
    expect(renderToast).toHaveBeenCalledTimes(4);
    renderToast.mockRestore();
  });
});
