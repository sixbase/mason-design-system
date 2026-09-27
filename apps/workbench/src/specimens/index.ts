/**
 * Non-story specimens, keyed `${kind}/${id}` (see lib/catalog.ts).
 * Lazy: a frame only downloads the sheet it is showing.
 */
import { lazy } from 'react';
import type { ComponentType } from 'react';

const named = <T extends Record<string, ComponentType>>(load: () => Promise<T>, name: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[name] as ComponentType })));

const foundations = () => import('./Foundations');
const lineups = () => import('./Lineups');
const pages = () => import('./pages');

export const SPECIMENS: Record<string, ComponentType> = {
  'foundation/colors': named(foundations, 'ColorsSheet'),
  'foundation/type': named(foundations, 'TypeSheet'),
  'foundation/space': named(foundations, 'SpaceSheet'),
  'foundation/motion': named(() => import('./MotionSheet'), 'MotionSheet'),
  'foundation/control-sizes': named(lineups, 'ControlSizes'),
  'foundation/status-colors': named(lineups, 'StatusColors'),
  'foundation/form-states': named(lineups, 'FormStates'),
  ...Object.fromEntries(
    ['homepage', 'product-detail', 'collection', 'cart', 'search', 'sale', 'account', 'terms'].map((id) => [
      `page/${id}`,
      lazy(() => pages().then((m) => ({ default: m.PAGE_SPECIMENS[`page/${id}`]! }))),
    ]),
  ),
};
