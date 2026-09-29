# Risk Register

| Risk | Evidence | File anchors | Impact | Likelihood | Suggested test | Suggested fix | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| No automated tests | Scripts only `dev`, `build`, `preview`. | [`package.json:6-10`](../../../package.json#L6-L10) | Regressions as features grow. | High | Add first Vitest test. | Install test harness. | High |
| Client-owned billing | Plan/proration changes in browser. | [`src/App.jsx:299-313`](../../../src/App.jsx#L299-L313) | Unsafe for real money. | High if productionized | API auth/contract tests. | Server billing boundary. | High |
| Failed payment simulation can duplicate balance | Failure click adds plan price each time. | [`src/App.jsx:316-323`](../../../src/App.jsx#L316-L323) | Incorrect ledger if treated as real. | Medium | Click fail twice. | Invoice-state model. | High |
| Dunning email not real | Send button logs event only. | [`src/App.jsx:375-381`](../../../src/App.jsx#L375-L381) | False operational confidence. | Medium | Verify no network/email. | Outbox worker. | High |
| Non-idempotent inventory reserve | Each click decrements stock. | [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504) | Overstock/understock. | High | Reserve twice. | Cycle reservation command. | High |
| Duplicate shipment generation | Random ID and no uniqueness. | [`src/App.jsx:557-568`](../../../src/App.jsx#L557-L568) | Duplicate shipments. | High | Click batch twice. | Unique subscriber/cycle. | High |
| Random IDs hurt tests | Uses `Date.now()` and `Math.random()`. | [`src/App.jsx:54`](../../../src/App.jsx#L54-L54), [`src/App.jsx:559`](../../../src/App.jsx#L559-L559) | Test flake. | Medium | Deterministic helper test. | Inject ID/time providers. | High |
| Missing auth/authorization | No auth files found. | Mutations in [`src/App.jsx:209-635`](../../../src/App.jsx#L209-L635) | IDOR/unauthorized changes if backend added poorly. | High if productionized | Permission tests. | Server auth boundary. | High |
| Implicit data contracts | JavaScript object shapes only. | [`src/data.js:1-203`](../../../src/data.js#L1-L203) | Runtime crashes after shape changes. | Medium | Bad seed fixture. | Types/validators. | Medium |
| All behavior in one large file | `App.jsx` is 728 lines. | [`src/App.jsx:1-728`](../../../src/App.jsx#L1-L728) | Harder review/testing. | Medium | Build after extraction. | Feature modules. | High |
| Exclusions are soft penalty | Blocked tags reduce score only. | [`src/App.jsx:721-725`](../../../src/App.jsx#L721-L725) | Excluded items may still appear if score high enough. | Medium | Blocked high-score item fixture. | Hard filter or warning. | Medium |
| Accessibility unknown | Icon buttons and custom segments exist. | [`src/App.jsx:666-681`](../../../src/App.jsx#L666-L681) | Keyboard/screen reader friction. | Medium | Manual a11y/axe test. | Labels/roles/focus QA. | Medium |
