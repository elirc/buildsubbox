# ParcelPilot Upskill Curriculum (superseded)

> **Superseded — 2026-10-06.** This tree was written for the earlier ParcelPilot prototype: one large `src/App.jsx` that simulated a subscriber portal, recurring billing, skip-next, and a fulfillment pipeline from the seed in `src/data.js`, with no tests and no persistence. That code has since been rewritten. Business rules now live in `src/model.js` (validation, CRUD reducer, reservations, shipment lifecycle), persistence in `src/repository.js` (localStorage under a Web Lock with a raw-baseline check), and behavior is pinned by 36 `node:test` cases in `test/model.test.mjs`. `src/data.js` survives only as the source that `scripts/make-initial.mjs` turns into `src/initial.js`.
>
> None of this tree's line anchors or flows match the current code, so its pages have been reduced to pointers. The full original text is in git history: `git show 9597ad1:docs/upskill/<path>`.

## Where each section went

| Old section | Current material |
| --- | --- |
| 00-fast-track | [astraupskill/README.md](../../astraupskill/README.md) |
| 01-codebase-cartography | [01-CODEBASE-MAP](../../astraupskill/01-CODEBASE-MAP.md), [03-WORKED-CHANGE](../../astraupskill/03-WORKED-CHANGE.md) |
| 02-stack-and-language-mastery, 03-architecture-and-patterns | [02-CONCEPTS](../../astraupskill/02-CONCEPTS.md) |
| 04-code-reading-gym | [07-TRACE-LAB](../../astraupskill/07-TRACE-LAB.md) |
| 05-quality-engineering | [04-TESTING-AND-DEBUGGING](../../astraupskill/04-TESTING-AND-DEBUGGING.md) |
| 06-contribution-practice | [05-PRACTICE](../../astraupskill/05-PRACTICE.md) |
| 07-career-and-collaboration, 08-reference | [06-SOLUTIONS-AND-REVIEW](../../astraupskill/06-SOLUTIONS-AND-REVIEW.md), [VERIFICATION](../../astraupskill/VERIFICATION.md) |
