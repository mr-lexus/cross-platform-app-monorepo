import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { vi } from "vitest";

// Defensive mock: current tests do not exercise gesture/animated behavior
// directly, but Avatar-related imports may pull RNGH transitively. Keep the
// mock surface minimal.
vi.mock("react-native-gesture-handler", () => ({
  GestureDetector: ({ children }: { children: ReactNode }) => children,
  GestureHandlerRootView: ({ children }: { children: ReactNode }) => children,
  usePanGesture: () => ({}),
}));
