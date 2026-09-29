# Fake Code Contrasts

Each example is illustrative fake code, not from this repo. Compare it with real patterns.

## 1. Coupling UI Shape To Future DB Shape

```js
// Illustrative fake code: not from this repo.
setSubscriber({ ...subscriber, plan_price: 49, plan_name: 'Signature' })
```

Better:

```js
// Illustrative fake code: not from this repo.
setSubscriber({ ...subscriber, planId: 'signature' })
```

Real anchor: `planId` references plan seed data at [`src/data.js:36`](../../../src/data.js#L36-L36) and lookup happens at [`src/App.jsx:72`](../../../src/App.jsx#L72-L72).

## 2. Missing Permission Filter

```js
// Illustrative fake code: not from this repo.
await api.rateItem({ subscriberId, itemId, rating })
```

Better: server derives subscriber from session and verifies the item was shipped to that subscriber.

Real anchor: current rating handler lacks auth because there is no backend at [`src/App.jsx:409-418`](../../../src/App.jsx#L409-L418).

## 3. N+1 Query Shape

```js
// Illustrative fake code: not from this repo.
for (const id of boxItemIds) {
  items.push(await db.items.findById(id))
}
```

Better: load all IDs in one query and preserve order.

Real anchor: local lookup maps IDs to items at [`src/App.jsx:79`](../../../src/App.jsx#L79-L79). Fine in memory; risky as DB loop.

## 4. Stale State

```js
// Illustrative fake code: not from this repo.
setEvents([newEvent, ...events])
```

Better:

```js
// Illustrative fake code: not from this repo.
setEvents((current) => [newEvent, ...current])
```

Real anchor: `addEvent` uses a functional update at [`src/App.jsx:51-62`](../../../src/App.jsx#L51-L62).

## 5. Side Effects In Unreliable Places

```js
// Illustrative fake code: not from this repo.
function BillingCard() {
  sendDunningEmail()
  return <button>Retry</button>
}
```

Better: trigger email from a command/job and dedupe it.

Real anchor: repo keeps send simulation inside a click handler at [`src/App.jsx:375-381`](../../../src/App.jsx#L375-L381).

## 6. Swallowing Errors

```js
// Illustrative fake code: not from this repo.
try { await reserveInventory() } catch {}
```

Better: surface error state and keep operation retry-safe.

Real anchor: current local reservation cannot fail at [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504), but future API calls can.

## 7. Unsafe Casts / Untyped Contracts

```js
// Illustrative fake code: not from this repo.
const status = input.status
shipment.status = nextStatus[status]
```

Better: validate status against allowed values before transition.

Real anchor: transition map at [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582).

## 8. Changing Public Contracts Casually

```js
// Illustrative fake code: not from this repo.
plans[0].monthlyPrice = 29
```

Better: migrate consumers or support both fields temporarily.

Real anchor: UI expects `price` at [`src/App.jsx:185`](../../../src/App.jsx#L185-L185), [`src/App.jsx:301`](../../../src/App.jsx#L301-L301), and [`src/App.jsx:361`](../../../src/App.jsx#L361-L361).

## 9. Duplicating Derived State

```js
// Illustrative fake code: not from this repo.
setBoxItems([...selectedItems, item])
setBoxIds([...box, item.id])
```

Better: store IDs and derive items.

Real anchor: `selectedItems` derives from `box` IDs at [`src/App.jsx:79`](../../../src/App.jsx#L79-L79).

## 10. Client-Owned Money

```js
// Illustrative fake code: not from this repo.
fetch('/api/change-plan', { body: JSON.stringify({ price: selectedPrice }) })
```

Better: send plan ID; server loads authoritative price.

Real anchor: current proration is frontend-only at [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313), acceptable only for simulation.
