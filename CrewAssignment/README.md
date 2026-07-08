# CrewAssignment

A React Native (0.86, New Architecture) travel feed with a performant list of ~137 trips,
an AI chat assistant in a bottom-sheet overlay, and a built-in performance overlay
(FPS / dropped frames / JS-thread busy / frame-time percentiles).

---

## Setup

**Prerequisites**
- Node **>= 22.11** (see `engines` in `package.json`)
- Ruby + Bundler + CocoaPods (iOS)
- JDK 17, Android SDK, a connected device or emulator (Android)

**Install**
```bash
npm install
# iOS only:
cd ios && bundle install && bundle exec pod install && cd ..
```

**Run**
```bash
# Terminal 1 — Metro (use --reset-cache the first time after any babel change):
npm start            # or: npm start -- --reset-cache

# Terminal 2:
npm run android      # or: npm run ios
```

> **Physical Android device gotcha:** the app loads its JS from Metro over
> `adb reverse tcp:8081 tcp:8081`. If the app hangs on *"Loading from
> localhost:8081…"*, the USB tunnel has stalled — run
> `adb reverse tcp:8081 tcp:8081` (or `adb kill-server && adb start-server`,
> then re-add the reverse) and reload.

> **Native modules:** Reanimated, Worklets, gesture-handler, screens,
> safe-area-context, and fast-image are native. After adding/upgrading any of
> them you must rebuild the app (`npm run android` / `pod install` + `npm run ios`),
> not just restart Metro.

---

## Architecture

Single-screen navigation; the AI is an overlay, not a route.

```
index.js  ── import 'react-native-gesture-handler' (first line)
   │
App.tsx
   └─ GestureHandlerRootView
        └─ SafeAreaProvider
             ├─ AppNavigator            (NavigationContainer → native-stack)
             │    └─ FeedScreen         ← the only route ("Explore Trips")
             │         ├─ FlatList<Trip>
             │         │     └─ TripCard (React.memo)
             │         │          ├─ FastImage + ImageSkeleton
             │         │          └─ Timeline (mounted only when expanded)
             │         ├─ Fab           (absolute, opens the sheet)
             │         └─ BottomSheetChat (@gorhom/bottom-sheet, snaps 40%/90%)
             │              └─ ChatPanel → MessageBubble (React.memo)
             └─ PerformanceOverlay      (always-on-top; useFPS + useJSThread)
```

**Folder layout** (`src/`)

| Folder | Contents |
|---|---|
| `screens/` | `FeedScreen` — the feed + FAB + sheet |
| `navigation/` | `AppNavigator` — single native-stack route |
| `components/` | `TripCard`, `Timeline`, `ImageSkeleton`, `Fab`, `BottomSheetChat`, `ChatPanel`, `MessageBubble`, `PerformanceOverlay` |
| `hooks/` | `useFPS` (rAF frame stats), `useJSThread` (event-loop delay) |
| `services/` | `mockAI` — simulated streaming LLM |
| `store/` | `chatStore` — zustand chat state |
| `utils/` | `now` — high-res timestamp helper |
| `assets/` | `trips.json` — 137 mock trips |

**Key flows**
- **Feed → chat:** the FAB calls `sheetRef.current?.snapToIndex(0)` to open the
  sheet to 40%. The sheet renders as a sibling of the `FlatList`, so opening it
  **overlays the feed without unmounting it**.
- **Expandable timeline:** pressing *Details* flips local `expanded` state; the
  horizontal `Timeline` is **mounted only while expanded** and animates in with
  Reanimated (`useSharedValue` + `withTiming`).
- **Streaming chat:** `sendMessage` appends a user message + an empty assistant
  placeholder, then `mockAI.streamReply` emits the reply word-by-word;
  `appendBotToken` updates **only the latest** message object.
- **Performance overlay:** the top-right 📊 button toggles the panel; measuring
  runs only while visible. `useFPS` samples `requestAnimationFrame` frame times;
  `useJSThread` measures event-loop delay via `setTimeout(0)`.

---

## State management rationale

Two intentionally separate concerns:

1. **Feed data** is static (`trips.json`) → imported as a module-level constant
   (`TRIPS`). No store, no context: a stable reference that never triggers
   re-renders. `TripCard` is `React.memo`, and `renderItem`/`keyExtractor` are
   `useCallback`, so scrolling never re-renders visible cards.

2. **Chat state** is dynamic and updates rapidly during streaming → **zustand**.
   Zustand was chosen over Context/Redux because:
   - **Selector subscriptions**: components subscribe to *slices*
     (`useChatStore(s => s.messages)`), so a token update re-renders only the
     chat list — not every consumer, as a Context value change would.
   - **No provider tree**: the store is a hook; nothing needs to wrap the app.
   - **Minimal boilerplate** vs. Redux for a small, well-scoped slice of state.

   **The critical rule: the feed never subscribes to the chat store.** Streaming
   fires many state updates per second; because only `ChatPanel` (inside the
   sheet) reads the store, none of that churn reaches the 137-item feed.

---

## Known limitations

- **Mock AI only.** `services/mockAI.ts` returns canned, word-streamed replies;
  there is no real LLM/network call.
- **`react-native-vector-icons` is installed but unused** — the FAB and overlay
  use emoji to avoid iOS font-registration/native setup for this assignment.
- **`react-native-fast-image` swapped for `@d11/react-native-fast-image`** — the
  original is unmaintained and doesn't support React 19 / New Architecture.
- **Verified on Android** (physical device, New Arch). iOS is wired but was not
  run as part of this exercise; `pod install` is required first.
- **No persistence / offline** for chat; state is in-memory and cleared on reload.
- **No automated tests** beyond the RN template's `App.test.tsx`; verification
  was done via typecheck, lint, and on-device inspection.
- **Timeline collapse is not animated** (mounting is gated on `expanded`, so
  there's no exit animation — only the entrance animates).
- **Node 22+ required**; running on Node 20 produces `EBADENGINE` warnings.

See [PERFORMANCE.md](./PERFORMANCE.md) for the profiling methodology and results.
