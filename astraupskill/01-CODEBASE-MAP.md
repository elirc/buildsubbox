# Read ParcelPilot from domain rules outward

Begin with [model.js](../src/model.js). This module owns business rules and has no dependency on React, localStorage, or the current wall clock. Its commands receive timestamps explicitly, which makes lifecycle history testable without waiting for real time to pass.

| File | Responsibility | Useful entry points |
| --- | --- | --- |
| `src/model.js` | Validation, CRUD, matching, reservations, transitions | `validateState`, `quoteBox`, `reduce` |
| `src/repository.js` | Serialized persistence and stale-baseline protection | `load`, `commit`, `restore` |
| `src/initial.js` | Fictional starting aggregate | Empty shipments and revision zero |
| `src/CatalogEditor.jsx` | Reusable controlled editor for three entity types | Field definitions, `submit`, ratings controls |
| `src/App.jsx` | Navigation, accepted state, builder, history, recovery | `save`, `reserve`, `transition`, `reload` |
| `src/style.css` | Original palette plus responsive CRUD layouts | Final workspace rules |
| `test/model.test.mjs` | Domain and repository contracts | Last-unit concurrency and cancellation |
| `scripts/verify_browser.py` | Isolated user workflows | Context setup, downloads and screenshots |

Original `src/data.js` remains a reference fixture. `scripts/make-initial.mjs` derives the new seed source from its fictional products, plans and subscriber. That script writes a source fixture, not browser storage. Historical invoices and shipments are intentionally not imported as accepted operations. The running app begins with no shipment history.

## Follow a catalog edit

In App, `edit` captures the record, expected version, and accepted workspace snapshot. CatalogEditor receives that capture under a stable editor key. Its local draft is independent of the accepted list. Changing an input does not immediately write storage, and a rejected save does not reconstruct the editor from current accepted values.

The editor converts dollar strings to cents, comma-separated tags to bounded arrays, and subscriber email to lowercase. It submits a record to App, which wraps it in a command such as `item.save`. The repository compares current bytes with the captured baseline inside a Web Lock. The reducer clones the aggregate, applies the command, validates the candidate, and returns it for persistence. React accepts the new snapshot only after storage reports success.

## Follow a reservation

The builder holds subscriber ID, month, and selected item IDs in memory. `quoteBox` resolves those references and builds an accepted quote containing subscriber name, destination, plan facts, and item facts. App freezes a command and its baseline before attempting the write.

The repository checks whether the request key already identifies an accepted reservation. Otherwise it applies the ordinary baseline check and calls the reducer. The reducer verifies the subscriber-month constraint, reconstructs current quote facts, decrements selected stock, appends a Reserved shipment with history, and validates everything together.

## Follow a lifecycle transition

The UI sends shipment ID, expected version, requested next status, and timestamp. Dispatch also sends a tracking reference. The model controls allowed transitions. The UI cannot legitimately skip from Reserved to Delivered simply by changing a button label. Cancellation before dispatch returns stock in the same candidate as the history update.

Draw the write path and mark where data is merely a draft, where it is a validated candidate, and where it is accepted. Then locate the error paths that preserve input. Your map should explain which layer owns each guarantee rather than simply listing imports.

## Line anchors in `src/model.js`

As of the fix pass (re-generate with `grep -n "^export" src/model.js`):

`src/model.js:2 ensure` · `src/model.js:62 month` · `src/model.js:68 validateItem` · `src/model.js:95 validatePlan` · `src/model.js:104 validateSubscriber` · `src/model.js:202 fingerprint` · `src/model.js:233 validateState` · `src/model.js:323 decode` · `src/model.js:330 encode` · `src/model.js:336 parseMoney` · `src/model.js:346 money` · `src/model.js:350 eligible` · `src/model.js:359 recommendations` · `src/model.js:381 quoteBox` · `src/model.js:429 replay` · `src/model.js:444 reduce`
