import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Modal, ModalContent, ModalTitle } from '../modal/Modal';
import { CookieConsent } from './CookieConsent';
import type { CookieCategory } from './CookieConsent';

expect.extend(toHaveNoViolations);

const defaultCategories: CookieCategory[] = [
  { id: 'essential', label: 'Strictly Necessary Cookies', description: 'These cookies are essential for the website to function and cannot be switched off.', required: true, learnMoreHref: '#essential' },
  { id: 'functional', label: 'Functional Cookies', description: 'These cookies enable enhanced functionality and personalization.', defaultChecked: true, learnMoreHref: '#functional' },
  { id: 'performance', label: 'Performance Cookies', description: 'These cookies help us understand how visitors interact with the website.', defaultChecked: true, learnMoreHref: '#performance' },
  { id: 'targeting', label: 'Targeting Cookies', description: 'These cookies are used to deliver personalized advertisements.', learnMoreHref: '#targeting' },
];

describe('CookieConsent', () => {
  // ─── Rendering ──────────────────────────────────────────

  it('renders banner with heading and description', () => {
    render(<CookieConsent />);
    expect(screen.getByText('We Use Cookies')).toBeInTheDocument();
    expect(screen.getByText(/cookies to improve your experience/)).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<CookieConsent open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with defaultOpen true (uncontrolled)', () => {
    render(<CookieConsent defaultOpen />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders custom heading and description', () => {
    render(
      <CookieConsent heading="Custom Title" description="Custom message" />,
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  // ─── Main dialog buttons ──────────────────────────────

  it('calls onAccept with all category IDs when Accept All is clicked', async () => {
    const onAccept = vi.fn();
    const user = userEvent.setup();
    render(<CookieConsent categories={defaultCategories} onAccept={onAccept} />);

    await user.click(screen.getByText('Accept All'));
    expect(onAccept).toHaveBeenCalledWith(['essential', 'functional', 'performance', 'targeting']);
  });

  it('calls onReject when Decline All is clicked (no categories)', async () => {
    const onReject = vi.fn();
    const user = userEvent.setup();
    render(<CookieConsent onReject={onReject} />);

    await user.click(screen.getByText('Decline All'));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('shows Manage Preferences, Decline All, and Accept All when categories are provided', () => {
    render(<CookieConsent categories={defaultCategories} />);
    expect(screen.getByText('Manage Preferences')).toBeInTheDocument();
    expect(screen.getByText('Decline All')).toBeInTheDocument();
    expect(screen.getByText('Accept All')).toBeInTheDocument();
  });

  it('shows Decline All and Accept All when no categories are provided', () => {
    render(<CookieConsent />);
    expect(screen.getByText('Decline All')).toBeInTheDocument();
    expect(screen.getByText('Accept All')).toBeInTheDocument();
    expect(screen.queryByText('Manage Preferences')).not.toBeInTheDocument();
  });

  // ─── Preferences panel (accordion-based) ─────────────────

  it('shows accordion sections when Manage Preferences is clicked', async () => {
    const user = userEvent.setup();
    render(<CookieConsent categories={defaultCategories} />);

    expect(screen.queryByText('Strictly Necessary Cookies')).not.toBeInTheDocument();

    await user.click(screen.getByText('Manage Preferences'));
    expect(screen.getByText('Strictly Necessary Cookies')).toBeInTheDocument();
    expect(screen.getByText('Functional Cookies')).toBeInTheDocument();
    expect(screen.getByText('Performance Cookies')).toBeInTheDocument();
    expect(screen.getByText('Targeting Cookies')).toBeInTheDocument();
  });

  it('shows Back and Save Preferences buttons in preferences view', async () => {
    const user = userEvent.setup();
    render(<CookieConsent categories={defaultCategories} />);

    await user.click(screen.getByText('Manage Preferences'));
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    // Main dialog buttons should not be visible in preferences view
    expect(screen.queryByText('Accept All')).not.toBeInTheDocument();
    expect(screen.queryByText('Decline All')).not.toBeInTheDocument();
  });

  it('essential category checkbox is disabled', async () => {
    const user = userEvent.setup();
    render(<CookieConsent categories={defaultCategories} />);

    await user.click(screen.getByText('Manage Preferences'));
    const essentialCheckbox = screen.getByRole('checkbox', { name: 'Strictly Necessary Cookies' });
    expect(essentialCheckbox).toBeDisabled();
  });

  it('non-essential categories can be toggled', async () => {
    const user = userEvent.setup();
    render(<CookieConsent categories={defaultCategories} />);

    await user.click(screen.getByText('Manage Preferences'));
    const functionalCheckbox = screen.getByRole('checkbox', { name: 'Functional Cookies' });
    expect(functionalCheckbox).not.toBeDisabled();
    await user.click(functionalCheckbox);
    // Was default on, now toggled off
    expect(functionalCheckbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('Save Preferences calls onAccept with only selected category IDs', async () => {
    const onAccept = vi.fn();
    const user = userEvent.setup();
    render(<CookieConsent categories={defaultCategories} onAccept={onAccept} />);

    await user.click(screen.getByText('Manage Preferences'));
    // Toggle functional off (default on)
    await user.click(screen.getByRole('checkbox', { name: 'Functional Cookies' }));
    await user.click(screen.getByText('Save Preferences'));

    // Essential (required) + performance (default on, untouched)
    const accepted = onAccept.mock.calls[0][0] as string[];
    expect(accepted).toContain('essential');
    expect(accepted).toContain('performance');
    expect(accepted).not.toContain('functional');
    expect(accepted).not.toContain('targeting');
  });

  it('Back button returns to main dialog without saving', async () => {
    const user = userEvent.setup();
    render(<CookieConsent categories={defaultCategories} />);

    await user.click(screen.getByText('Manage Preferences'));
    expect(screen.getByText('Save Preferences')).toBeInTheDocument();

    await user.click(screen.getByText('Back'));
    // Should be back to main dialog
    expect(screen.getByText('Accept All')).toBeInTheDocument();
    expect(screen.getByText('Manage Preferences')).toBeInTheDocument();
    expect(screen.queryByText('Save Preferences')).not.toBeInTheDocument();
  });

  // ─── Per-category learn more links ─────────────────────

  it('renders learn more links for categories with learnMoreHref', async () => {
    const user = userEvent.setup();
    render(<CookieConsent categories={defaultCategories} />);

    await user.click(screen.getByText('Manage Preferences'));
    // Expand a category to see its content
    await user.click(screen.getByText('Functional Cookies'));

    const links = screen.getAllByText('Learn More');
    expect(links.length).toBeGreaterThanOrEqual(1);
    const functionalLink = links.find((el) => el.closest('a')?.getAttribute('href') === '#functional');
    expect(functionalLink).toBeInTheDocument();
  });

  // ─── Focus management ───────────────────────────────────

  it('moves focus to the dialog heading on open', () => {
    render(<CookieConsent />);
    expect(screen.getByText('We Use Cookies')).toHaveFocus();
  });

  it('heading is focusable but not in the tab order', () => {
    render(<CookieConsent />);
    expect(screen.getByText('We Use Cookies')).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('returns focus to the previously focused element on close', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open banner
          </button>
          <CookieConsent open={open} onOpenChange={setOpen} />
        </>
      );
    }

    render(<Harness />);
    await user.click(screen.getByText('Open banner'));
    expect(screen.getByText('We Use Cookies')).toHaveFocus();

    await user.click(screen.getByText('Accept All'));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Open banner')).toHaveFocus();
  });

  // ─── Keyboard ───────────────────────────────────────────

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CookieConsent open onOpenChange={onOpenChange} />);

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // ─── ARIA / Accessibility ──────────────────────────────

  it('has role="dialog"', () => {
    render(<CookieConsent />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-labelledby pointing to the heading', () => {
    render(<CookieConsent />);
    const dialog = screen.getByRole('dialog');
    const heading = screen.getByText('We Use Cookies');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('has aria-modal set to false (non-blocking)', () => {
    render(<CookieConsent />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'false');
  });

  // ─── Class names ────────────────────────────────────────

  it('applies ds-cookie-consent root class', () => {
    render(<CookieConsent />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('ds-cookie-consent');
  });

  it('forwards custom className', () => {
    render(<CookieConsent className="custom-banner" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('custom-banner');
  });

  // ─── Accessibility audit ────────────────────────────────

  it('has no accessibility violations', async () => {
    const { container } = render(<CookieConsent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with preferences expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<CookieConsent categories={defaultCategories} />);
    await user.click(screen.getByText('Manage Preferences'));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // ─── Regressions ────────────────────────────────────────

  it('fires onAccept once when Accept All is double-clicked during the exit animation', () => {
    // Bug: buttons stayed live while the banner animated out, so a
    // double-click reported consent twice.
    const realGetComputedStyle = window.getComputedStyle;
    const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
      const styles = realGetComputedStyle(el, pseudo);
      // Simulate a browser where the exit animation is actually running
      if ((el as Element).classList?.contains('ds-cookie-consent')) {
        return { ...styles, animationName: 'ds-cookie-consent-out' } as CSSStyleDeclaration;
      }
      return styles;
    });
    try {
      const onAccept = vi.fn();
      render(<CookieConsent onAccept={onAccept} categories={defaultCategories} />);
      const acceptAll = screen.getByText('Accept All');
      fireEvent.click(acceptAll);
      fireEvent.click(acceptAll);
      expect(onAccept).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  // Bug: animationend bubbles, so a category's accordion fade finishing
  // during the exit ended the close early (the slide-out was cut short).
  it("closes only when the banner's own exit animation ends, not a child's", () => {
    const realGetComputedStyle = window.getComputedStyle;
    const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
      const styles = realGetComputedStyle(el, pseudo);
      if ((el as Element).classList?.contains('ds-cookie-consent')) {
        return { ...styles, animationName: 'ds-cookie-consent-out' } as CSSStyleDeclaration;
      }
      return styles;
    });
    try {
      render(<CookieConsent categories={defaultCategories} />);
      fireEvent.click(screen.getByText('Accept All'));
      const banner = screen.getByRole('dialog');
      fireEvent.animationEnd(screen.getByText('Accept All'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.animationEnd(banner);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it('ignores an Escape already consumed by a nested overlay', async () => {
    // Bug: closing a Modal with Escape also dismissed the banner (without
    // a consent choice) — its document listener ignored defaultPrevented.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <>
        <CookieConsent open onOpenChange={onOpenChange} />
        <Modal defaultOpen>
          <ModalContent aria-describedby={undefined}>
            <ModalTitle>Size guide</ModalTitle>
          </ModalContent>
        </Modal>
      </>,
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Size guide')).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('applies required/defaultChecked to categories that arrive after mount', async () => {
    // Bug: selection was seeded once from the initial `categories` — async
    // config left "Strictly Necessary" unchecked and out of the saved list.
    const user = userEvent.setup();
    const onAccept = vi.fn();
    function Harness() {
      const [categories, setCategories] = useState<CookieCategory[] | undefined>(undefined);
      return (
        <>
          <button type="button" onClick={() => setCategories(defaultCategories)}>
            Load categories
          </button>
          <CookieConsent onAccept={onAccept} categories={categories} />
        </>
      );
    }
    render(<Harness />);
    await user.click(screen.getByText('Load categories'));
    await user.click(screen.getByText('Manage Preferences'));
    await user.click(screen.getByText('Save Preferences'));
    expect(onAccept).toHaveBeenCalledWith(['essential', 'functional', 'performance']);
  });

  it('never reports consent for an untouched category whose id is an Object.prototype name', async () => {
    // Bug: toggles lived in a plain object, so `toggles['constructor']` was
    // the inherited function (truthy) — "constructor" / "toString" read as
    // ticked and landed in the accepted list without a click.
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(
      <CookieConsent
        onAccept={onAccept}
        categories={[
          { id: 'essential', label: 'Essential', required: true },
          { id: 'constructor', label: 'Ads' },
          { id: 'toString', label: 'Analytics' },
          { id: '__proto__', label: 'Social' },
        ]}
      />,
    );
    await user.click(screen.getByText('Manage Preferences'));
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes.map((b) => b.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false', 'false']);
    await user.click(screen.getByText('Save Preferences'));
    expect(onAccept).toHaveBeenCalledWith(['essential']);
  });

  // A blocked href used to leave a link-styled <a> with no href: it looked
  // like a link but could not be focused or activated. Now it is left out,
  // exactly as if no link was given.
  it('drops javascript: learn-more links instead of rendering them', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<CookieConsent learnMoreHref={'java\tscript:alert(1)'} />);
      expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
      expect(screen.getByRole('dialog').querySelector('a')).toBeNull();
    } finally {
      warn.mockRestore();
    }
  });

  it('drops a blocked category link, and the empty panel with it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const user = userEvent.setup();
      render(
        <CookieConsent
          categories={[
            { id: 'essential', label: 'Strictly Necessary Cookies', required: true },
            { id: 'ads', label: 'Targeting Cookies', learnMoreHref: 'data:text/html,hi' },
            { id: 'fn', label: 'Functional Cookies', description: 'Remembers choices.', learnMoreHref: 'javascript:alert(1)' },
          ]}
        />,
      );
      await user.click(screen.getByText('Manage Preferences'));
      await user.click(screen.getByText('Targeting Cookies'));
      await user.click(screen.getByText('Functional Cookies'));
      expect(screen.getByText('Remembers choices.')).toBeInTheDocument();
      expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
      // Only a real description earns a content panel.
      expect(document.querySelectorAll('.ds-accordion__content')).toHaveLength(1);
    } finally {
      warn.mockRestore();
    }
  });
});

// Round 5 (shopper journeys): at the toast layer the banner covered an open
// cart drawer's Subtotal and Checkout on phones — while the drawer made it
// inert, so tapping "Accept All" hit the hidden Checkout link. It sits
// below modal layers now.
describe('CookieConsent stacking', () => {
  it('stays under modal overlays (Drawer, Modal)', () => {
    const css = readFileSync(resolve(__dirname, 'CookieConsent.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const root = css.match(/(?:^|})\s*\.ds-cookie-consent\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(root).toMatch(/z-index: var\(--z-index-overlay\);/);
  });
});

// Round 5 (shopper journeys): with the banner up, tabbing to the footer
// (Contact, Privacy Policy) left the focused link entirely under it
// (WCAG 2.4.11), and the end of the page could not be scrolled clear.
describe('CookieConsent keeps the page reachable', () => {
  it('publishes its height on <html> while it shows, and removes it after', async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--cookie-consent-height')).toMatch(/^\d+px$/);
    await user.click(screen.getByRole('button', { name: 'Accept All' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(root.style.getPropertyValue('--cookie-consent-height')).toBe('');
  });

  it('turns that height into scroll-padding and room at the end of the page', () => {
    const css = readFileSync(resolve(__dirname, 'CookieConsent.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/html:has\(\.ds-cookie-consent\)\s*\{[^}]*scroll-padding-bottom: var\(--cookie-consent-height\);/);
    expect(css).toMatch(/html:has\(\.ds-cookie-consent\) body\s*\{\s*padding-bottom: var\(--cookie-consent-height\);/);
  });
});
