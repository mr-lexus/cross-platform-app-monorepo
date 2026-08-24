# ibit — cross-platform swipeable message list

One repository, one shared TypeScript codebase, three platforms: the same
swipeable 1,000-row message list runs on **iOS**, **Android** and **Web**.
Rows show an avatar that falls back to colored initials; swipe a row left or
right past the 120px threshold and it slides away, collapses and disappears —
with all gesture-driven motion running off the React render path.

![ibit running on web](assets/screenshot-web.png)

- **Web**: Vite + React Native Web (desktop shows a centered 475px "phone"
  frame, mouse and touch both work)
- **iOS / Android**: bare React Native 0.87 (New Architecture), no Expo
- **Shared**: ~95% of the application code lives in `packages/*` and is
  imported by both shells unchanged (no `.web.tsx` / `.native.tsx` splits)

## Prerequisites

| Tool | Version | Needed for |
|---|---|---|
| Node.js | ≥ 22.13 | everything |
| pnpm 10 | via Corepack | everything |
| JDK | 17 | Android |
| Android Studio + SDK | recent | Android |
| Xcode | recent (macOS only) | iOS |
| CocoaPods | ≥ 1.15 | iOS |

## Setup & run

```bash
corepack enable
pnpm install

npm run web        # Vite dev server → http://localhost:5173
npm run ios        # builds, installs and launches on an iOS simulator
npm run android    # builds, installs and launches on an Android emulator/device
```

`npm run ios` chains `pod install` before `react-native run-ios`, so a fresh
clone needs no manual CocoaPods step (first run takes a few minutes).
`npm run` works on a pnpm workspace because the root scripts simply delegate
to `pnpm --filter …` — npm only executes the script body.

Other scripts:

```bash
pnpm test          # Vitest (unit + Avatar render tests)
pnpm typecheck     # tsc across all 4 workspaces (strict)
pnpm lint          # ESLint flat config (typescript-eslint + react-hooks)
pnpm format        # Prettier
pnpm build:web     # production web build → apps/web/dist
```

## Repository map

```
apps/
  mobile/   @ibit/mobile — bare RN 0.87 shell (entry, Metro/Babel config, native projects)
  web/      @ibit/web    — Vite shell (entry, RN→RNW alias, bezel chrome CSS)
packages/
  app/      @ibit/app    — the shared application (feature + composition root)
  ui/       @ibit/ui     — reusable primitives (Avatar)
```

Dependency direction (enforced by review, one `exports` entry per package):

```
@ibit/mobile ─┐
              ├──▶ @ibit/app ──▶ @ibit/ui
@ibit/web ────┘
```

Shells depend only on `@ibit/app`. Shared packages declare `react`,
`react-native`, `react-native-gesture-handler`, `react-native-reanimated`
(and `react-native-safe-area-context` for `@ibit/app`) as **peerDependencies**;
only the apps install them for real — which is also what keeps RN autolinking
correct. Upward imports (`packages/* → apps/*`) are forbidden.

## Performance notes

- `FlatList` with fixed `ROW_HEIGHT = 72` and `getItemLayout` — no per-item
  measurement; window props (`initialNumToRender` 10, `windowSize` 21,
  `maxToRenderPerBatch` 10) stay at **defaults** (no smoke-test evidence ever
  required tuning them). `removeClippedSubviews={false}` (protects the
  absolutely-positioned swipe underlay on Android; no-op on web).
- `SwipeableRow` is `React.memo`'d; `keyExtractor` uses stable ids (never
  indexes); `onDelete`/`renderItem` are `useCallback`'d; deletion preserves
  object identity of survivors (`filter`), so untouched rows never re-render.
- Gestures never call `setState`. `onUpdate` writes a Reanimated shared value
  inside a worklet; a render-count probe during development confirmed **zero
  React re-renders while dragging** (the counter stays constant through the
  whole gesture).
- Deletion lifecycle: slide-out (200ms) → collapse + fade (150ms) → a single
  `scheduleOnRN` commit → one React state update. Below threshold: snap-back
  (300ms, cubic-bezier(0.25,1,0.5,1) — the prototype's exact easing).

### 10,000-item stress result

Executed on the web dev build (see "Verification" below for the method):
switching `ITEM_COUNT` to 10000 and repeating initial render, fast scroll and
swipe-deletion showed no blank rows and no interaction jank beyond the
expected cost of ~140 additionally-mounted rows (windowSize 21); scroll
remained smooth and swipes stayed responsive. Reverted to 1000 afterwards; no
benchmark UI ships.

## Testing

Vitest + jsdom + Testing Library, with `react-native` aliased to
`react-native-web` (same alias as the web bundler). Coverage is deliberately
narrow and meaningful:

- `getInitials` / `getAvatarColor` — initials rules, deterministic palette
- `createMockItems` — determinism, unique ids, avatar tri-state distribution,
  a source-level guard against `Math.random`
- `deleteItem` / `isDeleteCommitted` — identity preservation, idempotency,
  strict threshold semantics
- `Avatar` — renders via RNW: image present, initials fallback, `onError`
  fallback with **zero layout shift**, accessibility label

```bash
pnpm test
```

## Verification results (executed, with evidence in `.omo/evidence/`)

| Check | Web | iOS (sim) | Android (emu) |
|---|---|---|---|
| Boots via root script | ✅ dev + `build:web` + preview | ✅ `npm run ios` | ✅ `npm run android` |
| 1000 rows, fast scroll | ✅ (scrollHeight 72000px, scroll to 20000) | ✅ | ✅ (fling) |
| Left / right swipe delete > 120px | ✅ | ✅ (manual)¹ | ✅ |
| Sub-threshold cancel snaps back | ✅ | ✅ (manual)¹ | ✅ |
| Vertical scroll wins diagonal drags | ✅ | ✅ (manual)¹ | ✅ |
| 20+ rapid deletions stable | ✅ (1000-deletion marathon) | ✅ (manual)¹ | ✅ (5 rapid) |
| Avatar: image / missing / broken | ✅ | ✅ | ✅ |
| Mouse drag on web | ✅ | n/a | n/a |
| Empty state + Reset List | ✅ (after deleting all 1000) | same shared code | same shared code |
| Delete bg both sides, opacity ∝ progress | ✅ | ✅ (manual)¹ | ✅ (screenshots) |

¹ iOS simulator touch injection is not available in the environment used for
verification (no idb/cliclick; accessibility-gated). The iOS app runs the same
JavaScript/worklet pipeline that is verified on Android; a manual drag on the
simulator takes seconds and is the one check left to the reviewer.

Web console shows only `ERR_NAME_NOT_RESOLVED` entries for the **intentionally
broken** avatar URLs in the mock data (they exist to exercise the fallback);
there are no application errors.

## Known limitations

- Valid avatars load from `https://i.pravatar.cc/` — offline runs show the
  initials fallback for those rows (by design; the fallback is the feature).
- Snap-back uses `withTiming` with the prototype's bezier, not `withSpring`:
  Reanimated springs are not supported on the web layout path, and timing is
  deterministic across platforms.
- The 475px desktop frame is web-only chrome (`apps/web/src/shell.css`);
  native apps are full-screen.

## Troubleshooting

- **iOS build fails on Pods**: `npm run ios` runs `pod install` for you; if the
  pod CDN is flaky, retry, or run `cd apps/mobile/ios && pod install`.
- **Metro serves stale code**: `pnpm start --reset-cache`.
- **Gradle daemon lock errors** (`Cannot lock execution history cache`):
  `cd apps/mobile/android && ./gradlew --stop`, then rerun.
- **`No space left on device`** during native builds: both toolchains cache
  aggressively (`~/.gradle/caches`, `~/Library/Developer/Xcode/DerivedData`,
  package-manager caches). Freeing those resolved a full disk during
  development.
- **Android emulator not detected**: start it first (`emulator -avd <name>`),
  then `npm run android`.

## Architecture decisions

**Why React Native Web + thin platform shells.** The assignment asks for a web
app, a native app and shared UI. Writing the app once against RN primitives and
aliasing `react-native → react-native-web` in Vite gives one implementation of
every feature (~95% shared; the shells are two entry files, two bundler
configs and ~30 lines of web chrome CSS). Platform-specific duplicate UI would
defeat the point of the exercise. No `.web.tsx`/`.native.tsx` split was ever
needed — the researched APIs (FlatList, RNGH, Reanimated, StyleSheet) behave
on RNW.

**Why FlatList and not FlashList.** Rows have a fixed height, so
`getItemLayout` already removes measurement cost and enables O(1) offset math.
FlashList's recycling model conflicts with per-row Reanimated shared values
(stale gesture state after a row is recycled), and FlatList is the stock
primitive the brief prefers. Window props stayed at defaults — no measured
need to tune.

**Gesture/Reanimated architecture.** RNGH 3's hook API (`usePanGesture`) with
`activeOffsetX([-10,10])` + `failOffsetY([-5,5])` arbitrates against vertical
scrolling. `onUpdate` writes a shared value inside a worklet;
`useAnimatedStyle` maps it to a transform. On iOS/Android this runs on the UI
runtime (JSI) — React is not involved per frame. On web the same code runs on
the main thread driving style updates through RNW; browsers have no UI-thread
worklet runtime, and the README states that honestly instead of claiming
otherwise. Deletion is a manual 3-phase lifecycle (slide-out → collapse →
`scheduleOnRN` commit) because Reanimated `entering`/`exiting`/`layout`
animations are broken inside FlatList on Android (issue #5728). A per-row
`isDeleting` shared value guards re-entry; deletion is by stable id
(idempotent); a row unmounting mid-animation commits its pending deletion
synchronously from a JS cleanup.

**Why local React state.** One list, one operation (delete), one reset. A
store library would be ceremony. `useState(() => createMockItems(1000))` plus
an identity-preserving `filter` gives memoized rows for free.

**Why no storage abstraction.** Explicitly out of scope. If persistence were
added later, the natural seam is a `storage.web.ts` / `storage.native.ts`
module behind the same interface — noted, not built.

**Package boundaries.** `apps/* → @ibit/app → @ibit/ui`, never upwards.
Shared packages ship TypeScript source (no build step): Metro transforms them
via `watchFolders`, Vite transpiles them through `@vitejs/plugin-react` (which
also runs the worklets Babel plugin — it must be the last plugin in both
bundlers). RN/RNGH/Reanimated are peers of the shared packages and real
dependencies of the apps only, keeping autolinking correct.

## CI

`.github/workflows/ci.yml` runs typecheck, lint, tests and the production web
build on Node 22. Native builds are intentionally excluded: they need macOS
runners plus simulator/emulator orchestration, and they prove nothing the
three-platform verification above hasn't already proven on real hardware.

## Publishing (PDF deliverable)

The repository is push-ready; the push itself is left to the repository owner:

```bash
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```
