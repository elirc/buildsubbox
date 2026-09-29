# JavaScript Runtime Model

## Concept: Browser JavaScript Is Event-Driven

The browser waits for user events, runs event handlers synchronously, schedules React state updates, then React renders the new view. In this repo, clicking "Skip June" runs `toggleSkip` at [`src/App.jsx:222-231`](../../../src/App.jsx#L222-L231). Clicking rating stars runs `rateItem` at [`src/App.jsx:409-418`](../../../src/App.jsx#L409-L418).

Why it matters in production: user actions can happen quickly, handlers close over render-time values, and side effects must not assume state has already changed.

Failure modes:

- Stale closure: `toggleSkip` logs text using `subscriber.skipNext` from the current render while also scheduling an update at [`src/App.jsx:222-231`](../../../src/App.jsx#L222-L231).
- Randomness: batch IDs use `Math.random()` at [`src/App.jsx:559`](../../../src/App.jsx#L559-L559), which makes deterministic testing harder.
- Time: event IDs use `Date.now()` at [`src/App.jsx:54`](../../../src/App.jsx#L54-L54), which is convenient but not collision-proof.

Drill: click "Fail invoice" twice in your head. What happens to `balance` at [`src/App.jsx:316-323`](../../../src/App.jsx#L316-L323)? What invariant would prevent duplicate failure charges?

Self-grade:

- Basic: identifies the click handler.
- Solid: explains state update scheduling.
- Strong: names stale closures, determinism, and idempotency.

## Concept: Immutable Updates

React state should be replaced, not mutated in place. This repo uses object and array copies:

- Subscriber status update: [`src/App.jsx:213-219`](../../../src/App.jsx#L213-L219).
- Nested preference update: [`src/App.jsx:402-406`](../../../src/App.jsx#L402-L406).
- Rating update/insert: [`src/App.jsx:409-416`](../../../src/App.jsx#L409-L416).
- Inventory stock update: [`src/App.jsx:500-503`](../../../src/App.jsx#L500-L503).

Failure modes:

- Mutating an object can prevent React from seeing the change.
- Updating nested state without copying parent objects can leak old references.
- Duplicating derived state creates consistency bugs.

Drill: rewrite the preference update as fake mutating code, then explain why the real version is safer.

## Concept: Derived Data

Derived data is computed from source state. It should usually not be stored separately. This repo derives:

- `selectedItems`, `boxCost`, `boxRetail`, and `matchRate` at [`src/App.jsx:79-87`](../../../src/App.jsx#L79-L87).
- `scoredItems` through `useMemo` at [`src/App.jsx:74-77`](../../../src/App.jsx#L74-L77).

Why it matters: if you store both item IDs and item objects, they can diverge after inventory changes.

Failure modes:

- Missing dependency in `useMemo` creates stale results.
- Expensive derived calculations can slow render if data grows.

Drill: if inventory item `itm_101` stock changes, which derived values should update and why?

## JavaScript Interview Hooks From This Repo

- Explain closure and state timing using [`toggleSkip`](../../../src/App.jsx#L222-L231).
- Explain array `map`, `filter`, `reduce`, and `sort` through [`src/App.jsx:79-87`](../../../src/App.jsx#L79-L87) and [`src/App.jsx:710-716`](../../../src/App.jsx#L710-L716).
- Explain pure vs impure functions: `scoreItem` is pure for given inputs at [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725); `generateBatch` is impure because it uses random IDs and state updates at [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).
