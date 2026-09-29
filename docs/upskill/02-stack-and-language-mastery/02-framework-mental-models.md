# React And Vite Mental Models

## React: State Owns What Changes

The `App` component owns all mutable state: active tab, subscriber, events, inventory, ratings, box, and shipments at [`src/App.jsx:64-71`](../../../src/App.jsx#L64-L71). It passes a shared `appState` object into feature views at [`src/App.jsx:89-108`](../../../src/App.jsx#L89-L108) and renders the active view at [`src/App.jsx:162-166`](../../../src/App.jsx#L162-L166).

Why it matters: state placement determines blast radius. A change to subscriber state can affect metrics, portal, billing, preferences, and fulfillment.

Failure modes:

- Prop drilling grows as features grow.
- Re-render cost grows if all state remains in one parent.
- Handlers become hard to test when domain logic stays inside components.

Drill: list which views read `subscriber`. Then propose one reducer or custom hook boundary.

## React: Render Is A Calculation

Rendering should calculate UI from state. Examples:

- Metrics are calculated from `subscriber`, `plan`, `matchRate`, and `shipments` at [`src/App.jsx:182-207`](../../../src/App.jsx#L182-L207).
- Status pill CSS class is derived from status at [`src/App.jsx:706-708`](../../../src/App.jsx#L706-L708).
- Recommendation rows render from `scoredItems` at [`src/App.jsx:443-452`](../../../src/App.jsx#L443-L452).

Failure mode: putting side effects directly in render would run repeatedly. This repo keeps side effects inside click handlers, which is appropriate for this prototype.

## React: Keys Preserve Identity

Lists use keys:

- Tabs use `tab.id` at [`src/App.jsx:128`](../../../src/App.jsx#L128-L128).
- Inventory rows use `item.id` at [`src/App.jsx:538`](../../../src/App.jsx#L538-L538).
- Timeline events use `event.id` at [`src/App.jsx:694`](../../../src/App.jsx#L694-L694).

Senior note: `event.id` comes from `Date.now()` at [`src/App.jsx:54`](../../../src/App.jsx#L54-L54), which is okay for a prototype but weak for rapid duplicate events and tests.

## Vite: Development And Bundling

Vite serves the app in dev and bundles it for production through [`package.json`](../../../package.json#L6-L10). The React plugin is configured in [`vite.config.js`](../../../vite.config.js#L1-L6).

Production concerns:

- Bundle size grows with dependencies such as `lucide-react`.
- Environment variables need `VITE_` prefix for browser exposure, but secrets must not be exposed.
- Build success is not a substitute for tests.

## CSS Mental Model

This repo uses a single global stylesheet:

- Theme variables at [`src/style.css:1-22`](../../../src/style.css#L1-L22).
- App shell grid at [`src/style.css:66-70`](../../../src/style.css#L66-L70).
- Panel and metric grids at [`src/style.css:213-321`](../../../src/style.css#L213-L321).
- Responsive breakpoints at [`src/style.css:645-710`](../../../src/style.css#L645-L710).

Drill: before changing a component class, find all selectors that reference it. Self-grade strong if you can predict desktop and mobile layout effects.
