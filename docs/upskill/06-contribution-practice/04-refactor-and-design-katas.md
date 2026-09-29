# Refactor And Design Katas

## Kata 1: Identify A Boundary Leak

Task: pick billing, inventory, or fulfillment and explain why current browser logic should move server-side.
Anchors: [`src/App.jsx:299-345`](../../../src/App.jsx#L299-L345), [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504), [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).
Self-grade: strong answer names trust boundary, invariant, idempotency, and test plan.

## Kata 2: Propose An Outbox/Eventing Change

Task: design outbox rows for dunning emails and warehouse shipment messages.
Self-grade: strong answer includes transaction boundary, retry policy, dedupe key, and failure visibility.

## Kata 3: Split A Large Module

Task: propose a no-behavior-change split for [`src/App.jsx`](../../../src/App.jsx#L1-L728).
Self-grade: strong answer moves one feature at a time, preserves imports, and verifies with build/tests.

## Kata 4: Remove Duplication

Task: find repeated row/panel patterns in [`src/App.jsx`](../../../src/App.jsx#L637-L708) and decide what to extract.
Self-grade: strong answer avoids abstraction that hides domain meaning.

## Kata 5: Improve Type Safety

Task: define JS doc or TypeScript types for `ShipmentStatus` and `PlanId`.
Self-grade: strong answer includes runtime validation for external inputs.

## Kata 6: Design A Migration

Task: migrate `skipNext` from subscriber boolean [`src/data.js:40`](../../../src/data.js#L40-L40) to cycle-scoped skips.
Self-grade: strong answer includes backfill, dual-read/write, unique constraint, rollback.

## Kata 7: Reduce Future N+1

Task: rewrite item lookup at [`src/App.jsx:79`](../../../src/App.jsx#L79-L79) as a future database-safe query.
Self-grade: strong answer loads all item IDs in one query and preserves order.

## Kata 8: Write An RFC

Task: draft an RFC for production billing integration.
Self-grade: strong answer covers motivation, API contract, data model, risks, rollout, tests.

## Kata 9: Review A Flawed PR

Task: review a fake PR that sends Stripe secret keys from the browser.
Self-grade: strong answer blocks the PR kindly, explains risk, and proposes backend design.
