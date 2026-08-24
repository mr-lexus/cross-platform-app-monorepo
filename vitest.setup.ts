import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

// Defensive: §10 tests never render gesture/animated components, but the avatar
// feature may pull RNGH through transitive imports, and downstream suites
// (todo 7+) will. Keep the surface minimal — only the pieces Vitest needs.
vi.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: { children: ReactNode }) => children,
  GestureHandlerRootView: ({ children }: { children: ReactNode }) => children,
  usePanGesture: () => ({}),
}));
