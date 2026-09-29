# Side Effects, Async, And Reliability

## Current Side Effects

Current side effects are local state changes. There are no network calls, queues, emails, Stripe calls, file writes, or webhooks.

| Side effect | Anchor | Risk in production |
| --- | --- | --- |
| Add timeline event | [`src/App.jsx:51-62`](../../../src/App.jsx#L51-L62) | Not durable, not ordered by server time. |
| Change plan/balance | [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313) | Client-side money state is untrusted. |
| Fail/retry payment | [`src/App.jsx:316-345`](../../../src/App.jsx#L316-L345) | Duplicate retries/emails possible. |
| Reserve inventory | [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504) | Repeated click decrements stock repeatedly. |
| Generate shipment batch | [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568) | Duplicate shipments possible. |

## Concepts

### Idempotency

An operation is idempotent when running it twice has the same effect as running it once. Inventory reservation and month-start batch generation should be idempotent.

Drill: propose an idempotency key for each:

- `reserve_inventory:cycle=2026-06`
- `generate_shipment:subscriber=sub_4289:cycle=2026-06`

### Retries

Retries must assume partial failure. A shipment job could create a shipment but fail before logging the event. A payment retry could update local state after Stripe already recovered through webhook.

### Outbox Pattern

For future emails/warehouse messages, write an outbox row in the same transaction as the domain change, then have a worker deliver messages with retry and dedupe.

Illustrative fake code: not from this repo.

```js
// Illustrative fake code: not from this repo.
await db.transaction(async (tx) => {
  await tx.shipments.insert(shipment)
  await tx.outbox.insert({ type: 'warehouse.create_label', key: shipment.id })
})
```

## Failure Visibility

Ask "how would I know this broke?"

- Failed payment: dunning state stuck; no email sent.
- Fulfillment: exception queue grows at [`src/App.jsx:605-614`](../../../src/App.jsx#L605-L614).
- Inventory: stock goes negative or too many items reserved.
- Recommendation: excluded item appears in top recommendations.
