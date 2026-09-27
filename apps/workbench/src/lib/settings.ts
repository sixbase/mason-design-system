/**
 * How the frames are shown. Remembered between visits.
 */
import { useCallback, useSyncExternalStore } from 'react';

export type ThemeSetting = 'light' | 'dark' | 'both';
export type WidthSetting = 'phone' | 'tablet' | 'desktop' | 'all';

export interface Settings {
  theme: ThemeSetting;
  width: WidthSetting;
  /** Animations on (false = frozen, like reduced motion) */
  motion: boolean;
  /** Outline every element to check alignment and spacing */
  outlines: boolean;
  /** Double every piece of text to test wrapping and overflow */
  stretch: boolean;
  /** Right-to-left layout */
  rtl: boolean;
}

export const DEVICES = {
  phone: { label: 'Phone', width: 375, height: 812 },
  tablet: { label: 'Tablet', width: 768, height: 1024 },
  desktop: { label: 'Desktop', width: 1280, height: 800 },
} as const;

export type Device = keyof typeof DEVICES;

const DEFAULTS: Settings = { theme: 'light', width: 'phone', motion: true, outlines: false, stretch: false, rtl: false };

/** The stress-test modes, all back to normal viewing */
export const NORMAL_MODES = { motion: true, outlines: false, stretch: false, rtl: false } as const satisfies Partial<Settings>;

/** A test mode is on — remembered between visits, so easy to forget */
export const modesChanged = (s: Settings) =>
  (Object.keys(NORMAL_MODES) as Array<keyof typeof NORMAL_MODES>).some((k) => s[k] !== NORMAL_MODES[k]);
const KEY = 'ds-workbench-settings-v1';
const listeners = new Set<() => void>();

const THEMES: readonly ThemeSetting[] = ['light', 'dark', 'both'];
const WIDTHS: readonly WidthSetting[] = ['phone', 'tablet', 'desktop', 'all'];

/**
 * Anything unrecognised falls back to the default. A stored width that no
 * longer exists (say an option is renamed) used to blank every component
 * page, with no way back short of clearing the browser's storage.
 */
function clean(raw: unknown): Settings {
  const s = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const flag = (k: keyof typeof NORMAL_MODES) => {
    const v = s[k];
    return typeof v === 'boolean' ? v : DEFAULTS[k];
  };
  return {
    theme: THEMES.includes(s.theme as ThemeSetting) ? (s.theme as ThemeSetting) : DEFAULTS.theme,
    width: WIDTHS.includes(s.width as WidthSetting) ? (s.width as WidthSetting) : DEFAULTS.width,
    motion: flag('motion'),
    outlines: flag('outlines'),
    stretch: flag('stretch'),
    rtl: flag('rtl'),
  };
}

let current: Settings = (() => {
  try {
    return clean(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
  } catch {
    return DEFAULTS;
  }
})();

type Patch = Partial<Settings> | ((s: Settings) => Partial<Settings>);

// A function patch reads the live value, so keys pressed faster than React
// re-renders (T T T) each step from the previous press, not a stale copy.
function set(patch: Patch) {
  current = { ...current, ...(typeof patch === 'function' ? patch(current) : patch) };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // ignore — settings just won't persist
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useSettings(): [Settings, (patch: Patch) => void] {
  const s = useSyncExternalStore(subscribe, () => current, () => current);
  return [s, useCallback(set, [])];
}

export function devicesFor(width: WidthSetting): Device[] {
  return width === 'all' ? ['phone', 'tablet', 'desktop'] : [width];
}

export function themesFor(theme: ThemeSetting): Array<'light' | 'dark'> {
  return theme === 'both' ? ['light', 'dark'] : [theme];
}

/** Frame ids ("phone-dark") for the current theme × width choice, in stage order */
export function frameIds(s: Pick<Settings, 'theme' | 'width'>): string[] {
  return themesFor(s.theme).flatMap((theme) => devicesFor(s.width).map((device) => `${device}-${theme}`));
}

/** "phone-dark" → "Phone · Dark" */
export function frameName(fid: string): string {
  const [device, theme] = fid.split('-');
  const d = DEVICES[device as Device];
  return d ? `${d.label} · ${theme === 'dark' ? 'Dark' : 'Light'}` : fid;
}
