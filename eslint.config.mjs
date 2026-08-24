// @ts-check
import eslint from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "apps/mobile/ios/**",
      "apps/mobile/android/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // React Native tooling config files are CommonJS by convention.
    files: [
      "apps/mobile/*.config.js",
      "apps/mobile/babel.config.js",
      "apps/mobile/index.js",
      "apps/mobile/scripts/**/*.js",
    ],
    languageOptions: {
      globals: {
        module: "writable",
        require: "writable",
        __dirname: "writable",
        process: "writable",
        setTimeout: "writable",
        console: "writable",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
