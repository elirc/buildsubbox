# Type System And Contracts

This repository is JavaScript, not TypeScript. That means contracts are implicit in object shapes and component props.

## Implicit Data Contracts

| Contract | Evidence | Risk |
| --- | --- | --- |
| Plan has `id`, `name`, `price`, `items`. | [`src/data.js:1-29`](../../../src/data.js#L1-L29), [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313) | Missing plan ID makes `findPlan` return `undefined`. |
| Subscriber has billing and preference fields. | [`src/data.js:31-55`](../../../src/data.js#L31-L55), [`src/App.jsx:64-72`](../../../src/App.jsx#L64-L72) | No runtime validation. |
| Inventory item has cost/retail/stock/tags. | [`src/data.js:74-165`](../../../src/data.js#L74-L165), [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725) | Bad tags reduce scoring accuracy. |
| Shipment has status and risk. | [`src/data.js:175-203`](../../../src/data.js#L175-L203), [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582) | Unknown status maps to `undefined`. |

## What TypeScript Would Add

Illustrative fake code: not from this repo.

```ts
type PlanId = 'starter' | 'signature' | 'atelier'
type ShipmentStatus = 'Generated' | 'Picking' | 'Packed' | 'Shipped' | 'Exception' | 'Suppressed'

type Plan = {
  id: PlanId
  name: string
  price: number
  items: number
}
```

Why it matters: a type system would catch invalid status names, missing fields, and mismatched component props before runtime.

## Runtime Validation Still Matters

Even with TypeScript, browser data cannot be trusted. Production server endpoints would need runtime validation for:

- Plan change requests.
- Preference values.
- Rating range 1-5.
- Shipment status transitions.
- Inventory reservation commands.

Drill: write a validator for `rating` in plain English. Strong answer includes type, range, ownership, and duplicate behavior.

## Contracts To Protect First

1. Plan IDs used by billing at [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313).
2. Shipment statuses used by transition map at [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582).
3. Preference keys consumed by scoring at [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725).
4. Inventory item IDs used by `box` at [`src/data.js:173`](../../../src/data.js#L173-L173) and lookup at [`src/App.jsx:79`](../../../src/App.jsx#L79-L79).
