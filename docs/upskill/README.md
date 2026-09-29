# ParcelPilot Upskill Curriculum

This curriculum turns this repository into a training lab for a junior engineer growing toward mid-level and senior judgment. It is grounded in the actual code that exists today: a single Vite/React subscription box operations simulator with browser-only state, seed data, and no backend service yet.

## Who This Is For

- A brand-new junior who needs a safe first React codebase to read.
- A junior with JavaScript experience who wants to practice state flow, component boundaries, and UI reasoning.
- A mid-level engineer learning how to design the next backend/API/test layer for a frontend prototype.
- A senior engineer reviewing architecture, blast radius, and production-readiness gaps.

## Repo Identity

ParcelPilot is a React/Vite app for a subscription box platform. The product simulates a subscriber portal, recurring billing lifecycle, preference engine, curator dashboard, and fulfillment pipeline. The app bootstraps through [`src/main.jsx`](../../src/main.jsx#L1-L10), owns most behavior in [`src/App.jsx`](../../src/App.jsx#L64-L728), and starts from seed data in [`src/data.js`](../../src/data.js#L1-L203). Styling is centralized in [`src/style.css`](../../src/style.css#L1-L710). The runtime is browser-only: there is no API server, database, auth provider, webhook handler, queue, or test suite in the current repository. That absence is itself useful training material because learners can separate "what this prototype teaches" from "what production would require."

## How To Use This

### One Weekend

1. Read [00-fast-track.md](00-fast-track.md).
2. Trace two flows in [01-codebase-cartography/05-key-flows.md](01-codebase-cartography/05-key-flows.md).
3. Complete three drills in [04-code-reading-gym/01-annotation-drills.md](04-code-reading-gym/01-annotation-drills.md).
4. Attempt one ticket from [06-contribution-practice/01-good-first-tickets.md](06-contribution-practice/01-good-first-tickets.md).

### Two Weeks

1. Read all of [01-codebase-cartography](01-codebase-cartography/README.md).
2. Work through React and JavaScript notes in [02-stack-and-language-mastery](02-stack-and-language-mastery/README.md).
3. Add one missing test setup using [05-quality-engineering/02-writing-tests-here.md](05-quality-engineering/02-writing-tests-here.md).
4. Write a PR description using [07-career-and-collaboration/02-writing-prs-and-rfcs.md](07-career-and-collaboration/02-writing-prs-and-rfcs.md).

### Eight Weeks

1. Week 1: Orientation and file reading.
2. Week 2: React state and derived values.
3. Week 3: Domain modeling and invariants.
4. Week 4: Testing strategy and debugging.
5. Week 5: Performance, security, accessibility, and reliability.
6. Week 6: Good-first tickets and review katas.
7. Week 7: Mid-level feature tickets.
8. Week 8: Senior design critique and RFC writing.

### Ongoing Contribution Practice

Keep a local engineering journal. For each change, write the invariant, risk, test, rollback plan, and reviewer question. Use [08-reference/learning-rubrics.md](08-reference/learning-rubrics.md) to self-grade.

## Learning Tracks

| Track | Files |
| --- | --- |
| Orientation | [01-codebase-cartography](01-codebase-cartography/README.md) |
| Stack mastery | [02-stack-and-language-mastery](02-stack-and-language-mastery/README.md) |
| Architecture | [03-architecture-and-patterns](03-architecture-and-patterns/README.md) |
| Active code reading | [04-code-reading-gym](04-code-reading-gym/README.md) |
| Quality engineering | [05-quality-engineering](05-quality-engineering/README.md) |
| Contribution practice | [06-contribution-practice](06-contribution-practice/README.md) |
| Career and interviews | [07-career-and-collaboration](07-career-and-collaboration/README.md) |
| Reference | [08-reference](08-reference/command-cheatsheet.md) |

## Recommended Paths

- Brand-new junior: read [00-fast-track.md](00-fast-track.md), then [01-codebase-cartography/02-file-reading-order.md](01-codebase-cartography/02-file-reading-order.md), then do annotation drills.
- Junior with stack familiarity: start with key flows, then pattern cards, then good-first tickets.
- Mid-level engineer new to this repo: start with architecture critique, testing strategy, and mid-level feature tickets.
- Senior doing architecture review: start with risk register, boundaries, side effects, and senior build projects.

## Conventions

- File anchors use relative links when practical, for example [`src/App.jsx`](../../src/App.jsx#L64-L108). Some tables use `path:line-line` for readability.
- Fake code is explicitly labeled `Illustrative fake code: not from this repo.`
- Drills require active work: trace values, annotate dependencies, review fake PRs, or design a change.
- Self-grading uses observable behavior, not vague confidence.
- Verification notes appear in key files and in [08-reference/verification-log.md](08-reference/verification-log.md).

## Senior Mindset

A junior asks, "How do I make it work?" A mid-level engineer asks, "Is this the right pattern here, and can I prove it stays correct?" A senior asks, "What does this commit us to, who pays the cost, what is the blast radius, and how do we reduce risk before users depend on it?" Use this repo to practice moving from working code to durable engineering judgment.

## Verification Notes

- Inspected file inventory with `rg --files`.
- Inspected `package.json`, `src/main.jsx`, `src/App.jsx`, `src/data.js`, `src/style.css`, `index.html`, and `vite.config.js` with line numbers.
- Ran `npm run build` successfully after the app was created.
- Verified local server returned HTTP 200 on `http://127.0.0.1:5174/` during the app build pass.
- No tests, CI, database, API routes, Docker files, README, CONTRIBUTING, SECURITY, or LICENSE were found in this repository at inspection time.
