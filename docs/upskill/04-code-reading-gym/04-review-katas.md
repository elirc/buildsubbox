# Review Katas

## Kata 1: Add Premium Plan

**Author intent:** Add a fourth plan.
**Fake diff summary:** Adds plan object but forgets `items`.
**Files this resembles:** [`src/data.js:1-29`](../../../src/data.js#L1-L29)
**Your task:** Review this PR.
**Expected findings:**
Blocking:
- Missing `items` breaks plan capacity display and gross margin assumptions.
Important:
- Add at least one smoke test once tests exist.
Optional:
- Align copy style with existing plan values.
**Good review comment example:**
> Can we add the `items` field to keep the plan contract consistent? `App` reads `plan.items` when displaying box capacity, so this would render incorrectly.

## Kata 2: Persist Skip In localStorage

**Author intent:** Keep skip after reload.
**Fake diff summary:** Writes entire subscriber object to localStorage on every render.
**Files this resembles:** [`src/App.jsx:64-108`](../../../src/App.jsx#L64-L108)
**Expected findings:**
Blocking:
- Side effect during render.
Important:
- Persistence needs schema/versioning and privacy consideration.
Optional:
- For prototype, persist only `skipNext`.

## Kata 3: Real Stripe Call From Browser

**Author intent:** Wire plan upgrade to Stripe.
**Fake diff summary:** Adds secret key to frontend env and calls Stripe directly.
**Files this resembles:** [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313)
**Expected findings:**
Blocking:
- Never expose Stripe secret key in browser.
- Client cannot own price/proration authority.
Important:
- Need backend endpoint and webhook reconciliation.

## Kata 4: Reserve Inventory On Render

**Author intent:** Auto-reserve when curator tab opens.
**Fake diff summary:** Calls reserve logic inside component body.
**Files this resembles:** [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504)
**Expected findings:**
Blocking:
- Render must stay pure; repeated renders would decrement stock.
Important:
- Reservation should be explicit and idempotent.

## Kata 5: Sort Inventory In Place

**Author intent:** Show best inventory first.
**Fake diff summary:** Calls `inventory.sort(...)` before rendering.
**Files this resembles:** [`src/App.jsx:710-716`](../../../src/App.jsx#L710-L716)
**Expected findings:**
Blocking:
- In-place mutation of React state.
Important:
- Use a copied array or derived memo.

## Kata 6: Add Delivered Status

**Author intent:** Let shipments progress past shipped.
**Fake diff summary:** Adds CSS status but not transition map.
**Files this resembles:** [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582), [`src/style.css:623-642`](../../../src/style.css#L623-L642)
**Expected findings:**
Blocking:
- State transition and display must be updated together.
Important:
- Add tests for terminal/allowed transitions.

## Kata 7: Recommendation Exclusion

**Author intent:** Hide excluded tags.
**Fake diff summary:** Filters recommendations visually but selected box can still include excluded item.
**Files this resembles:** [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725), [`src/App.jsx:79-87`](../../../src/App.jsx#L79-L87)
**Expected findings:**
Blocking:
- Hard exclusion must be enforced before selection, not only display.
Important:
- Explain excluded-item behavior to curator/subscriber.

## Kata 8: Add Test Script Only

**Author intent:** Add testing.
**Fake diff summary:** Adds `"test": "vitest"` but no dependency or sample test.
**Files this resembles:** [`package.json:6-18`](../../../package.json#L6-L18)
**Expected findings:**
Blocking:
- Script fails without dependency/config.
Important:
- Include one small test for `scoreItem` or a render smoke test.

## Kata 9: Move Everything Into Context

**Author intent:** Avoid prop drilling.
**Fake diff summary:** Wraps all state in one global context.
**Files this resembles:** [`src/App.jsx:89-108`](../../../src/App.jsx#L89-L108)
**Expected findings:**
Important:
- Context alone does not reduce domain coupling or render breadth.
- Consider reducers/hooks by feature.
Optional:
- Current prop passing is acceptable for small prototype.

## Kata 10: Replace CSS With Inline Styles

**Author intent:** Co-locate styles.
**Fake diff summary:** Moves responsive grid styles inline.
**Files this resembles:** [`src/style.css:645-710`](../../../src/style.css#L645-L710)
**Expected findings:**
Important:
- Inline styles cannot express media queries cleanly.
- Keep responsive layout in CSS or use a deliberate styling system.
