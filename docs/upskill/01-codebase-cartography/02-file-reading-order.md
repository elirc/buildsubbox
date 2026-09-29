# File Reading Order

## Junior Path

| Order | File | Why it matters | What to look for | Do not get distracted by |
| --- | --- | --- | --- | --- |
| 1 | [`package.json`](../../../package.json#L1-L20) | Names scripts and dependencies. | `dev`, `build`, React, Vite. | Lockfile details. |
| 2 | [`index.html`](../../../index.html#L1-L13) | Shows mount point. | `#app` and script source. | Favicon. |
| 3 | [`src/main.jsx`](../../../src/main.jsx#L1-L10) | Starts React. | `createRoot`, StrictMode. | React internals. |
| 4 | [`src/data.js`](../../../src/data.js#L1-L55) | Explains plan and subscriber shape. | Field names and relationships. | Product copy. |
| 5 | [`src/App.jsx`](../../../src/App.jsx#L64-L108) | Shows state ownership. | Which state is stored vs derived. | Icon imports. |
| 6 | [`src/App.jsx`](../../../src/App.jsx#L110-L168) | Shows layout and tab routing. | Conditional rendering by `activeTab`. | CSS class names at first. |
| 7 | [`src/App.jsx`](../../../src/App.jsx#L209-L296) | First user actions. | `setSubscriber`, `setBox`, `addEvent`. | Exact wording of events. |
| 8 | [`src/style.css`](../../../src/style.css#L66-L150) | Page layout. | Grid shell and sidebar. | Every color token. |

## Mid-Level Path

| Order | File | Why it matters | What to look for | Do not get distracted by |
| --- | --- | --- | --- | --- |
| 1 | [`src/App.jsx`](../../../src/App.jsx#L74-L87) | Derived values. | Memoization and calculations. | Premature optimization. |
| 2 | [`src/App.jsx`](../../../src/App.jsx#L298-L346) | Billing invariants. | Proration, failed payment, retry state. | Real Stripe implementation details that do not exist yet. |
| 3 | [`src/App.jsx`](../../../src/App.jsx#L401-L486) | Preference updates. | Immutable nested updates. | UI copy. |
| 4 | [`src/App.jsx`](../../../src/App.jsx#L488-L554) | Curator workflow. | Capacity checks, inventory reserve side effect. | Perfect inventory modeling. |
| 5 | [`src/App.jsx`](../../../src/App.jsx#L556-L635) | Fulfillment workflow. | Batch generation and status transition. | Real queue design, for now. |
| 6 | [`src/App.jsx`](../../../src/App.jsx#L710-L725) | Recommendation logic. | Score inputs and bounds. | ML terminology. |
| 7 | [`src/style.css`](../../../src/style.css#L645-L710) | Responsive behavior. | Layout collapse and mobile rules. | Pixel-perfect tweaking. |

## Senior Path

| Order | File | Why it matters | What to look for |
| --- | --- | --- | --- |
| 1 | [`src/App.jsx`](../../../src/App.jsx#L64-L108) | All state lives in one component. | Blast radius, prop drilling, testability. |
| 2 | [`src/App.jsx`](../../../src/App.jsx#L51-L62) | Event creation uses `Date.now()`. | ID collision risk and deterministic testing friction. |
| 3 | [`src/App.jsx`](../../../src/App.jsx#L298-L346) | Billing simulation. | Missing idempotency, server trust boundary, time handling. |
| 4 | [`src/App.jsx`](../../../src/App.jsx#L500-L504) | Inventory reservation. | Hard-coded subscriber count and repeated decrement risk. |
| 5 | [`src/App.jsx`](../../../src/App.jsx#L557-L568) | Batch job simulation. | Random IDs, no scheduling boundary, no retry model. |
| 6 | [`src/data.js`](../../../src/data.js#L31-L203) | Data model prototype. | What must become schema, what can remain display-only. |
| 7 | [`package.json`](../../../package.json#L6-L18) | Tooling gaps. | No lint, tests, formatting, typecheck. |

## Pause And Predict

- Before opening `Portal`, predict which state it can mutate.
- Before opening `Billing`, predict which values should be server-owned in production.
- Before opening `Fulfillment`, predict which action must be idempotent.

Self-grade:

- Basic: can find the file.
- Solid: can name inputs, outputs, and mutations.
- Strong: can identify boundary, invariant, missing test, and production risk.
