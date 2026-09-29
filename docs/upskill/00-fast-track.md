# Fast Track: Weekend Win

Use this path when you have one weekend and want a real understanding of the app without boiling the ocean.

## Install, Run, Build

Commands are verified unless marked inferred.

```bash
npm install
npm run dev
npm run build
```

Actual scripts are defined in [`package.json`](../../package.json#L6-L10). The app entry is [`index.html`](../../index.html#L9-L11), which loads [`src/main.jsx`](../../src/main.jsx#L1-L10).

There is no test script today. A test command such as `npm test` would be inferred and currently unsupported.

## First 10 Files To Open

1. [`package.json`](../../package.json#L1-L20) - scripts, dependencies, module mode.
2. [`vite.config.js`](../../vite.config.js#L1-L6) - React plugin and Vite integration.
3. [`index.html`](../../index.html#L1-L13) - browser mount point.
4. [`src/main.jsx`](../../src/main.jsx#L1-L10) - React root and StrictMode.
5. [`src/data.js`](../../src/data.js#L1-L29) - plan model.
6. [`src/data.js`](../../src/data.js#L31-L55) - subscriber model.
7. [`src/App.jsx`](../../src/App.jsx#L64-L108) - state ownership and derived values.
8. [`src/App.jsx`](../../src/App.jsx#L209-L296) - subscriber portal actions.
9. [`src/App.jsx`](../../src/App.jsx#L298-L399) - billing lifecycle simulation.
10. [`src/style.css`](../../src/style.css#L645-L710) - responsive layout rules.

## Trace These Flows

### Flow 1: Skip Next Box

Open [`src/App.jsx`](../../src/App.jsx#L222-L231). Predict how `skipNext` changes, then verify where the rendered invoice date changes at [`src/App.jsx`](../../src/App.jsx#L283-L287).

### Flow 2: Preference Rating Changes Recommendations

Open [`src/App.jsx`](../../src/App.jsx#L409-L418), then [`src/App.jsx`](../../src/App.jsx#L710-L725). Ratings update state, the score calculation re-runs through `useMemo` at [`src/App.jsx`](../../src/App.jsx#L74-L77), and the recommendation queue renders at [`src/App.jsx`](../../src/App.jsx#L443-L452).

## Small Safe Change

Add one more inventory item to [`src/data.js`](../../src/data.js#L74-L165). Keep the same shape: `id`, `name`, `category`, `cost`, `retail`, `stock`, `tags`, and `segment`. Do not change scoring logic yet.

Acceptance criteria:

- The app builds.
- The item appears in the Curator inventory table.
- The item can be selected only if the box has capacity, matching [`src/App.jsx`](../../src/App.jsx#L545-L545).

## One Check To Run

```bash
npm run build
```

This validates bundling, JSX parsing, and import resolution. It does not validate business logic, accessibility, or browser interactions.

## Teach-Back Exercise

In 5 minutes, explain:

- Which component owns subscriber state.
- How a billing action appends an event.
- Why `selectedItems` is derived rather than stored separately.
- What would have to change before this app could charge a real customer.

Self-grade:

- Basic: names files and clicks through the UI.
- Solid: traces state from handler to render.
- Strong: identifies missing production boundaries: backend validation, auth, persistence, Stripe webhooks, idempotency, and tests.

## What This Fast Path Does Not Cover

- No real API/server flow exists.
- No database/persistence layer exists.
- No auth/security implementation exists.
- No queue/cron/webhook implementation exists.
- No test framework exists yet.

Those gaps are covered as design and contribution opportunities in later modules.
