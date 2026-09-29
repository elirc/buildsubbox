# Testing Strategy

## Current State

No test files or test script were found. [`package.json`](../../../package.json#L6-L10) defines only `dev`, `build`, and `preview`.

## Recommended Test Layers

| Layer | What belongs there | Repo examples |
| --- | --- | --- |
| Unit tests | Pure helpers and transitions. | `scoreItem` at [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725), `scoreInventory` at [`src/App.jsx:710-716`](../../../src/App.jsx#L710-L716), shipment transition at [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582). |
| Component tests | User interactions and visible state. | Skip flow at [`src/App.jsx:222-291`](../../../src/App.jsx#L222-L291), billing flow at [`src/App.jsx:298-399`](../../../src/App.jsx#L298-L399). |
| E2E tests | Cross-tab workflows in browser. | Change preference, see recommendations; generate batch, see shipment row. |
| Contract tests | Future API request/response shapes. | Plan change, rating, inventory reservation. |
| Type tests | Future TypeScript contracts. | Plan IDs, shipment statuses, item IDs. |

## What Not To Test

- Exact implementation details of `useState`.
- Every CSS color.
- Lucide icon rendering.
- Static copy unless it is part of a business requirement.

## Fixtures And Builders

Start with small builders for plan, subscriber, item, rating, shipment. Avoid reusing the entire seed data for every test; targeted fixtures make failures clearer.

## Time And Randomness

Replace or inject:

- `Date.now()` in [`src/App.jsx:54`](../../../src/App.jsx#L54-L54).
- `Math.random()` in [`src/App.jsx:559`](../../../src/App.jsx#L559-L559).

Without control, tests become flaky.

## Flake Prevention

- Prefer role/text queries for visible UI.
- Avoid testing implementation order unless order is the requirement.
- Use deterministic IDs in helper tests.
- Keep async tests tied to user-visible state.
