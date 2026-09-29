# Boundaries And Layers

## Current Layers

| Layer | Current owner | Anchors | Owns | Must not own in production |
| --- | --- | --- | --- | --- |
| Browser entry | `index.html`, `main.jsx` | [`index.html`](../../../index.html#L9-L11), [`src/main.jsx`](../../../src/main.jsx#L1-L10) | Mounting React. | Business rules. |
| UI shell | `App` | [`src/App.jsx:110-168`](../../../src/App.jsx#L110-L168) | Layout and tab selection. | Billing authority. |
| Feature views | `Portal`, `Billing`, `Preferences`, `Curator`, `Fulfillment` | [`src/App.jsx:209-635`](../../../src/App.jsx#L209-L635) | User interactions and render state. | Secret handling, durable side effects. |
| Domain helpers | `money`, `findPlan`, scoring helpers | [`src/App.jsx:48-49`](../../../src/App.jsx#L48-L49), [`src/App.jsx:710-725`](../../../src/App.jsx#L710-L725) | Local calculations. | Persistence or network calls. |
| Seed data | `data.js` | [`src/data.js:1-203`](../../../src/data.js#L1-L203) | Prototype data. | Source of truth after production backend exists. |
| Styling | `style.css` | [`src/style.css:1-710`](../../../src/style.css#L1-L710) | Layout and visual states. | Domain state. |

## Good Boundaries

- Item objects are derived from item IDs at [`src/App.jsx:79`](../../../src/App.jsx#L79-L79). This avoids duplicating selected item data.
- Scoring is in pure helper functions at [`src/App.jsx:710-725`](../../../src/App.jsx#L710-L725), making it a candidate for extraction and testing.
- Static seed data is separated from UI code in [`src/data.js`](../../../src/data.js#L1-L203).

## Boundary Leaks

- Billing changes happen entirely in the browser at [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313). In production, money must be server-owned.
- Inventory reservation mutates stock in a UI handler at [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504). In production, stock reservation needs a transactional backend boundary.
- Fulfillment batch generation is a button handler at [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568). In production, this is a scheduled worker or job.

Drill: pick one boundary leak and write the server endpoint or worker contract you would introduce.
