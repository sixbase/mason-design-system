import '@ds/tokens/css';
import type { Preview } from '@storybook/react';

const DS_BACKGROUND_LIGHT = '#FAF9F7'; // primitive stone.50
const DS_BACKGROUND_DARK = '#131010'; // primitive stone.950

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // The a11y panel runs axe on every story. It reports; it does not fail
    // anything — nothing runs the stories headless in CI (no test runner or
    // Chromatic workflow is set up). The component tests' axe checks are the
    // gate. color-contrast is on by default; kept explicit because the
    // backgrounds below exist so it measures against the real page colour.
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
    // Storybook needs literal colors here (it can't read CSS variables).
    // These mirror --color-background in each mode (stone.50 / stone.950)
    // so the a11y addon's contrast checks run against the real page color.
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: DS_BACKGROUND_LIGHT },
        { name: 'dark', value: DS_BACKGROUND_DARK },
      ],
    },
  },
  // Text direction, next to the background (theme) switch — the workbench's
  // RTL mode, so a layout can be checked right-to-left in Storybook too.
  globalTypes: {
    direction: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'Left to right' },
          { value: 'rtl', title: 'Right to left' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    direction: 'ltr',
  },
  decorators: [
    (Story, context) => {
      // The dark background selects the dark theme. The class goes on
      // <html>, as in the workbench frame and a real page: portalled
      // overlays (modal, select list, toast) and the page colour itself
      // then switch too, not just what sits inside <body>.
      const root = document.documentElement;
      root.classList.toggle('dark', context.globals['backgrounds']?.value === DS_BACKGROUND_DARK);
      root.dir = context.globals['direction'] === 'rtl' ? 'rtl' : 'ltr';
      return Story();
    },
  ],
};

export default preview;
