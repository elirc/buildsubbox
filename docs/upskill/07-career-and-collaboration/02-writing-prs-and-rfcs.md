# Writing PRs And RFCs

## PR Description Template

```md
## What changed

## Why

## How tested

## Screenshots/logs

## Risks

## Follow-ups
```

## Example PR Summary

```md
## What changed
Extracted shipment status transition logic from `Fulfillment`.

## Why
The current transition map lives inside `advanceShipment` at `src/App.jsx:571-582`, which makes it harder to test.

## How tested
- npm run build
- Manually advanced Generated -> Picking -> Packed -> Shipped

## Risks
Unknown statuses may behave differently if not preserved.

## Follow-ups
Add Vitest tests once test harness exists.
```

## Commit Messages

Prefer:

- `Extract shipment status transition helper`
- `Add empty state for fulfillment exceptions`
- `Document local development commands`

Avoid:

- `fix stuff`
- `updates`
- `big refactor`

## When To Write An RFC

Write an RFC when the change affects money, auth, persistence, jobs, APIs, or long-term architecture. Examples:

- Real Stripe billing replacing [`src/App.jsx:299-345`](../../../src/App.jsx#L299-L345).
- Fulfillment worker replacing [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).
- Database schema replacing [`src/data.js`](../../../src/data.js#L1-L203).

## RFC Template

```md
# RFC: [Title]

## Problem
## Goals
## Non-goals
## Current behavior
## Proposed design
## API/data model
## Security and authorization
## Reliability and idempotency
## Migration plan
## Test plan
## Rollout and rollback
## Open questions
```
