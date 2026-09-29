# Interview Prep From This Repo

Use ParcelPilot as a source of concrete examples for mid-level software engineering interviews. The production code is JavaScript/React; Python examples below are interview practice translations, not repo code.

## JavaScript Runtime Questions

### Question: Explain stale closures using this repo.

Anchor: [`src/App.jsx:222-231`](../../../src/App.jsx#L222-L231)

- Junior answer: "The handler toggles `skipNext` and adds an event."
- Mid-level answer adds: "The state update uses a functional setter, but the event message reads `subscriber.skipNext` from the current render."
- Senior answer includes: "That is acceptable for this immediate UI copy, but if event correctness mattered, derive next state inside one reducer/action so state and event share the same transition."

### Question: What is pure vs impure here?

Anchors: pure scoring at [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725), impure batch generation at [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).

- Junior: "Pure returns a value; impure changes state."
- Mid-level: "Pure functions are easier to test because same inputs give same outputs."
- Senior: "Random IDs and state writes make batch generation impure; production would inject ID generation and persist through an idempotent command."

### Question: Why use immutable updates?

Anchor: [`src/App.jsx:402-406`](../../../src/App.jsx#L402-L406)

- Junior: "React needs state updates."
- Mid-level: "Copying parent and nested objects changes identity so React can render correctly."
- Senior: "As nested state grows, a reducer or domain state machine can preserve invariants better than ad hoc object spreads."

## React Questions

### Question: Where should state live?

Anchor: [`src/App.jsx:64-108`](../../../src/App.jsx#L64-L108)

- Junior: "In `App`, because many tabs need it."
- Mid-level: "Shared state belongs above the views that use it; local-only filter state can stay in the feature component."
- Senior: "Current central state is fine for a prototype, but future server sync and tests would benefit from reducers, custom hooks, and feature boundaries."

### Question: What does `useMemo` do here?

Anchor: [`src/App.jsx:74-77`](../../../src/App.jsx#L74-L77)

- Junior: "It saves the scored items."
- Mid-level: "It recomputes only when inventory, preferences, or ratings change."
- Senior: "It is not a correctness tool. If inventory grows, measure before optimizing further; also ensure dependencies represent all scoring inputs."

## Python Interview Practice Using This Domain

These examples are illustrative fake code, not from this repo.

### Question: Model shipment status transitions in Python.

```python
# Illustrative fake code: not from this repo.
NEXT_STATUS = {
    "Generated": "Picking",
    "Picking": "Packed",
    "Packed": "Shipped",
    "Exception": "Picking",
    "Suppressed": "Suppressed",
    "Shipped": "Shipped",
}

def next_shipment_status(status: str) -> str:
    return NEXT_STATUS.get(status, status)
```

Tie-back: JavaScript transition map is at [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582).

Strong interview answer: discuss enums, validation, unknown status behavior, and tests.

### Question: Write a Python scoring function.

```python
# Illustrative fake code: not from this repo.
def score_item(item, preferences, ratings):
    signals = {preferences["vibe"], preferences["skin"], preferences["scent"], preferences["snacks"], preferences["home"]}
    matches = len(set(item["tags"]) & signals)
    blocked = bool(set(item["tags"]) & set(preferences["excluded"]))
    rating = ratings.get(item["id"], 3)
    novelty = preferences["surprise"] / 10 if item["segment"] == "Premium" else 4
    return max(12, min(99, round(38 + matches * 13 + rating * 5 + novelty - (35 if blocked else 0))))
```

Tie-back: JavaScript scoring is at [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725).

Strong answer: explain pure functions, fixtures, boundary values, and whether exclusions should be hard filters.

## Debugging Questions

1. A user clicks "Run month start job" twice and sees duplicates. How do you debug?
   - Anchor: [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).
   - Senior answer: identify missing idempotency and propose cycle uniqueness.
2. A plan crashes after adding new seed data. Where do you look?
   - Anchor: [`src/App.jsx:48-49`](../../../src/App.jsx#L48-L49), [`src/data.js:1-29`](../../../src/data.js#L1-L29).
   - Senior answer: validate plan IDs and add test.
3. Recommendation does not change after rating.
   - Anchor: [`src/App.jsx:409-418`](../../../src/App.jsx#L409-L418), [`src/App.jsx:74-77`](../../../src/App.jsx#L74-L77).

## System Design Questions

### Design real recurring billing for this app.

Junior: "Use Stripe Subscriptions."

Mid-level adds:

- Backend endpoint for plan change.
- Server-side price lookup.
- Webhook handler.
- Local subscription projection.

Senior includes:

- Idempotency keys.
- Webhook signature verification.
- Audit trail.
- Downgrade/proration policy.
- Reconciliation job.
- Rollout with feature flag.

### Design month-start shipment generation.

Tie-back: current UI simulation at [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568).

Senior answer includes unique `(subscriber_id, cycle_month)`, transaction/outbox, retries, metrics, and exception handling.

## Code Review Questions

1. PR adds Stripe secret key to frontend. What do you say?
2. PR sorts `inventory` in place before rendering. What risk?
3. PR adds a new shipment status but no CSS or transition map. What is blocking?
4. PR adds localStorage persistence for full subscriber object. What privacy/schema concerns?

## Behavioral Prompts

### Tell me about a time you reduced risk.

Use a contribution such as extracting shipment transition logic from [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582). Strong story: small refactor, tests enabled, no behavior change, clear rollback.

### Tell me about a time you challenged a design.

Use billing simulation at [`src/App.jsx:299-345`](../../../src/App.jsx#L299-L345). Strong story: client prototype is useful, but production money needs a server boundary and webhook reconciliation.

### Tell me about a time you debugged systematically.

Use duplicate shipment generation. Strong story: reproduced, narrowed to handler, identified missing idempotency, proposed test and data constraint.
