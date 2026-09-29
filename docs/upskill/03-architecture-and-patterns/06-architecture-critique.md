# Architecture Critique

## Strong Design Choices

- The app has a clear learning domain: portal, billing, preferences, curation, fulfillment.
- Seed data is isolated in [`src/data.js`](../../../src/data.js#L1-L203).
- Core source state and derived values are visible in one place at [`src/App.jsx:64-108`](../../../src/App.jsx#L64-L108).
- Recommendation scoring is pure enough to extract and test at [`src/App.jsx:719-725`](../../../src/App.jsx#L719-L725).
- Responsive layout is deliberately handled in CSS at [`src/style.css:645-710`](../../../src/style.css#L645-L710).

## Confirmed Risks

| Risk | Evidence | Impact | Confidence |
| --- | --- | --- | --- |
| No tests | No test script in [`package.json:6-10`](../../../package.json#L6-L10). | Regressions likely as flows grow. | High |
| No auth/server boundary | No server files; billing logic in [`src/App.jsx:299-345`](../../../src/App.jsx#L299-L345). | Unsafe for real money/user data. | High |
| Non-idempotent inventory reserve | [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504) decrements on each click. | Stock can be over-reserved. | High |
| Random shipment IDs | [`src/App.jsx:559`](../../../src/App.jsx#L559-L559). | Duplicates/test flake. | Medium |
| All behavior in one file | [`src/App.jsx:1-728`](../../../src/App.jsx#L1-L728). | Harder maintenance as features grow. | High |

## Hypotheses To Investigate

- Accessibility may need improvement; no automated a11y checks exist.
- Mobile layout may need visual QA; CSS breakpoints exist but no visual tests.
- `lucide-react` bundle usage may be acceptable, but measure before optimizing.

## Priority Improvements

1. Add test harness and isolate pure domain helpers.
   - Migration path: extract `scoreItem`, `scoreInventory`, status transition, and billing projection helpers.
   - Test strategy: Vitest unit tests for helpers, React Testing Library for interactions.
2. Split `App.jsx` into feature modules.
   - Migration path: move data helpers and components one at a time without changing behavior.
   - Test strategy: build after each move; add smoke tests.
3. Introduce production boundaries as design docs before implementation.
   - Billing API/server contract.
   - Fulfillment job idempotency contract.
   - Preference/rating persistence contract.
4. Add lint/format/type safety.
   - Start with ESLint and React hooks rules.
   - Consider TypeScript if the project grows.

## If I Owned This For Three Months

Month 1: stabilize frontend quality with tests, linting, component extraction, and accessibility checks.

Month 2: add a small backend API with validation, persistence, and auth boundaries for subscriber actions and admin actions.

Month 3: model Stripe/webhook, shipment batch idempotency, and inventory reservation with integration tests and operational visibility.

Senior takeaway: this is a strong educational prototype. The next architectural move should not be "add everything"; it should be "draw trusted boundaries, protect money and inventory, then add tests around the contracts."
