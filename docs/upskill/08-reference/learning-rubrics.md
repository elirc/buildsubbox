# Learning Rubrics

## Junior

Observable behaviors:

- Can run `npm install`, `npm run dev`, and `npm run build`.
- Can explain entry flow from [`index.html`](../../../index.html#L9-L11) to [`src/main.jsx`](../../../src/main.jsx#L1-L10) to [`src/App.jsx`](../../../src/App.jsx#L64-L108).
- Can trace one click handler from UI to state update.
- Can make a small localized change without unrelated refactors.
- Can write a clear PR description with how-tested notes.

Self-assessment:

- [ ] I can identify source vs derived state.
- [ ] I can explain one billing, preference, and fulfillment flow.
- [ ] I can run the build before asking for review.

## Mid-Level

Observable behaviors:

- Can design a cross-component change and name affected invariants.
- Can extract pure logic for testing.
- Can identify client/server trust boundaries.
- Can propose useful tests before implementation.
- Can review PRs for correctness and maintainability.

Self-assessment:

- [ ] I can explain why billing logic at [`src/App.jsx:299-345`](../../../src/App.jsx#L299-L345) must move server-side.
- [ ] I can design idempotent fulfillment batch generation.
- [ ] I can distinguish UX validation from authoritative validation.

## Senior

Observable behaviors:

- Can critique architecture without dismissing prototype value.
- Can identify blast radius and rollback plans.
- Can design migrations with dual-read/write and constraints.
- Can teach juniors through anchored examples.
- Can make risk visible through docs, tests, metrics, and staged rollout.

Self-assessment:

- [ ] I can write an RFC for production billing from this prototype.
- [ ] I can prioritize the next three architecture improvements.
- [ ] I can separate confirmed risks from hypotheses.
- [ ] I can mentor a junior through a good-first ticket without taking it over.
