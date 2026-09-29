# Trace Tables

## UI State Trace: Skip Next Box

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Initial | `src/data.js:31-55` | subscriber object | seed data | `skipNext: false` | Reload resets. |
| Click | `src/App.jsx:255-258` | click event | Portal | calls `toggleSkip` | No confirmation. |
| Update | `src/App.jsx:222-231` | boolean/event | Portal | toggles boolean and logs event | Event copy can be stale. |
| Render | `src/App.jsx:283-287` | state rows | Portal | displays Jul 1 if skipped | Hard-coded date. |
| Batch | `src/App.jsx:562` | shipment status | Fulfillment | skipped becomes `Suppressed` | Only future batches. |

## Persistence Trace: Current Prototype

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Seed | `src/data.js:1-203` | JS exports | data module | static objects | Not durable. |
| Load | `src/App.jsx:64-71` | React state | App | copies initial values | One browser session only. |
| Mutate | `src/App.jsx:213-582` | state updates | feature handlers | immutable replacements | No backend reconciliation. |
| Reload | N/A | fresh seed data | browser | loses mutations | Expected but important. |

## Auth/Permission Trace: Future Requirement

No implemented auth trace exists. Use this as a design trace for future work.

| Step | Future owner | Current anchor | Required check | Risk if missing |
| --- | --- | --- | --- | --- |
| Rate item | API | `src/App.jsx:409-418` | user owns subscriber and received item | IDOR rating spoof. |
| Change plan | API | `src/App.jsx:299-313` | user owns subscription; plan exists | unauthorized billing change. |
| Reserve inventory | Admin API | `src/App.jsx:500-504` | curator/fulfillment role | stock corruption. |
| Generate batch | Worker/admin | `src/App.jsx:557-568` | authorized job identity | duplicate shipments. |

## Error Trace: Missing Plan

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Bad state | `src/App.jsx:66-72` | `planId` string | App | `findPlan` lookup | May return undefined. |
| Metrics | `src/App.jsx:185` | `plan.price` | Metrics | dereference | Runtime crash. |
| Billing | `src/App.jsx:300-302` | `nextPlan.price` | Billing | dereference | Runtime crash. |
| Prevention | future | data validation | tests/types | validate plan ID | Safer contract. |

## Recommendation Trace

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Signals | `src/data.js:46-54` | preferences | subscriber | source facts | No validation. |
| Ratings | `src/data.js:167-171` | rating list | ratings | source facts | Ratings may not correspond to received item. |
| Memo | `src/App.jsx:74-77` | scored item list | App | recompute on deps | Can grow expensive. |
| Score | `src/App.jsx:719-725` | number | scoring helper | tags + rating + novelty | Exclusions are only penalty. |
| Render | `src/App.jsx:443-452` | top five rows | Preferences | slice and map | No explanation. |
