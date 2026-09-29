# Observability And Operations

## Current State

No logging framework, metrics, tracing, health checks, error boundary, deployment config, CI, or alerting exists. The closest thing to observability is the local timeline event list created by [`addEvent`](../../../src/App.jsx#L51-L62) and rendered by [`Timeline`](../../../src/App.jsx#L690-L704).

## How Would I Know This Broke?

| Flow | Current signal | Production signal |
| --- | --- | --- |
| Plan change | Timeline event in UI. | API logs, Stripe webhook reconciliation, audit log. |
| Failed payment | Ledger fields at [`src/App.jsx:386-390`](../../../src/App.jsx#L386-L390). | Payment failure metric, dunning job status, email delivery. |
| Recommendation | Recommendation queue at [`src/App.jsx:443-452`](../../../src/App.jsx#L443-L452). | Scoring distribution, excluded-item alerts. |
| Inventory reserve | Stock counts in table at [`src/App.jsx:536-550`](../../../src/App.jsx#L536-L550). | Reservation job logs, stock mismatch alerts. |
| Shipment batch | Workbench rows at [`src/App.jsx:619-631`](../../../src/App.jsx#L619-L631). | Job run records, duplicate shipment alerts, exception queue metrics. |

## Future Operational Basics

- Structured logs with request/job IDs.
- Metrics for successful/failed plan changes, payment retries, generated shipments, stock exceptions.
- Traces for API to Stripe/database calls.
- Error boundary around React app.
- Health checks for API and workers.
- Rollback plan for deployments.
- Replayable jobs with idempotency keys.

Drill: define three metrics for the fulfillment batch. Strong answer includes counter, failure reason, and cycle labels.
