# Mid-Level Feature Tickets

Each ticket requires a design note before implementation.

## Ticket 1: Add Test Harness And First Domain Tests

Scope: install Vitest, extract scoring helpers from [`src/App.jsx:710-725`](../../../src/App.jsx#L710-L725), add tests.
Risk: tooling churn.
Rollback: remove dependency/scripts and helper extraction.
Acceptance: `npm test` and `npm run build` pass.

## Ticket 2: Split `App.jsx` Into Feature Modules

Scope: move Portal, Billing, Preferences, Curator, Fulfillment into `src/features/*`.
Anchors: [`src/App.jsx:209-635`](../../../src/App.jsx#L209-L635).
Risk: import churn and behavior drift.
Rollback: move components back.
Acceptance: no behavior change; build passes.

## Ticket 3: Add Reducer For Subscription State

Scope: replace related subscriber mutations with reducer actions.
Anchors: [`src/App.jsx:213-345`](../../../src/App.jsx#L213-L345).
Risk: stale event copy, action naming.
Rollback: restore `useState` handlers.
Acceptance: skip, pause, cancel, plan change, retry still work.

## Ticket 4: Add Persistent Prototype Storage

Scope: persist selected safe state to localStorage.
Anchors: [`src/App.jsx:64-71`](../../../src/App.jsx#L64-L71).
Risk: privacy and schema drift.
Rollback: feature flag or remove persistence.
Acceptance: reload preserves non-sensitive state; reset option exists.

## Ticket 5: Add Realistic Shipment Cycle Model

Scope: add cycle month to shipments and generated batch.
Anchors: [`src/data.js:175-203`](../../../src/data.js#L175-L203), [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).
Risk: UI clutter.
Rollback: hide cycle field.
Acceptance: duplicate generation for same cycle is prevented.

## Ticket 6: Add Admin Item Search And Filters

Scope: filter inventory by category, segment, stock risk.
Anchors: [`src/App.jsx:536-550`](../../../src/App.jsx#L536-L550).
Risk: state complexity.
Rollback: remove filters.
Acceptance: filters compose and show empty state.

## Ticket 7: Strict Exclusion Enforcement

Scope: excluded tags cannot appear in recommendations or selected box without warning.
Anchors: [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725), [`src/App.jsx:209-296`](../../../src/App.jsx#L209-L296).
Risk: removing current selected items unexpectedly.
Rollback: show warnings only.
Acceptance: excluded items are visibly handled.

## Ticket 8: Add Accessibility Pass

Scope: keyboard labels, focus states, tab semantics, contrast review.
Anchors: [`src/App.jsx:123-139`](../../../src/App.jsx#L123-L139), [`src/style.css:38-64`](../../../src/style.css#L38-L64).
Risk: visual changes.
Rollback: isolate CSS changes.
Acceptance: keyboard can operate major flows.

## Ticket 9: Add Error Boundary

Scope: catch render failures like invalid plan.
Anchors: [`src/main.jsx:6-10`](../../../src/main.jsx#L6-L10), [`src/App.jsx:48-49`](../../../src/App.jsx#L48-L49).
Risk: hiding bugs.
Rollback: remove boundary wrapper.
Acceptance: clear fallback UI and console error.

## Ticket 10: Add Mock Backend Design And Contract Tests

Scope: define API contracts for plan change, rating, skip, batch generation.
Anchors: billing [`src/App.jsx:299-345`](../../../src/App.jsx#L299-L345), rating [`src/App.jsx:409-418`](../../../src/App.jsx#L409-L418).
Risk: premature API shape.
Rollback: keep as docs only.
Acceptance: contracts list validation/auth/idempotency.

## Ticket 11: Add Playwright Smoke Tests

Scope: test nav, skip, rating, batch generation in browser.
Anchors: [`src/App.jsx:123-166`](../../../src/App.jsx#L123-L166).
Risk: flaky selectors.
Rollback: remove flaky tests.
Acceptance: stable tests in CI-ready command.

## Ticket 12: Add Design Tokens

Scope: formalize CSS variables and component spacing.
Anchors: [`src/style.css:1-22`](../../../src/style.css#L1-L22).
Risk: cosmetic churn.
Rollback: keep variable aliases.
Acceptance: no visual regression beyond intended token names.
