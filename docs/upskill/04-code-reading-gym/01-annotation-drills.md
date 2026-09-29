# Annotation Drills

For each excerpt, annotate: inputs, outputs, dependencies, invariant, side effect, and failure mode.

## Drill 1: App State Owner

Excerpt: [`src/App.jsx:64-108`](../../../src/App.jsx#L64-L108)

Prompt: Which values are source state and which are derived?

Self-grade:

- Basic: lists state variables.
- Solid: identifies `selectedItems`, `boxCost`, `boxRetail`, `matchRate` as derived.
- Strong: explains why storing derived values separately would create consistency risk.

## Drill 2: Event Creation

Excerpt: [`src/App.jsx:51-62`](../../../src/App.jsx#L51-L62)

Prompt: What makes this useful for UX and weak for audit logging?

Self-grade strong answer includes `Date.now()` nondeterminism, local-only persistence, and lack of actor/resource metadata.

## Drill 3: Skip Handler

Excerpt: [`src/App.jsx:222-231`](../../../src/App.jsx#L222-L231)

Prompt: Identify the state mutation and the event side effect. What could become stale?

Strong answer: event copy reads `subscriber.skipNext` from current render while scheduling a functional update.

## Drill 4: Billing Proration

Excerpt: [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313)

Prompt: What is the invariant? What must move server-side in production?

Strong answer: price and proration are money authority and must be calculated/verified server-side.

## Drill 5: Payment Retry

Excerpt: [`src/App.jsx:316-345`](../../../src/App.jsx#L316-L345)

Prompt: Draw the retry state machine. What happens after two failed attempts?

Strong answer: third click recovers because `current.retryAttempt >= 2`; real retries should be provider/job driven.

## Drill 6: Preference Update

Excerpt: [`src/App.jsx:401-418`](../../../src/App.jsx#L401-L418)

Prompt: Why is the nested spread necessary?

Strong answer: React needs new object identity for both subscriber and preferences.

## Drill 7: Scoring

Excerpt: [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725)

Prompt: Separate hard constraints from soft preferences.

Strong answer: exclusions behave like constraints but are implemented as a score penalty, which may not be strict enough.

## Drill 8: Inventory Reservation

Excerpt: [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504)

Prompt: Is this idempotent? What happens after three clicks?

Strong answer: no, each click decrements selected item stock by 1,842, clamped at zero.

## Drill 9: Fulfillment Batch

Excerpt: [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568)

Prompt: Which values are generated, copied, or derived?

Strong answer: random ID generated, subscriber and plan copied, status derived from skip/status, risk derived from payment health.

## Drill 10: Responsive CSS

Excerpt: [`src/style.css:645-710`](../../../src/style.css#L645-L710)

Prompt: Which grids collapse, and what UI risk remains?

Strong answer: major grids collapse; long table rows still require manual visual/accessibility QA.

## Drill 11: Status Transition

Excerpt: [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582)

Prompt: What transition is intentionally terminal?

Strong answer: `Suppressed` remains `Suppressed`, `Shipped` remains `Shipped`; unknown statuses are not handled.

## Drill 12: Segment Control

Excerpt: [`src/App.jsx:675-688`](../../../src/App.jsx#L675-L688)

Prompt: What makes this reusable? What is missing for accessibility?

Strong answer: props define label/value/options; production may need ARIA semantics for grouped selection.
