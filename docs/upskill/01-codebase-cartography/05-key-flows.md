# Key Flows

## Flow: Skip Next Monthly Box

**Why this flow matters:** Skipping is a subscription-specific action because it affects fulfillment and billing cadence. In production, it must be persisted and coordinated with invoice generation.

**Open these files first:**

- [`src/App.jsx:209-296`](../../../src/App.jsx#L209-L296) - portal state transitions and rendering.
- [`src/data.js:31-55`](../../../src/data.js#L31-L55) - initial subscriber billing fields.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | User | `src/App.jsx:255-258` | Clicks Skip/Unskip. | button event | Action label depends on current state. |
| 2 | Portal | `src/App.jsx:222-223` | Toggles `skipNext`. | boolean | Uses current render's `subscriber.skipNext` for event copy. |
| 3 | Event log | `src/App.jsx:224-231` | Adds billing event. | `{id,type,title,detail,time}` | Not persisted. |
| 4 | UI | `src/App.jsx:283-287` | Displays next invoice date. | string | Date is hard-coded for skipped state. |
| 5 | Fulfillment | `src/App.jsx:562` | Batch status becomes `Suppressed` if skipped. | shipment object | Only applied to future generated batch. |

**Validation and authorization:** No validation or authorization exists. A production version must verify subscriber ownership server-side before changing a skip.

**Persistence and side effects:** No persistence exists. Side effect is local event insertion through [`addEvent`](../../../src/App.jsx#L51-L62).

**Tests that cover it:** No direct coverage found; no test framework or test script exists in [`package.json`](../../../package.json#L6-L10).

**What juniors usually miss:**

- Changing the label is not enough; billing and fulfillment both need to observe the skip.
- Local state resets on reload.

**What seniors notice:**

- Skip is a cycle-scoped invariant, not just a subscriber boolean.
- The action needs an idempotency key if sent to a server.

**Drill:** Add a trace row for what should happen if the user skips after the fulfillment batch has already run.

**Self-grade:**

- Basic: finds `toggleSkip`.
- Solid: connects portal state to fulfillment suppression.
- Strong: proposes a persisted `subscription_cycle_skips` model and rollback behavior.

## Flow: Plan Upgrade/Downgrade With Proration

**Why this flow matters:** Recurring billing changes are high-risk because they change money, entitlements, and future invoices.

**Open these files first:**

- [`src/App.jsx:298-399`](../../../src/App.jsx#L298-L399) - billing component.
- [`src/data.js:1-29`](../../../src/data.js#L1-L29) - plan tiers.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | UI | `src/App.jsx:352-364` | Renders plan cards. | plan object | Same selected plan can be clicked. |
| 2 | Billing | `src/App.jsx:299-302` | Finds next plan and computes delta/proration. | number | Formula is illustrative, not Stripe-accurate. |
| 3 | State | `src/App.jsx:303-307` | Updates `planId` and `balance`. | subscriber object | No server authority. |
| 4 | Timeline | `src/App.jsx:308-313` | Logs upgrade/downgrade event. | event object | Event says charge/credit but no actual invoice. |
| 5 | Metrics | `src/App.jsx:182-189` | MRR card reflects selected plan. | string | Pure render, no persistence. |

**Validation and authorization:** None. Production needs current user authorization, plan availability validation, and server-side price lookup.

**Persistence and side effects:** Local state only. Real implementation would call a backend, then Stripe Subscriptions, then persist a local projection from webhooks.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**

- Client-side prices cannot be trusted for billing.
- A downgrade may apply at period end rather than immediately.

**What seniors notice:**

- Billing changes need auditability, idempotency, and reconciliation against Stripe webhooks.
- The UI should not be the source of truth for money.

**Drill:** Write the server-side contract for `POST /subscription/change-plan` without implementing it.

**Self-grade:**

- Basic: explains delta and balance.
- Solid: identifies server-owned price and webhook reconciliation.
- Strong: includes idempotency, rollback, and authorization checks.

## Flow: Failed Payment Retry And Dunning

**Why this flow matters:** Failed recurring payments are common and operationally sensitive. Good systems communicate clearly while avoiding duplicate emails and bad subscription states.

**Open these files first:**

- [`src/App.jsx:316-345`](../../../src/App.jsx#L316-L345) - failure and retry handlers.
- [`src/App.jsx:384-396`](../../../src/App.jsx#L384-L396) - invoice ledger and event timeline.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | User/admin | `src/App.jsx:367-374` | Clicks fail or retry charge. | click event | Manual simulation only. |
| 2 | Billing | `src/App.jsx:316-324` | Marks payment as `past_due`. | subscriber fields | Adds full plan price each failure click. |
| 3 | Billing | `src/App.jsx:327-337` | Third retry recovers payment. | subscriber fields | Retry policy is hard-coded. |
| 4 | UI | `src/App.jsx:386-390` | Shows balance, retry, dunning. | state rows | No payment provider state. |
| 5 | Timeline | `src/App.jsx:338-345` | Logs result. | event | Not a durable audit log. |

**Validation and authorization:** None. Production must restrict this to webhook/admin contexts.

**Persistence and side effects:** Only local events. Real dunning email send is not implemented; send button logs an event at [`src/App.jsx:375-381`](../../../src/App.jsx#L375-L381).

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**

- Retry state should be driven by payment provider events, not clicks.
- Emails are side effects and must be deduplicated.

**What seniors notice:**

- Need a retry schedule, idempotency key, email outbox, and visibility into failed jobs.

**Drill:** Design a table of dunning states and allowed transitions.

**Self-grade:**

- Basic: traces `past_due`.
- Solid: names retry state and dunning stage.
- Strong: separates provider truth, local projection, and notification side effects.

## Flow: Preference Quiz And Recommendation Score

**Why this flow matters:** Personalization turns user feedback into future box decisions. The key engineering skill is keeping source signals separate from derived recommendations.

**Open these files first:**

- [`src/App.jsx:401-486`](../../../src/App.jsx#L401-L486) - preference UI and rating handlers.
- [`src/App.jsx:710-725`](../../../src/App.jsx#L710-L725) - scoring logic.
- [`src/data.js:167-173`](../../../src/data.js#L167-L173) - initial ratings and selected box.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | User | `src/App.jsx:424-440` | Changes segment or slider. | preference fields | Options are hard-coded. |
| 2 | Preferences | `src/App.jsx:402-406` | Immutable nested update. | subscriber object | No validation of keys. |
| 3 | App | `src/App.jsx:74-77` | Recomputes scored inventory. | item plus score | Memo depends on object identity. |
| 4 | Scoring | `src/App.jsx:719-725` | Combines tags, rating, novelty, exclusions. | number 12-99 | Heuristic can hide business bias. |
| 5 | UI | `src/App.jsx:443-452` | Displays top five recommendations. | list | No explanation besides score. |

**Validation and authorization:** No validation/auth. Production would validate allowed preference values and user ownership.

**Persistence and side effects:** Local state only. Rating logs a local event at [`src/App.jsx:417`](../../../src/App.jsx#L417-L417).

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**

- `scoreInventory` sorts a derived copy, not the seed array directly.
- Rating changes and preference changes share the scoring pipeline.

**What seniors notice:**

- The recommendation function should be isolated for unit tests.
- Exclusions are safety constraints and should be treated differently from preferences.

**Drill:** Create three test cases for `scoreItem`: matched tags, blocked tag, premium novelty.

**Self-grade:**

- Basic: knows where score is calculated.
- Solid: can predict score movement after a rating change.
- Strong: separates hard constraints, soft preferences, and explainability.

## Flow: Curator Box Assembly And Inventory Reservation

**Why this flow matters:** Box assembly turns recommendations and inventory into an operational commitment. It touches customer experience, unit economics, and warehouse feasibility.

**Open these files first:**

- [`src/App.jsx:488-554`](../../../src/App.jsx#L488-L554) - curator dashboard.
- [`src/data.js:74-165`](../../../src/data.js#L74-L165) - inventory model.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Curator | `src/App.jsx:536-550` | Views inventory table. | inventory item | No search/filter. |
| 2 | Curator | `src/App.jsx:489-493` | Adds item if capacity allows. | item ID array | Capacity only client-side. |
| 3 | Curator | `src/App.jsx:495-498` | Removes item. | item ID array | No minimum box completeness check. |
| 4 | Curator | `src/App.jsx:500-504` | Reserves stock by decrementing 1,842. | inventory stock | Repeated clicks over-decrement. |
| 5 | UI | `src/App.jsx:524-531` | Shows cost, retail, margin, match score. | numbers | Margin is simplistic. |

**Validation and authorization:** Client-only checks. A real app must enforce capacity and stock reservation server-side.

**Persistence and side effects:** Local stock mutation. This is a side effect modeled inside UI state.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**

- Disabled button is not sufficient validation.
- Reserve action is not idempotent.

**What seniors notice:**

- Reservation should be a transaction or idempotent command by cycle.
- Hard-coded active subscriber count belongs in data/config, not handler logic.

**Drill:** Propose an idempotency key for inventory reservation.

**Self-grade:**

- Basic: traces add/remove.
- Solid: identifies capacity and stock invariants.
- Strong: designs transaction/idempotency boundaries.

## Flow: Month-Start Fulfillment Batch

**Why this flow matters:** Calendar-driven work fails differently from request/response UI. It needs safe retries, duplicate prevention, and operational visibility.

**Open these files first:**

- [`src/App.jsx:556-635`](../../../src/App.jsx#L556-L635) - fulfillment workbench.
- [`src/data.js:175-203`](../../../src/data.js#L175-L203) - initial shipments.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | Operator | `src/App.jsx:597-601` | Clicks month-start job button. | click event | Manual stand-in for cron. |
| 2 | Fulfillment | `src/App.jsx:557-566` | Creates shipment object. | shipment | Random ID can collide. |
| 3 | Fulfillment | `src/App.jsx:562` | Suppresses if skipped or inactive. | status string | Uses current single subscriber only. |
| 4 | Fulfillment | `src/App.jsx:567-568` | Prepends shipment and logs event. | list/event | Duplicate batches possible. |
| 5 | Workbench | `src/App.jsx:571-582` | Advances status. | status machine | No invalid transition prevention beyond map. |

**Validation and authorization:** None. Production would restrict to scheduled worker/admin and validate cycle uniqueness.

**Persistence and side effects:** Local state only. No carrier labels, warehouse API, or queue.

**Tests that cover it:** No direct coverage found.

**What juniors usually miss:**

- A cron job can run twice.
- Random IDs are hostile to deterministic tests.

**What seniors notice:**

- Need unique constraint on `(subscriber_id, cycle_month)`, retry-safe job, and alerting for exceptions.

**Drill:** Write a trace for what happens if the job crashes after creating shipments but before sending warehouse messages.

**Self-grade:**

- Basic: explains generated status.
- Solid: names skipped/inactive suppression.
- Strong: designs idempotent batch and outbox boundary.

## Flow: Responsive Navigation And Layout

**Why this flow matters:** Frontend ownership includes usability across screen sizes, not just JavaScript state.

**Open these files first:**

- [`src/App.jsx:110-168`](../../../src/App.jsx#L110-L168) - app shell and tabs.
- [`src/style.css:66-150`](../../../src/style.css#L66-L150) - shell layout.
- [`src/style.css:645-710`](../../../src/style.css#L645-L710) - responsive rules.

**Trace:**

| Step | Owner | File | What happens | Data shape | Risk |
| --- | --- | --- | --- | --- | --- |
| 1 | CSS | `src/style.css:66-70` | Desktop two-column shell. | layout grid | Sidebar consumes fixed width. |
| 2 | React | `src/App.jsx:123-139` | Renders tab buttons. | tab config | Tab IDs drive views. |
| 3 | React | `src/App.jsx:162-166` | Conditionally renders active view. | string state | All state remains mounted in parent. |
| 4 | CSS | `src/style.css:645-674` | Collapses shell and grids below 1080px. | media query | Dense panels may still be long. |
| 5 | CSS | `src/style.css:676-710` | Single-column mobile layout. | media query | Needs browser QA. |

**Validation and authorization:** Not applicable.

**Persistence and side effects:** None.

**Tests that cover it:** No direct coverage found; no visual or E2E tests.

**What juniors usually miss:**

- Conditional rendering is simple tab routing.
- CSS media queries are part of the feature contract.

**What seniors notice:**

- A production app needs accessibility checks, keyboard navigation, and visual regression coverage for dense dashboards.

**Drill:** Add a manual QA checklist for desktop, tablet, and mobile widths.

**Self-grade:**

- Basic: identifies layout classes.
- Solid: explains tab state and view rendering.
- Strong: proposes accessibility and visual regression tests.
