import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/**/src/**/*.{test,spec}.{ts,tsx}',
      'packages/**/__tests__/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      'apps/mobile/ios/**',
      'apps/mobile/android/**',
      '**/dist/**',
    ],
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-reanimated': 'react-native-reanimated/mock',
      'react-native-worklets': 'react-native-worklets/src/mock',
    },
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
  },
});
