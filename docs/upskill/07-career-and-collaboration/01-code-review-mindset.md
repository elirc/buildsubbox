# Code Review Mindset

Review layers:

1. Does it work?
2. Is it correct?
3. Will it stay correct?
4. Does it fit the codebase?
5. Is it kind to future maintainers?

## Repo-Specific Checklist

- Does the change preserve state ownership around [`src/App.jsx:64-108`](../../../src/App.jsx#L64-L108)?
- Does it avoid treating browser state as production truth for billing at [`src/App.jsx:299-345`](../../../src/App.jsx#L299-L345)?
- Does it preserve capacity checks around [`src/App.jsx:489-491`](../../../src/App.jsx#L489-L491)?
- Does it avoid new non-idempotent side effects like [`src/App.jsx:500-504`](../../../src/App.jsx#L500-L504)?
- Does it account for responsive layout rules at [`src/style.css:645-710`](../../../src/style.css#L645-L710)?
- Does it add or propose tests when touching domain behavior?

## Good Review Comments

> Blocking: this moves price calculation into client-provided input. For a billing flow, the server should load the plan price by ID. Could we send only `planId` and keep price authority server-side?

> Important: this adds another status but does not update the transition map at `src/App.jsx:571-582`, so the workbench can render a status it cannot advance.

> Optional: the helper name is accurate, but `getNextShipmentStatus` might make the invariant clearer than `next`.

## Self-Grade

- Weak: comments mostly on style.
- Solid: identifies correctness and maintainability risks with anchors.
- Strong: blocks only when needed, explains impact, and suggests a safer path.
