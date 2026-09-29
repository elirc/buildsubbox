# Runtime And Tooling Map

## Package And Build Tooling

| Tool | Evidence | Purpose | Status |
| --- | --- | --- | --- |
| npm | `package-lock.json`, [`package.json`](../../../package.json#L6-L18) | Install and run scripts. | Present. |
| Vite | [`package.json`](../../../package.json#L7-L13), [`vite.config.js`](../../../vite.config.js#L1-L6) | Dev server and production bundling. | Present. |
| React | [`package.json`](../../../package.json#L15-L18), [`src/main.jsx`](../../../src/main.jsx#L1-L10) | UI runtime. | Present. |
| lucide-react | [`package.json`](../../../package.json#L15-L18), [`src/App.jsx`](../../../src/App.jsx#L2-L29) | Icons. | Present. |
| Tests | no test script in [`package.json`](../../../package.json#L6-L10) | Regression protection. | Missing. |
| Lint/format | no lint/format scripts in [`package.json`](../../../package.json#L6-L10) | Consistency and defect detection. | Missing. |

## Runtime Boundaries

| Boundary | Exists? | Evidence | Teaching point |
| --- | --- | --- | --- |
| Browser UI | Yes | [`src/main.jsx`](../../../src/main.jsx#L6-L10) | React state renders to DOM. |
| API/server | No | No server files or routes found. | Production billing and fulfillment need trusted server boundaries. |
| Database | No | No schema/migration files found. | Current seed data resets on reload. |
| Worker/cron | No | Fulfillment job is a button handler at [`src/App.jsx`](../../../src/App.jsx#L557-L568). | Real month-start jobs need idempotency and observability. |
| Auth | No | No auth/session code found. | Current app cannot enforce user isolation. |

## Environment Variables And Secrets

No `.env`, `.env.example`, server code, or secret access was found. This is good for a prototype. If Stripe is added later, publishable keys may live in browser config, but secret keys, webhook secrets, and fulfillment API credentials must remain server-side.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` was run successfully. `npm run dev` was run during app creation and served the page locally.

## Drill

Write a "runtime boundary table" for a future Stripe integration:

- Browser: collects user intent, never trusts price.
- Server: creates subscription updates and validates authorization.
- Stripe webhook: confirms payment state asynchronously.
- Database: stores local subscription projection.
- Worker: sends dunning notifications safely.

Self-grade: a strong answer identifies which secrets never enter the browser and which actions must be idempotent.
