import { useSyncExternalStore } from 'react';

/**
 * The demo store's cart count, shared by every store page in a frame.
 *
 * The header badge used to be a constant 4 while the cart page changed
 * quantities or emptied the cart and the product page added items — the
 * demo contradicted how Header's `cartCount` is meant to be used (it
 * follows the cart). The cart page reports its own total; the product
 * page adds what it puts in the bag.
 */
let count = 4; // CartDemo's opening cart: 1 + 2 + 1
const listeners = new Set<() => void>();

export function setCartCount(next: number) {
  if (next === count) return;
  count = next;
  listeners.forEach((listener) => listener());
}

export function addToCartCount(quantity: number) {
  setCartCount(count + quantity);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const read = () => count;

export function useCartCount(): number {
  return useSyncExternalStore(subscribe, read, read);
}
