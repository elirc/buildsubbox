# Domain Glossary

| Term | Meaning | Code anchors | Confusions to avoid |
| --- | --- | --- | --- |
| Plan | Subscription tier with price and item count. | [`src/data.js`](../../../src/data.js#L1-L29), [`src/App.jsx`](../../../src/App.jsx#L48-L49) | Plan is local seed data, not a billing product in Stripe. |
| Subscriber | Current customer profile and billing state. | [`src/data.js`](../../../src/data.js#L31-L55), [`src/App.jsx`](../../../src/App.jsx#L66-L66) | Only one subscriber exists in memory. |
| Subscription status | `active`, `paused`, or `canceled` in UI actions. | [`src/App.jsx`](../../../src/App.jsx#L213-L220), [`src/App.jsx`](../../../src/App.jsx#L263-L277) | Not a validated enum. |
| Skip | Suppress next shipment/invoice display. | [`src/App.jsx`](../../../src/App.jsx#L222-L231), [`src/App.jsx`](../../../src/App.jsx#L285-L285) | Skip does not persist or update a real billing anchor. |
| Proration | Partial-cycle charge/credit when changing plan. | [`src/App.jsx`](../../../src/App.jsx#L299-L313) | Formula is illustrative; real Stripe proration is server-side. |
| Dunning | Failed-payment communication/retry process. | [`src/App.jsx`](../../../src/App.jsx#L316-L345), [`src/App.jsx`](../../../src/App.jsx#L375-L381) | Current dunning email action logs an event only. |
| Preference | Subscriber signals used for recommendations. | [`src/data.js`](../../../src/data.js#L46-L54), [`src/App.jsx`](../../../src/App.jsx#L401-L440) | Preferences are not validated or persisted. |
| Rating | Feedback on past item. | [`src/data.js`](../../../src/data.js#L167-L171), [`src/App.jsx`](../../../src/App.jsx#L409-L418) | Rating updates only local state. |
| Inventory item | SKU-like item with cost, retail, stock, tags. | [`src/data.js`](../../../src/data.js#L74-L165), [`src/App.jsx`](../../../src/App.jsx#L536-L550) | Not a warehouse SKU table yet. |
| Box | Selected item IDs for current monthly box. | [`src/data.js`](../../../src/data.js#L173-L173), [`src/App.jsx`](../../../src/App.jsx#L79-L81) | Stored as IDs; full items are derived. |
| Match score | Recommendation score from preferences and ratings. | [`src/App.jsx`](../../../src/App.jsx#L82-L87), [`src/App.jsx`](../../../src/App.jsx#L719-L725) | It is heuristic, not ML. |
| Shipment | Fulfillment record in the workbench. | [`src/data.js`](../../../src/data.js#L175-L203), [`src/App.jsx`](../../../src/App.jsx#L556-L635) | Not persisted or carrier-integrated. |
| Event | Timeline/log item shown in billing lifecycle. | [`src/data.js`](../../../src/data.js#L57-L72), [`src/App.jsx`](../../../src/App.jsx#L51-L62) | Not an audit log; it can be lost on reload. |

Drill: choose five terms and write the invariant that would be required in production. Example: "A shipment batch job must not generate duplicate shipments for the same subscriber and cycle."
