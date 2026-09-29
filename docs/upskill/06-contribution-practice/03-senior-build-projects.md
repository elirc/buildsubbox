# Senior Build Projects

## Project 1: Production Billing Boundary

Problem: billing is simulated in the browser at [`src/App.jsx:299-345`](../../../src/App.jsx#L299-L345).
Product value: safe recurring subscription changes.
Design checklist: auth, server-side price lookup, Stripe subscription update, webhook reconciliation, audit log.
Architecture decisions: API route vs service; local projection schema; idempotency keys.
Likely files/modules: future API/server, billing domain, frontend service client.
Migration plan: keep simulation, add mocked service, then real backend.
Test plan: unit proration policy, API auth, webhook idempotency, UI integration.
Security plan: no secrets in browser, verify webhooks.
Performance plan: no synchronous long Stripe waits in UI.
Rollout/rollback: feature flag real billing.
Open questions: immediate vs period-end downgrade.
Stretch: customer portal integration.

## Project 2: Fulfillment Batch Worker

Problem: month-start job is a button handler at [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).
Product value: reliable shipment generation.
Design checklist: schedule, idempotency, unique constraints, retries, job logs.
Architecture decisions: cron worker vs queue; outbox for warehouse messages.
Likely files/modules: worker, shipment domain, DB schema, admin UI.
Migration plan: model cycle field first, then worker.
Test plan: duplicate run, partial failure, skipped subscriber.
Security plan: worker identity only.
Performance plan: bounded concurrency.
Rollout/rollback: dry-run mode first.
Open questions: cut-off date for preference changes.
Stretch: warehouse label integration.

## Project 3: Preference And Recommendation Service

Problem: scoring lives in UI at [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725).
Product value: explainable personalization.
Design checklist: hard exclusions, soft preferences, rating history, explainability.
Architecture decisions: client-side preview vs server-calculated recommendations.
Test plan: deterministic scoring fixtures, regression snapshots.
Security plan: ratings only for received items.
Performance plan: precompute or cache for large inventory.
Rollout/rollback: compare old/new scores.
Open questions: user control over excluded tags.
Stretch: A/B test scoring weights.

## Project 4: Inventory Reservation System

Problem: reservation decrements local stock at [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504).
Product value: prevent overselling.
Design checklist: stock ledger, reservations, releases, cycle ownership.
Architecture decisions: ledger vs mutable stock count.
Test plan: concurrent reservations, rollback, duplicate command.
Security plan: admin-only.
Performance plan: indexed item/cycle lookups.
Rollout/rollback: shadow reservation before enforcing.
Open questions: substitutions when stock short.

## Project 5: Observability And Audit Trail

Problem: event timeline is local at [`src/App.jsx:51-62`](../../../src/App.jsx#L51-L62).
Product value: support, compliance, debugging.
Design checklist: actor, resource, event type, correlation ID, severity.
Test plan: action emits audit row once.
Security plan: protect PII in logs.
Performance plan: async nonblocking writes.
Rollout/rollback: dual-write local UI events and audit events.
Open questions: retention policy.

## Project 6: Type Safety Migration

Problem: data contracts are implicit in JavaScript.
Product value: safer refactors.
Design checklist: JS with JSDoc vs TypeScript, migration order, strictness.
Likely files: [`src/data.js`](../../../src/data.js#L1-L203), [`src/App.jsx`](../../../src/App.jsx#L1-L728).
Test plan: build/typecheck plus existing tests.
Security plan: runtime validation still required.
Performance plan: no runtime cost unless validators added.
Rollout/rollback: file-by-file.
Open questions: team appetite for TypeScript.
