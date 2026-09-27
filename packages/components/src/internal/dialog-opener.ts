/**
 * The element that opened a dialog (Modal, Drawer), so focus can go back to
 * it on close.
 *
 * Normally that is `document.activeElement` when the dialog opens. Safari
 * (macOS and iOS) does not focus a button or link when it is clicked or
 * tapped, so there `activeElement` is still `<body>` — or the nearest
 * focusable ancestor, such as the skip-link target `<main tabindex="-1">`,
 * which Safari focuses instead. Closing the mobile menu then dropped focus
 * to the top of the page (VoiceOver users lost their place) where Chromium
 * and Firefox returned it to the menu button.
 *
 * So the last pressed control is remembered (capture-phase pointerdown —
 * mouse, touch and pen), and preferred when `activeElement` is `<body>` or
 * merely contains it. A press on nothing interactive forgets it, the way a
 * click on blank page blurs the focused button in Chromium. Keyboard opens
 * are unaffected: the trigger itself is `activeElement` then.
 */

const PRESSABLE = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'summary',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

let lastPressed: Element | null = null;
let tracking = false;

function remember(event: Event) {
  const target = event.target;
  lastPressed = target instanceof Element ? target.closest(PRESSABLE) : null;
}

/** Start remembering presses. Idempotent and SSR-safe; call when a dialog root mounts. */
export function trackDialogOpeners(): void {
  if (tracking || typeof document === 'undefined') return;
  tracking = true;
  document.addEventListener('pointerdown', remember, true);
}

/** Who opened the dialog — call when it opens, before focus moves in. */
export function dialogOpener(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const active = document.activeElement;
  const pressed = lastPressed;
  if (
    pressed instanceof HTMLElement &&
    pressed.isConnected &&
    (!active || active === document.body || (active !== pressed && active.contains(pressed)))
  ) {
    return pressed;
  }
  return active instanceof HTMLElement && active !== document.body ? active : null;
}

/**
 * Give focus back to the opener when the dialog closes — without moving the
 * page. The page was scroll-locked while the dialog was open, so an opener
 * that is on screen is exactly where the user left it; a plain focus() still
 * scrolled, because the sticky header's scroll-padding made the browser
 * "reveal" anything near the top (closing the cart drawer from a PDP button
 * just under the bar nudged the page). An opener that is off screen (the
 * dialog was opened by code, or the window was resized) is scrolled to as
 * usual, so focus is never left somewhere the user can't see.
 */
export function returnFocus(opener: HTMLElement): void {
  const rect = opener.getBoundingClientRect();
  const onScreen =
    (rect.width > 0 || rect.height > 0) && rect.bottom > 0 && rect.top < window.innerHeight;
  opener.focus({ preventScroll: onScreen });
}
