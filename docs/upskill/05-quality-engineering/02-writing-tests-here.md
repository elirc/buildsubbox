# Writing Tests Here

Tests are not installed yet. This file describes the smallest practical path.

## Suggested Setup

Inferred commands:

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

Add scripts:

```json
{
  "test": "vitest",
  "test:watch": "vitest --watch"
}
```

## First Extraction

Extract `scoreItem` and `scoreInventory` from [`src/App.jsx:710-725`](../../../src/App.jsx#L710-L725) into a small module such as `src/domain/recommendations.js`. This keeps the first tests low-risk.

## Test Recipes

1. Happy path scoring
   - Given item tags match preference tags.
   - Expect score above neutral.
   - Anchor: [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725).

2. Validation failure for rating
   - Future validator rejects rating outside 1-5.
   - Anchor current handler: [`src/App.jsx:409-418`](../../../src/App.jsx#L409-L418).

3. Permission failure
   - Future API rejects rating item not shipped to subscriber.
   - Current gap anchor: [`src/App.jsx:409-418`](../../../src/App.jsx#L409-L418).

4. Async side effect
   - Future dunning job dedupes email for same invoice/retry.
   - Current simulation anchor: [`src/App.jsx:375-381`](../../../src/App.jsx#L375-L381).

5. Cache/query invalidation
   - Future plan change invalidates subscriber projection.
   - Current local state anchor: [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313).

6. Migration/schema behavior
   - Future skip table has unique `(subscription_id, cycle_month)`.
   - Current boolean anchor: [`src/data.js:40`](../../../src/data.js#L40-L40).

7. UI state
   - Click "Skip June"; expect next invoice display to become `2026-07-01`.
   - Anchors: [`src/App.jsx:255-258`](../../../src/App.jsx#L255-L258), [`src/App.jsx:285`](../../../src/App.jsx#L285-L285).

8. Shipment transition
   - `Generated` advances to `Picking`; `Suppressed` stays `Suppressed`.
   - Anchor: [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582).

## Commands

Current verified:

```bash
npm run build
```

Future inferred:

```bash
npm test
npm test -- recommendations
```
