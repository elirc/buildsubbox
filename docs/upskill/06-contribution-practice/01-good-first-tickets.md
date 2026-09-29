# Good First Tickets

## Ticket 1: Add Empty State For Exception Queue

**Difficulty:** Easy
**Estimated time:** 30-45 minutes
**Skills practiced:** conditional rendering, UX polish
**Story:** As an operator, I want to see a clear empty state when no fulfillment exceptions exist so I know the queue loaded.
**Why this is a good contribution:** Low blast radius, localized to fulfillment UI.
**Acceptance criteria:**
- [ ] Empty state appears when no shipment has exception/risk.
- [ ] Existing exception rows still render.
**Read these anchors first:**
- [`src/App.jsx:605-614`](../../../src/App.jsx#L605-L614) - exception rendering.
**Files likely touched:**
- `src/App.jsx` - add conditional rendering.
**Implementation plan:**
1. Derive `exceptionShipments`.
2. Render empty text when length is zero.
**Illustrative fake-code shape:**
```jsx
// Illustrative fake code: adapt to the repo.
{exceptions.length === 0 ? <p>No exceptions</p> : exceptions.map(...)}
```
**What could go wrong:** Duplicating filter logic in render.
**Suggested checks:** `npm run build`; manually generate batch with healthy payment.
**Review questions:** Is empty state visible and concise?

## Ticket 2: Extract Shipment Transition Helper

**Difficulty:** Easy
**Estimated time:** 1 hour
**Skills practiced:** pure functions
**Story:** As a maintainer, I want shipment transition logic isolated so it can be tested.
**Why this is a good contribution:** Prepares for tests without changing behavior.
**Acceptance criteria:**
- [ ] Helper returns next status for all current statuses.
- [ ] UI behavior unchanged.
**Read these anchors first:**
- [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582) - current map.
**Files likely touched:**
- `src/App.jsx` - move helper near scoring helpers or new domain file.
**Implementation plan:**
1. Create `getNextShipmentStatus(status)`.
2. Use it in `advanceShipment`.
**Illustrative fake-code shape:**
```js
// Illustrative fake code: adapt to the repo.
export function getNextShipmentStatus(status) {
  return NEXT_STATUS[status] ?? status
}
```
**What could go wrong:** Changing unknown-status behavior accidentally.
**Suggested checks:** `npm run build`; click status advance.
**Review questions:** Is behavior preserved?

## Ticket 3: Add Item Count Guard Message

**Difficulty:** Easy
**Estimated time:** 45 minutes
**Skills practiced:** user feedback, invariants
**Story:** As a curator, I want to know why an add button is disabled.
**Acceptance criteria:**
- [ ] When box is full, a short message appears near inventory table.
- [ ] Message uses `plan.items`.
**Read these anchors first:**
- [`src/App.jsx:489-491`](../../../src/App.jsx#L489-L491)
- [`src/App.jsx:545`](../../../src/App.jsx#L545-L545)
**Files likely touched:** `src/App.jsx`, maybe `src/style.css`.
**Implementation plan:** Derive `isBoxFull`; render helper text.
**Illustrative fake-code shape:**
```jsx
// Illustrative fake code: adapt to the repo.
{isBoxFull && <p>Box is full.</p>}
```
**What could go wrong:** Message appears in wrong tab or wrong state.
**Suggested checks:** Build and fill/remove items.
**Review questions:** Does it explain without clutter?

## Ticket 4: Add Recommendation Explanation Text

**Difficulty:** Easy
**Estimated time:** 1 hour
**Skills practiced:** derived UI
**Story:** As a subscriber, I want to know why an item is recommended.
**Acceptance criteria:**
- [ ] Top recommendations show one matching tag when available.
**Read these anchors first:**
- [`src/App.jsx:443-452`](../../../src/App.jsx#L443-L452)
- [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725)
**Files likely touched:** `src/App.jsx`, `src/style.css`.
**Implementation plan:** Compute first tag matching preference signals.
**Illustrative fake-code shape:**
```js
// Illustrative fake code: adapt to the repo.
const reason = item.tags.find((tag) => signals.includes(tag))
```
**What could go wrong:** Recomputing signal list inconsistently.
**Suggested checks:** Build; change preferences.
**Review questions:** Is the reason accurate?

## Ticket 5: Make Event IDs Deterministic In Helper

**Difficulty:** Medium
**Estimated time:** 1-2 hours
**Skills practiced:** testability
**Story:** As a maintainer, I want event creation to be easier to test.
**Acceptance criteria:**
- [ ] Event creation accepts optional ID/time provider.
- [ ] Existing behavior remains default.
**Read these anchors first:**
- [`src/App.jsx:51-62`](../../../src/App.jsx#L51-L62)
**Files likely touched:** `src/App.jsx`.
**Implementation plan:** Extract `createEvent`.
**Illustrative fake-code shape:**
```js
// Illustrative fake code: adapt to the repo.
function createEvent(input, now = Date.now) {}
```
**What could go wrong:** Overengineering before tests.
**Suggested checks:** Build; trigger events.
**Review questions:** Does this reduce future test friction?

## Ticket 6: Add Status Legend

**Difficulty:** Easy
**Estimated time:** 45 minutes
**Skills practiced:** UI communication
**Story:** As an operator, I want to understand shipment statuses.
**Acceptance criteria:** Legend includes Generated, Picking, Packed, Shipped, Exception, Suppressed.
**Read these anchors first:**
- [`src/App.jsx:706-708`](../../../src/App.jsx#L706-L708)
- [`src/style.css:623-642`](../../../src/style.css#L623-L642)
**Files likely touched:** `src/App.jsx`, `src/style.css`.
**Implementation plan:** Add small legend in fulfillment panel.
**Illustrative fake-code shape:**
```jsx
// Illustrative fake code: adapt to the repo.
statuses.map((status) => <StatusPill value={status} />)
```
**What could go wrong:** Duplicate keys if status values repeat.
**Suggested checks:** Build; inspect mobile.
**Review questions:** Does it help without crowding?

## Ticket 7: Move Plan Lookup Guard

**Difficulty:** Medium
**Estimated time:** 1 hour
**Skills practiced:** defensive programming
**Story:** As a maintainer, I want a clear failure when plan ID is invalid.
**Acceptance criteria:** `findPlan` handles missing plan explicitly.
**Read these anchors first:**
- [`src/App.jsx:48-49`](../../../src/App.jsx#L48-L49)
- [`src/App.jsx:72`](../../../src/App.jsx#L72-L72)
**Files likely touched:** `src/App.jsx`.
**Implementation plan:** Add fallback or throw with clear message.
**Illustrative fake-code shape:**
```js
// Illustrative fake code: adapt to the repo.
if (!plan) throw new Error(`Unknown plan ${id}`)
```
**What could go wrong:** Throwing in render without error boundary.
**Suggested checks:** Build; optionally test bad seed locally.
**Review questions:** Should UI show a safe fallback instead?

## Ticket 8: Add Build Badge Docs

**Difficulty:** Easy
**Estimated time:** 30 minutes
**Skills practiced:** documentation
**Story:** As a contributor, I want clear local commands.
**Acceptance criteria:** Add a small project README with install/dev/build.
**Read these anchors first:**
- [`package.json:6-10`](../../../package.json#L6-L10)
**Files likely touched:** `README.md`.
**Implementation plan:** Document commands and current no-test status.
**Illustrative fake-code shape:**
```md
<!-- Illustrative fake code: adapt to the repo. -->
## Commands
```
**What could go wrong:** Claiming tests exist.
**Suggested checks:** Follow docs locally.
**Review questions:** Is the documentation verified?

## Ticket 9: Add Accessible Labels To Icon Buttons

**Difficulty:** Easy
**Estimated time:** 1 hour
**Skills practiced:** accessibility
**Story:** As a keyboard/screen reader user, I want icon-only controls named.
**Acceptance criteria:** Remove and advance buttons have accessible labels.
**Read these anchors first:**
- [`src/App.jsx:666-669`](../../../src/App.jsx#L666-L669)
- [`src/App.jsx:626-628`](../../../src/App.jsx#L626-L628)
**Files likely touched:** `src/App.jsx`.
**Implementation plan:** Add `aria-label` where title alone is insufficient.
**Illustrative fake-code shape:**
```jsx
// Illustrative fake code: adapt to the repo.
<button aria-label={`Advance ${shipment.id}`} />
```
**What could go wrong:** Duplicate or vague labels.
**Suggested checks:** Build; keyboard tab through controls.
**Review questions:** Are labels specific?

## Ticket 10: Add No-Risk Shipment Filter

**Difficulty:** Medium
**Estimated time:** 1-2 hours
**Skills practiced:** stateful UI
**Story:** As an operator, I want to toggle showing only risky shipments.
**Acceptance criteria:** Fulfillment workbench can filter by risk.
**Read these anchors first:**
- [`src/App.jsx:619-631`](../../../src/App.jsx#L619-L631)
**Files likely touched:** `src/App.jsx`, `src/style.css`.
**Implementation plan:** Add local filter state in `Fulfillment`.
**Illustrative fake-code shape:**
```jsx
// Illustrative fake code: adapt to the repo.
const visible = onlyRisk ? shipments.filter((s) => s.risk !== 'None') : shipments
```
**What could go wrong:** Confusing with exception queue.
**Suggested checks:** Build; generate payment-risk batch.
**Review questions:** Is filter state discoverable?

## Ticket 11: Extract Money Formatter

**Difficulty:** Easy
**Estimated time:** 30 minutes
**Skills practiced:** helper organization
**Story:** As a maintainer, I want formatting helpers easy to test.
**Acceptance criteria:** `money` behavior unchanged.
**Read these anchors first:**
- [`src/App.jsx:48`](../../../src/App.jsx#L48-L48)
**Files likely touched:** `src/App.jsx` or new helper file.
**Implementation plan:** Move helper only; no behavior change.
**Illustrative fake-code shape:**
```js
// Illustrative fake code: adapt to the repo.
export const money = (value) => `$${value.toFixed(2)}`
```
**What could go wrong:** Import path mistakes.
**Suggested checks:** Build.
**Review questions:** Is extraction worth it without tests?

## Ticket 12: Add Manual QA Checklist

**Difficulty:** Easy
**Estimated time:** 45 minutes
**Skills practiced:** QA thinking
**Story:** As a maintainer, I want repeatable manual checks.
**Acceptance criteria:** Checklist covers portal, billing, preferences, curator, fulfillment, mobile.
**Read these anchors first:**
- [`src/App.jsx:162-166`](../../../src/App.jsx#L162-L166)
- [`src/style.css:645-710`](../../../src/style.css#L645-L710)
**Files likely touched:** `docs/qa-checklist.md`.
**Implementation plan:** Write concise checklist.
**Illustrative fake-code shape:**
```md
<!-- Illustrative fake code: adapt to the repo. -->
- [ ] Skip and unskip updates invoice date.
```
**What could go wrong:** Checklist too vague.
**Suggested checks:** Use it once.
**Review questions:** Can a new person follow it?

## Ticket 13: Add Event Type Filter

**Difficulty:** Medium
**Estimated time:** 1-2 hours
**Skills practiced:** filtering, state
**Story:** As an admin, I want to filter lifecycle events by type.
**Acceptance criteria:** Billing timeline can show all/billing/curation/fulfillment.
**Read these anchors first:**
- [`src/App.jsx:393-395`](../../../src/App.jsx#L393-L395)
- [`src/App.jsx:690-704`](../../../src/App.jsx#L690-L704)
**Files likely touched:** `src/App.jsx`, `src/style.css`.
**Implementation plan:** Add filter state in `Billing` or pass filtered events.
**Illustrative fake-code shape:**
```js
// Illustrative fake code: adapt to the repo.
const visibleEvents = type === 'all' ? events : events.filter((e) => e.type === type)
```
**What could go wrong:** Hiding all events with no empty state.
**Suggested checks:** Trigger event types and filter.
**Review questions:** Does filter preserve event order?

## Ticket 14: Add Shipment ID Prefix Helper

**Difficulty:** Easy
**Estimated time:** 45 minutes
**Skills practiced:** deterministic code
**Story:** As a maintainer, I want shipment ID creation in one place.
**Acceptance criteria:** Generated IDs still start with `shp_`.
**Read these anchors first:**
- [`src/App.jsx:559`](../../../src/App.jsx#L559-L559)
**Files likely touched:** `src/App.jsx`.
**Implementation plan:** Extract `createShipmentId`.
**Illustrative fake-code shape:**
```js
// Illustrative fake code: adapt to the repo.
function createShipmentId(random = Math.random) {}
```
**What could go wrong:** Changing ID format accidentally.
**Suggested checks:** Build; generate batch.
**Review questions:** Does this prepare for tests?

## Ticket 15: Add Data Shape Comments

**Difficulty:** Easy
**Estimated time:** 45 minutes
**Skills practiced:** documentation in code
**Story:** As a learner, I want seed data shapes to be obvious.
**Acceptance criteria:** Add short comments above major exports in `data.js`.
**Read these anchors first:**
- [`src/data.js:1-203`](../../../src/data.js#L1-L203)
**Files likely touched:** `src/data.js`.
**Implementation plan:** Add concise comments; avoid noisy line-by-line comments.
**Illustrative fake-code shape:**
```js
// Illustrative fake code: adapt to the repo.
// Plan tiers used by the billing simulator.
```
**What could go wrong:** Comments repeat obvious field names.
**Suggested checks:** Build.
**Review questions:** Do comments explain why, not what?
