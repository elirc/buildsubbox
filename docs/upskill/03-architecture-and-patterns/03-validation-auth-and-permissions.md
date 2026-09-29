# Validation, Auth, And Permissions

## Current State

No authentication, authorization, sessions, API keys, CSRF protection, tenant isolation, or server validation exists. This is expected for a local frontend prototype, but it is a hard production boundary.

## Existing Validation-Like Checks

| Check | Anchor | What it protects | Limitation |
| --- | --- | --- | --- |
| Prevent duplicate/full box item add | [`src/App.jsx:489-491`](../../../src/App.jsx#L489-L491) | UI box capacity and duplicate item IDs. | Client-side only. |
| Disable add button | [`src/App.jsx:545`](../../../src/App.jsx#L545-L545) | Same capacity duplicate rule visually. | Not authoritative. |
| Clamp recommendation score | [`src/App.jsx:725`](../../../src/App.jsx#L725-L725) | Score display bounded 12-99. | Does not validate inputs. |
| Shipment transition map | [`src/App.jsx:571-582`](../../../src/App.jsx#L571-L582) | Defines allowed next statuses informally. | Unknown status maps to undefined. |

## What A Junior Might Miss

- A disabled button is not security.
- Client-side plan prices are not trustworthy.
- A user can change browser state or call future APIs directly.
- Ratings need ownership checks: did this subscriber receive this item?

## What A Senior Checks

- Is every mutation authorized against the current user/subscriber?
- Are IDs scoped to tenant/customer?
- Are prices, billing anchors, and plan availability loaded server-side?
- Are shipment and inventory commands idempotent?
- Are errors safe to show to users?

## Future Permission Boundaries

| Action | Required authorization |
| --- | --- |
| Subscriber skips box | Current user owns subscription. |
| Subscriber rates item | Current user received item in a shipped box. |
| Admin changes box template | User has curator/admin role. |
| Admin reserves inventory | User has fulfillment/admin role. |
| Billing webhook updates payment status | Request is verified Stripe webhook. |

Drill: write an IDOR test for "rate an item from another subscriber's shipment."
