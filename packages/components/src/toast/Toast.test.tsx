import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from './Toast';

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

describe('Toast', () => {
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
    const toast = screen.getByRole('status');
    expect(toast.className).toContain('ds-toast--success');
  });

  it('uses role="alert" for error variant', () => {
    render(
      <ToastProvider>
        <ToastTrigger
          options={{ description: 'Something went wrong', variant: 'error', duration: 0 }}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for non-error variants', () => {
    render(
      <ToastProvider>
        <ToastTrigger
          options={{ description: 'Warning message', variant: 'warning', duration: 0 }}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show toast'));
    expect(screen.getByRole('status')).toBeInTheDocument();
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

  it('has no accessibility violations', async () => {
    const { container } = render(
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

    const results = await axe(container);
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
      const toast = screen.getByRole('status');
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
      return screen.getByRole('status');
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
});
