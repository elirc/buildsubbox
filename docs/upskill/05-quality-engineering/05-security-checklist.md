# Security Checklist

This repo has no backend or auth, so many items are future risks. The checklist is still repo-specific because the UI models high-risk actions.

## Risk Map

| Risk | Current evidence | Production check |
| --- | --- | --- |
| Authorization | No auth code; subscriber actions in [`src/App.jsx:209-399`](../../../src/App.jsx#L209-L399). | Every mutation checks current user ownership. |
| IDOR | Ratings accept item ID at [`src/App.jsx:409-418`](../../../src/App.jsx#L409-L418). | Ensure item belongs to subscriber shipment. |
| Input validation | Segment options hard-coded at [`src/App.jsx:424-428`](../../../src/App.jsx#L424-L428). | Server validates allowed values. |
| XSS | React escapes text by default. | Avoid `dangerouslySetInnerHTML`; sanitize future rich text. |
| CSRF | No server exists. | If cookie auth is added, use CSRF defenses for mutations. |
| Secrets | No env secrets found. | Never expose Stripe secret keys to browser. |
| Webhooks | No webhook handler exists. | Verify Stripe signatures and idempotency. |
| Rate limiting | No API exists. | Rate-limit billing, login, rating, and admin actions. |
| Dependency risk | Dependencies in [`package.json:11-18`](../../../package.json#L11-L18). | Run audits and pin/update responsibly. |
| File uploads | None. | Validate MIME/size/storage if added. |

## Pre-Merge Security Checklist

- Does this change trust browser-provided price, role, user ID, or subscriber ID?
- Does every mutation have an authorization boundary?
- Are IDs scoped to the current user or tenant?
- Are webhook events verified and idempotent?
- Can a user repeat the action and get duplicate side effects?
- Are secrets kept out of frontend bundles?
- Are errors safe and non-leaky?

## What A Junior Might Miss

Client-side checks at [`src/App.jsx:489-491`](../../../src/App.jsx#L489-L491) and [`src/App.jsx:545`](../../../src/App.jsx#L545-L545) improve UX but do not secure a production app.
