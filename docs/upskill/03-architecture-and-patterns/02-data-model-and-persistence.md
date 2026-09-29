# Data Model And Persistence

## Current Data Model

All data is seed data imported from [`src/data.js`](../../../src/data.js#L1-L203), then copied into React state at [`src/App.jsx:64-71`](../../../src/App.jsx#L64-L71).

| Entity | Fields | Anchors | Relationship |
| --- | --- | --- | --- |
| Plan | id, name, price, items, cadence, value, benefits | [`src/data.js:1-29`](../../../src/data.js#L1-L29) | Subscriber references `planId`. |
| Subscriber | identity, status, plan, billing, preferences | [`src/data.js:31-55`](../../../src/data.js#L31-L55) | Owns preferences and billing projection. |
| Event | id, type, title, detail, time | [`src/data.js:57-72`](../../../src/data.js#L57-L72), [`src/App.jsx:51-62`](../../../src/App.jsx#L51-L62) | Timeline. |
| Inventory item | id, name, category, cost, retail, stock, tags, segment | [`src/data.js:74-165`](../../../src/data.js#L74-L165) | Box stores item IDs. |
| Rating | itemId, rating, note | [`src/data.js:167-171`](../../../src/data.js#L167-L171) | Scoring input. |
| Box | array of item IDs | [`src/data.js:173`](../../../src/data.js#L173-L173) | Derived into item objects at [`src/App.jsx:79`](../../../src/App.jsx#L79-L79). |
| Shipment | id, subscriber, plan, status, destination, items, risk | [`src/data.js:175-203`](../../../src/data.js#L175-L203) | Workbench row. |

## Persistence Status

No database, localStorage, migrations, ORM, query layer, or seed script exists. Reloading the browser resets state.

## Production Schema Direction

Likely tables:

- `plans`
- `subscribers`
- `subscriptions`
- `subscription_cycles`
- `subscription_cycle_skips`
- `items`
- `inventory_stock`
- `box_templates`
- `box_items`
- `ratings`
- `shipments`
- `events` or `audit_log`
- `billing_events`

## Consistency Expectations

- Plan changes must be consistent with billing provider state.
- Stock reservation must not go negative.
- Month-start shipment generation must be unique per subscriber/cycle.
- Ratings must belong to items the subscriber received.

## How To Safely Change A Future Schema

1. Add nullable column or new table.
2. Backfill through a script/job.
3. Read from both old and new shapes if needed.
4. Write to both during migration window.
5. Add constraints after data is clean.
6. Remove old path after rollout.

Drill: design a migration from `subscriber.skipNext` boolean to a cycle-scoped `subscription_cycle_skips` table.
