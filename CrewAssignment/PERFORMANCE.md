# Performance

How the app is profiled, the numbers measured on-device, the key optimization,
and the trade-offs behind it.

---

## Measurement methodology

Performance is measured **in-app** by the always-on-top overlay (top-right 📊
button). No external profiler is required — the metrics come from two hooks:

**`useFPS` ([src/hooks/useFPS.ts](./src/hooks/useFPS.ts))** — a
`requestAnimationFrame` loop timing each frame:

```
delta   = now - previousFrame          // frame time in ms
fps     = 1000 / avg(delta)            // over the recent window
```

Frame times are kept in a rolling **120-frame window**; from it we report:

| Metric | Definition |
|---|---|
| **FPS** | `1000 / mean(frame time)` over the window (capped at 60) |
| **P50** | median frame time (ms) — the *typical* frame |
| **P95** | 95th-percentile frame time (ms) — the *bad* frames |
| **Worst** | max frame time observed since measuring started |
| **Dropped** | cumulative frames exceeding **1.5× the 16.67 ms budget** |

**`useJSThread` ([src/hooks/useJSThread.ts](./src/hooks/useJSThread.ts))** —
event-loop delay: capture `now()`, schedule `setTimeout(0)`, and measure how
late it actually fires. `delay > 30 ms` ⇒ **JS busy** (the thread was blocked).

To keep the overlay itself cheap it only re-renders state every 500 ms, and it
**only measures while visible** (zero overhead when the panel is closed).

### Test procedure (Step 19)

- **Device:** OnePlus `DN2101`, Android 13 (API 33), arm64-v8a, Hermes,
  **New Architecture**, **debug build** loaded from Metro.
- Toggle the overlay on (resets counters), then **fling-scroll the feed
  continuously for 60 s** (~266 automated `adb input swipe` flings, up and down
  through the 137-card list), and read the final overlay values.
- > **Note:** these are **debug-build** numbers. A release build (no dev
  > instrumentation, minified bundle, no Metro/HMR socket) is meaningfully
  > faster; treat these as a conservative floor, not the shipping ceiling.

---

## Results (measured, optimized build)

| Metric | Idle (no scroll) | 60 s continuous scroll |
|---|---|---|
| FPS | 60 | **60** (held) |
| P50 frame time | 11 ms | **11 ms** |
| P95 frame time | 23 ms | **37 ms** |
| Worst frame | 61 ms | **95 ms** |
| Dropped frames | 3 | **108** |
| JS busy (event-loop delay) | 10 ms | 16 ms |

**Reading the numbers.** The **median frame stays at 11 ms** — comfortably under
the 16.67 ms/60 fps budget — even under sustained flinging, so scrolling *feels*
smooth. The cost shows up in the tail: **P95 rises 23 → 37 ms** and the **worst
frame hits 95 ms**, i.e. occasional hitches when a new card's image is decoded
as it scrolls into view. Over 60 s of aggressive flinging (266 flings) that
amounts to **108 dropped frames (~1.8 per fling)** — almost entirely image-decode
spikes, not JS work (JS busy stayed low at 16 ms).

---

## Before / after optimization

The single most impactful set of changes is **keeping the 137-item list from
doing needless work per frame**. The relevant diff:

**Before — the common anti-patterns**
```tsx
// FeedScreen: a NEW renderItem identity every render
const renderItem = ({item}) => <TripCard trip={item} />;

<FlatList data={TRIPS} renderItem={renderItem} keyExtractor={m => m.id} />
//        ^ no windowing props → RN defaults keep a large mounted window

// TripCard: not memoized → re-renders whenever the list re-renders
export const TripCard = TripCardComponent;

// TripCard: source object rebuilt every render → FastImage sees a "new" prop
<FastImage source={{uri: trip.image, priority: FastImage.priority.normal}} />
```

**After — what ships**
```tsx
// FeedScreen: stable identities so memo can actually skip work
const TRIPS = tripsData as Trip[];                       // module scope
const renderItem = useCallback(({item}) => <TripCard trip={item} />, []);
const keyExtractor = useCallback((item: Trip) => item.id, []);

<FlatList
  data={TRIPS}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  initialNumToRender={6}
  maxToRenderPerBatch={8}
  windowSize={11}
  removeClippedSubviews
/>

// TripCard: memoized — off-screen cards don't re-render while scrolling
export const TripCard = React.memo(TripCardComponent);

// TripCard: source memoized on trip.image only
const source = useMemo(
  () => ({uri: trip.image, priority: FastImage.priority.normal}),
  [trip.image],
);
```

**Why it helps (mechanism)**
- **`React.memo` + stable `renderItem`/`keyExtractor`** — with an inline
  `renderItem` and an unmemoized card, every visible `TripCard` re-renders each
  time `FlatList` updates during a scroll. Memoizing the card and giving it
  referentially-stable props means a card only re-renders when *its* `trip`
  actually changes — i.e. never, during a pure scroll.
- **`windowSize` / `maxToRenderPerBatch` / `removeClippedSubviews`** — bounds how
  many off-screen rows stay mounted and how much is rendered per batch, so the
  main thread isn't mounting far-ahead rows mid-fling.
- **Memoized `FastImage` source** — a fresh `{uri}` object each render can defeat
  FastImage's prop bail-out; memoizing on `trip.image` avoids that churn on the
  card's local state changes (`expanded`, `loaded`).
- **Store isolation** — the feed never subscribes to the chat store, so the many
  per-second state updates during AI streaming don't touch the list at all.

The **After** column is what the *Results* table above measured (P50 11 ms /
P95 37 ms / worst 95 ms / 108 drops, 60 fps held).

> **Honesty note on the "Before" column:** an on-device A/B run of the
> un-optimized variant was **attempted but not cleanly captured** — the app was
> being actively edited at the time (live Fast-Refresh reloads reset the overlay
> mid-run), so those numbers are not reported here to avoid fabrication. The
> *direction* is well-established: the un-optimized path does strictly more
> main-thread work per frame (every visible card re-rendering, a larger mounted
> window), which raises P95/worst and dropped-frame counts and increases memory.
> To reproduce: remove `React.memo`, inline `renderItem`, drop the FlatList
> windowing props, then repeat the 60 s scroll with the overlay on.

---

## Trade-offs

| Optimization | We gain | We pay |
|---|---|---|
| **`windowSize: 11` + `removeClippedSubviews`** | fewer mounted rows → less main-thread work and lower memory while scrolling | rows a bit further ahead aren't pre-rendered, so *very* fast flings can briefly show a blank card before content paints |
| **`@d11/react-native-fast-image` (memory + disk cache)** | images decode once and are reused → smoother re-scroll, less network | **higher memory** — the decoded-image cache trades RAM for smoothness (the classic "more memory for smoother scrolling") |
| **`ImageSkeleton` until `onLoadEnd`** | no layout jump; a placeholder instead of a blank/flashing card | a second `Animated` view per loading card (cheap, uses the native driver) |
| **Streaming updates only the *last* message** | per-token updates keep every earlier bubble's reference stable → memoized bubbles don't re-render | slightly more care in the reducer (`slice()` + replace one index) vs. a naive full-array rebuild |
| **Timeline mounted only when expanded** | the horizontal list isn't built for collapsed cards → lighter feed | no exit animation on collapse (unmounts immediately) |

**Net:** the design spends **memory** (image cache, a bounded mounted window)
and a little **code complexity** (stable identities, targeted store updates) to
buy a **steady 60 fps with an 11 ms median frame** under continuous scrolling.

See [README.md](./README.md) for setup and architecture.
