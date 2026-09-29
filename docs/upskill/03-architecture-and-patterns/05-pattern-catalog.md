# Pattern Catalog

## Pattern: Seed Data Module

**Problem it solves:** Keep prototype data separate from components.
**General shape:** Export arrays/objects from a data file and import them into the app.
**Real example:** [`src/data.js:1-203`](../../../src/data.js#L1-L203)
**Second example:** Imported in [`src/App.jsx:30-38`](../../../src/App.jsx#L30-L38).
**Why this implementation works:** The app can start without a backend.
**Failure modes:** Seed data can be mistaken for durable state or schema.
**Use it when:** Prototyping flows and UI.
**Avoid it when:** Data must persist, be authorized, or be audited.
**Drill:** Add a field to one entity and trace every usage.

## Pattern: Central State Owner

**Problem it solves:** One place coordinates related demo state.
**General shape:** Parent component owns state and passes it down.
**Real example:** [`src/App.jsx:64-108`](../../../src/App.jsx#L64-L108)
**Second example:** Feature views receive spread `appState` at [`src/App.jsx:162-166`](../../../src/App.jsx#L162-L166).
**Why this implementation works:** Simple cross-tab coordination.
**Failure modes:** Prop drilling, broad re-renders, hard-to-test handlers.
**Use it when:** Prototype is small and state is shared.
**Avoid it when:** Domain logic needs isolation, tests, or server sync.
**Drill:** Extract billing state into a reducer on paper.

## Pattern: Derived Data Instead Of Duplicated State

**Problem it solves:** Prevents stored values from drifting apart.
**General shape:** Store IDs/source facts; compute views.
**Real example:** [`src/App.jsx:79-87`](../../../src/App.jsx#L79-L87)
**Second example:** [`src/App.jsx:710-716`](../../../src/App.jsx#L710-L716)
**Why this implementation works:** Box item details track inventory changes.
**Failure modes:** Expensive recompute or missing memo dependencies.
**Use it when:** Values are pure functions of state.
**Avoid it when:** Calculation is remote, expensive, or needs audit history.
**Drill:** Identify one value that should stay derived.

## Pattern: Pure Scoring Function

**Problem it solves:** Keeps recommendation calculation testable.
**General shape:** Function receives item, preferences, ratings and returns score.
**Real example:** [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725)
**Second example:** Called by inventory scoring at [`src/App.jsx:710-716`](../../../src/App.jsx#L710-L716).
**Why this implementation works:** No hidden state or DOM dependency.
**Failure modes:** Business rules become opaque if not tested.
**Use it when:** Ranking logic can be deterministic.
**Avoid it when:** Logic needs external data not passed as input.
**Drill:** Write expected scores for three items.

## Pattern: Immutable Nested Update

**Problem it solves:** Preserves React state identity rules.
**General shape:** Copy parent object and nested object.
**Real example:** [`src/App.jsx:402-406`](../../../src/App.jsx#L402-L406)
**Second example:** Subscriber update at [`src/App.jsx:213-219`](../../../src/App.jsx#L213-L219).
**Failure modes:** Shallow mutation, stale references.
**Use it when:** Updating object state.
**Avoid it when:** State structure is too nested; use reducer or state library.
**Drill:** Refactor rating update into a helper function.

## Pattern: Status Transition Map

**Problem it solves:** Makes allowed next statuses visible.
**General shape:** Map current state to next state.
**Real example:** [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582)
**Second example:** No second example found.
**Failure modes:** Missing key gives undefined status.
**Use it when:** Workflow states are finite.
**Avoid it when:** Transitions need permissions, timestamps, or side effects.
**Drill:** Add a `Delivered` status on paper and update the map safely.

## Pattern: Event Timeline

**Problem it solves:** Gives users feedback after actions.
**General shape:** Append event objects and render a timeline.
**Real example:** [`src/App.jsx:51-62`](../../../src/App.jsx#L51-L62)
**Second example:** Rendered at [`src/App.jsx:690-704`](../../../src/App.jsx#L690-L704).
**Failure modes:** `Date.now()` IDs, no persistence, no severity.
**Use it when:** Local UX needs action history.
**Avoid it when:** You need audit-grade logs.
**Drill:** Add severity to events without breaking existing renders.

## Pattern: Guard Clause

**Problem it solves:** Stops invalid action early.
**General shape:** Return before mutation if invariant fails.
**Real example:** [`src/App.jsx:489-491`](../../../src/App.jsx#L489-L491)
**Second example:** [`src/App.jsx:234-236`](../../../src/App.jsx#L234-L236)
**Failure modes:** Guard duplicated only in UI; missing server guard.
**Use it when:** Invalid inputs should no-op locally.
**Avoid it when:** User needs error feedback.
**Drill:** Convert one guard to return an error object in fake code.

## Pattern: Presentational Helper Component

**Problem it solves:** Reuses small UI shape.
**General shape:** Component accepts props and renders markup.
**Real example:** [`src/App.jsx:637-647`](../../../src/App.jsx#L637-L647)
**Second example:** [`src/App.jsx:649-656`](../../../src/App.jsx#L649-L656)
**Failure modes:** Over-abstracting before duplication is meaningful.
**Use it when:** Same small structure appears repeatedly.
**Avoid it when:** Component hides domain behavior.
**Drill:** Decide whether `StatusPill` should stay in `App.jsx`.

## Pattern: Responsive Grid

**Problem it solves:** Keeps dense dashboard usable across widths.
**General shape:** Desktop grid, tablet two columns, mobile one column.
**Real example:** [`src/style.css:645-710`](../../../src/style.css#L645-L710)
**Second example:** Base grid at [`src/style.css:272-276`](../../../src/style.css#L272-L276).
**Failure modes:** Content overflow, inaccessible tab order.
**Use it when:** Same content adapts by width.
**Avoid it when:** Layout changes need different information architecture.
**Drill:** Test the inventory table mentally on 360px width.

## Pattern: UI As Simulation Boundary

**Problem it solves:** Demonstrates backend concepts before backend exists.
**General shape:** Buttons simulate webhooks/jobs/admin actions.
**Real example:** Billing simulation at [`src/App.jsx:316-345`](../../../src/App.jsx#L316-L345)
**Second example:** Batch simulation at [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568)
**Failure modes:** Learners may mistake simulation for production architecture.
**Use it when:** Teaching workflows.
**Avoid it when:** Handling real money, auth, inventory, or email.
**Drill:** Mark each simulated action with its future server owner.

## Pattern: Bounded Display Value

**Problem it solves:** Prevents odd UI output from heuristic scoring.
**General shape:** Clamp calculated number between min and max.
**Real example:** [`src/App.jsx:725`](../../../src/App.jsx#L725-L725)
**Second example:** Stock reservation clamps at zero at [`src/App.jsx:502`](../../../src/App.jsx#L502-L502).
**Failure modes:** Clamping can hide invalid inputs or over-reservation.
**Use it when:** Display value should stay within a range.
**Avoid it when:** You need to detect and reject invalid states.
**Drill:** Decide whether stock should clamp or throw in production.
