# Systematic Debugging

Method:

1. Reproduce.
2. Narrow the layer.
3. Form one hypothesis.
4. Test cheaply.
5. Fix root cause.
6. Add regression coverage.

## Scenario: Recommendation Does Not Change After Rating

**Reproduction:** Rate an item in the Preferences tab.
**First question:** Is the bug in rating state or scoring/render?
**Narrowing path:**
1. Check `rateItem` at [`src/App.jsx:409-418`](../../../src/App.jsx#L409-L418).
2. Check `useMemo` dependencies at [`src/App.jsx:74-77`](../../../src/App.jsx#L74-L77).
3. Check scoring at [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725).
**Useful probes:** React DevTools state, console log inside `scoreItem`.
**Likely root causes:** Ratings not updated immutably; item not in top five; score effect too small.
**Regression test to add:** Unit test for score change after rating.
**Senior lesson:** Verify source signal before ranking output.

## Scenario: Duplicate Shipment Appears

**Reproduction:** Click "Run month start job" twice.
**First question:** Is duplicate generation allowed?
**Narrowing path:**
1. Inspect `generateBatch` at [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).
2. Notice random ID and no cycle uniqueness check.
3. Decide if this is acceptable simulation or a bug for production.
**Useful probes:** Shipment row count.
**Likely root causes:** Missing idempotency.
**Regression test to add:** Future worker test for unique subscriber/cycle.
**Senior lesson:** Jobs must be retry-safe.

## Scenario: Stock Drops To Zero Unexpectedly

**Reproduction:** Click "Reserve SKUs" repeatedly.
**First question:** Is reservation idempotent?
**Narrowing path:**
1. Inspect [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504).
2. Confirm each click subtracts 1,842.
3. Check clamp at zero.
**Useful probes:** Curator inventory table.
**Likely root causes:** Repeated command without idempotency guard.
**Regression test to add:** Reserve same cycle twice changes stock once.
**Senior lesson:** Clamping hides over-reservation.

## Scenario: Plan Change Crashes

**Reproduction:** Introduce invalid `planId` in seed data.
**First question:** Is the bug data validation or rendering?
**Narrowing path:**
1. Check `findPlan` at [`src/App.jsx:49`](../../../src/App.jsx#L49-L49).
2. Check dereference at [`src/App.jsx:185`](../../../src/App.jsx#L185-L185).
3. Add guard or validate seed.
**Useful probes:** Browser console.
**Likely root causes:** Implicit contract broken.
**Regression test to add:** Unknown plan ID shows safe error.
**Senior lesson:** All external or persisted IDs need validation.

## Scenario: Mobile Layout Looks Broken

**Reproduction:** Resize below 720px.
**First question:** Is the issue CSS grid or content length?
**Narrowing path:**
1. Inspect breakpoints at [`src/style.css:645-710`](../../../src/style.css#L645-L710).
2. Inspect table row CSS at [`src/style.css:567-613`](../../../src/style.css#L567-L613).
3. Check whether text wraps or overflows.
**Useful probes:** Browser devtools, responsive mode, screenshot.
**Regression test to add:** Playwright screenshot smoke test.
**Senior lesson:** Dashboard density needs explicit responsive QA.
