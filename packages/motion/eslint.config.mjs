import { react } from '@ds/eslint-config';

export default [
  ...react,
  { files: ['src/**/*.{ts,tsx}'] },
  { ignores: ['dist/**', 'src/**/*.test.{ts,tsx}'] },
];
