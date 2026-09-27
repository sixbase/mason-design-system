import { useEffect, useRef, useState } from 'react';

/**
 * Text for a polite live region that should speak only when `message`
 * changes after mount — never on first render.
 *
 * A live region that mounts with its text already inside is rarely
 * announced, and in browse mode it is read again as a hidden copy of what
 * the page already shows: "12 products" beside the visible "12 of 12
 * products", "4 items in your cart" under "Your Bag (4)". Starting empty
 * and filling on change is the pattern screen readers announce reliably.
 */
export function useChangeAnnouncement(message: string): string {
  const [text, setText] = useState('');
  const previous = useRef(message);
  useEffect(() => {
    if (previous.current === message) return;
    previous.current = message;
    setText(message);
  }, [message]);
  return text;
}
