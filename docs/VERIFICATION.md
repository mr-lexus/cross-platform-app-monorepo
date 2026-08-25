# Verification

All results below come from the final pre-submission verification performed
after the npm-workspaces migration and final polish. Where a check relies on
earlier executed evidence rather than a fresh run, it is stated explicitly.

## Automated quality gates

| Check                                                                                                  | Result |
| ------------------------------------------------------------------------------------------------------ | ------ |
| `npm ci`                                                                                               | PASS   |
| `npm run typecheck` (4 workspaces, strict)                                                             | PASS   |
| `npm run lint` (zero findings)                                                                         | PASS   |
| `npm test` (7 files, 40 tests)                                                                         | PASS   |
| `npm run build:web` (production)                                                                       | PASS   |
| Android `assembleDebug`                                                                                | PASS   |
| Android `assembleRelease`                                                                              | PASS   |
| Android `bundleRelease` (AAB)                                                                          | PASS   |
| iOS simulator build (`xcodebuild -workspace ibit.xcworkspace -scheme ibit -sdk iphonesimulator build`) | PASS   |

The test suites cover the deletion model (identity preservation, idempotency,
strict threshold semantics), mock-data determinism and avatar state
distribution, initials/color rules, and the Avatar component rendered through
React Native Web.

## Web

Verified **live** with Playwright against the production build served via
`vite preview`:

- Boots with no application errors and no deliberate network/DNS errors.
- Desktop frame measures exactly 475px wide, centered, with the bezel chrome.
- Exactly 1,000 rows: content scroll height is 72,000px (1000 × 72).
- Virtualization holds: deep-scrolling to a 40,000px offset leaves only 30
  row wrappers mounted.
- Left-swipe and right-swipe past the threshold both delete; a 60px drag snaps
  back and retains the row.
- Eight consecutive rapid deletions all commit correctly (scroll height
  decreases by exactly 72 each time).
- Vertical drags neither move nor delete rows; wheel scrolling works —
  horizontal-gesture vs vertical-scroll arbitration behaves.
- Both avatar states visible in the DOM: photos load and missing URLs show
  initials; the broken-image `onError` fallback is covered by Avatar unit
  tests instead of live broken URLs.
- Mouse drag drives the full swipe lifecycle (touch shares the same gesture
  path).

Verified by **code inspection plus earlier executed evidence** (not re-run in
the final audit): empty state and Reset List after deleting everything —
`ListEmptyComponent` with a reset handler is implemented, and a prior executed
run covered both behaviors, including a full 1,000-deletion marathon.

## Android

- `assembleDebug`, `assembleRelease` and `bundleRelease` all exit 0.
- Hermes enabled and confirmed: `libhermesvm.so` present for all four ABIs in
  the release APK; the bundled `index.android.bundle` is present.
- Runtime verification: 1,000-row render and a mid-swipe capture (red delete
  background visible) were recorded on an emulator in same-day executed
  artifacts reviewed during the audit. A live emulator was not driven during
  the audit session itself (no device attached).
- Artifact sizes, for completeness only — APK size was not an optimization
  target: debug APK 169.8MB (four unminified ABIs, normal for a debug
  universal build), release APK 63.9MB (universal), AAB 45.5MB (the shipping
  format).

## iOS

- Simulator build passes: `xcodebuild -workspace ibit.xcworkspace -scheme ibit
-sdk iphonesimulator build` exits 0.
- Launch, render and avatar fallback (photos and initials) verified via a
  clean-room simulator capture; app confirmed stable for 30+ seconds post-launch
  with no runtime errors.
- **Interactive swipe not verified** — touch injection is not possible in this
  environment. In the final pre-submission pass the app was launched again via
  `npm run ios` and render was re-confirmed by simulator screenshot; synthetic
  mouse clicks do reach the Simulator, but synthetic mouse drags (cliclick,
  with Accessibility granted) are not translated into touch gestures, and no
  touch-injection tooling (`idb`, `simctl` input) is available. The disclosure
  is deliberate: the iOS app runs the identical
  shared JavaScript/worklet pipeline verified live on Web and captured on
  Android, but a manual drag on the simulator remains the one check left to
  the reviewer.

## Performance

- Virtualization: verified live on Web — 30 mounted rows at a 40,000px offset,
  exact 72,000px content height for 1,000 rows.
- Render behavior: memoized rows with stable ids/callbacks and
  identity-preserving deletion mean deletions re-render only the list
  container, not neighboring rows (code-verified; consistent with a
  development-time render-count probe showing zero re-renders during drags).
- Animation architecture: gesture updates flow worklet → SharedValue →
  animated style with no per-frame React state (code-verified).
- 1,000-item behavior verified live on Web and captured in Android/iOS
  artifacts.
- A 10,000-item stress run was executed during development (Web content height
  scaled exactly 10× with only the window mounted; the Android emulator
  behaved as at 1k). It was **not** re-run in the final audit, and the app
  ships with 1,000 items.
- No FPS or frame-time benchmarks were recorded; performance statements are
  limited to structural measurements such as mount counts.

## Known warnings / non-issues

Warnings a reviewer may reasonably encounter:

- **Vite chunk-size warning** — the production bundle is a single ~703KB JS
  chunk (~209KB gzip). Acknowledged trade-off for an app of this size;
  code-splitting is deliberately not configured.
- **React Native `DrawerLayoutAndroid` deprecation warning** — React Native
  0.87 reports this while loading `react-native-gesture-handler` 3.2.1. The
  application does not use `DrawerLayoutAndroid`; the warning originates from
  RNGH's public entry point evaluating legacy compatibility exports. The
  project intentionally keeps the supported public RNGH API rather than
  suppressing the warning, using deep imports, patching the dependency, or
  downgrading React Native.
- **No dependency build-script allowlisting needed** — npm runs dependency
  build scripts by default, so esbuild's postinstall executes without any
  extra step.
- **Node engine warning** — the repo requires Node ≥ 22.13 (CI pins Node 22);
  older Node versions print an engine warning while all gates still pass.
- **Web animation runtime** — on Web, Reanimated runs on the main thread
  (browsers have no UI-thread worklet runtime); on native, the same code runs
  on the UI runtime. This is a platform property, documented rather than
  worked around.
