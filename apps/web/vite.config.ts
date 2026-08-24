import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// .web.* FIRST so RNW-specific overrides resolve before the generic file.
const WEB_FIRST_EXTENSIONS = [
  ".web.tsx",
  ".web.ts",
  ".web.jsx",
  ".web.js",
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
  ".json",
];

// Single babel plugin: worklets must run LAST in plugin-react's babel pipeline.
const REACT_BABEL_PLUGINS = ["react-native-worklets/plugin"];

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
    extensions: WEB_FIRST_EXTENSIONS,
    dedupe: [
      "react",
      "react-dom",
      "react-native",
      "react-native-web",
      "react/jsx-runtime",
    ],
  },
  define: {
    // RN-compat globals required by Reanimated on web (PR #7770 fallback).
    global: "window",
    __DEV__: JSON.stringify(mode !== "production"),
    DEV: JSON.stringify(mode !== "production"),
    "process.env.NODE_ENV": JSON.stringify(mode),
    _WORKLET: "false",
    _frameTimestamp: "undefined",
    "global.__x": "{}",
  },
  optimizeDeps: {
    include: [
      "react-native-web",
      "react-native-reanimated",
      "react-native-gesture-handler",
    ],
    esbuildOptions: {
      jsx: "automatic",
      loader: { ".js": "jsx" },
      resolveExtensions: WEB_FIRST_EXTENSIONS,
    },
  },
  plugins: [
    react({
      // Plugin-react must HMR workspace packages from source — never prebundle them.
      include: ["**/*.{jsx,tsx}", "../../packages/**/*.tsx"],
      babel: {
        plugins: REACT_BABEL_PLUGINS,
      },
    }),
  ],
}));
