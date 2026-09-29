# Performance Thinking

Measure first. This repo is small enough that performance is not currently a confirmed issue, but it has teachable future hotspots.

## Domains

| Domain | Current anchor | Possible hotspot | Measurement |
| --- | --- | --- | --- |
| Render | [`src/App.jsx:64-168`](../../../src/App.jsx#L64-L168) | All state in parent rerenders active view. | React Profiler. |
| Derived data | [`src/App.jsx:74-87`](../../../src/App.jsx#L74-L87) | Inventory lookup and scoring as data grows. | CPU profile, memo tests. |
| Recommendation sort | [`src/App.jsx:710-716`](../../../src/App.jsx#L710-L716) | Full sort on every dependency change. | Benchmark with large inventory. |
| Lists | [`src/App.jsx:536-550`](../../../src/App.jsx#L536-L550) | Large inventory table without virtualization. | FPS/render profile. |
| Bundle | [`src/App.jsx:2-29`](../../../src/App.jsx#L2-L29) | Many icon imports. | Bundle analyzer. |
| CSS layout | [`src/style.css:317-321`](../../../src/style.css#L317-L321) | Dense grids on small screens. | DevTools layout. |

## How To Find Common Problems

- N+1: future DB version of [`src/App.jsx:79`](../../../src/App.jsx#L79-L79) should not query per item.
- Serial async work: future batch jobs should process with bounded concurrency, not unbounded loops.
- Expensive renders: split state or memoize only after measuring.
- Oversized bundle: inspect production build output and dependencies.
- Missing indexes: future DB needs indexes on subscriber, cycle, shipment status, item IDs.
- Cache misuse: future query keys must include subscriber ID and cycle.

Drill: make a fake inventory of 10,000 items and predict which functions become visible in a profile.
