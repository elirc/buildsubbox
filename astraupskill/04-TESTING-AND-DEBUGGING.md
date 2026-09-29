# Test failures that matter to operations

From the project root:

```powershell
npm.cmd test
npm.cmd run build
```

The first command runs Node's built-in test runner without a database or browser. Results go to `.verification/unit-results.json` and a TAP log. The production build checks the React bundle. Generated verification output is ignored by Git and is not your operational workspace.

## Domain and storage tests

Read [model.test.mjs](../test/model.test.mjs). The suite covers inventory, plan and subscriber CRUD; money and collection bounds; normalized unique email; rating references; hard tag exclusions; deterministic recommendation order; and exact plan counts.

Reservation tests verify one-unit deductions, whole-operation rejection when an item is unavailable, changed quote facts, duplicate keys, duplicate subscriber-month slots, retained snapshots, and deletion safeguards. Lifecycle cases require tracking for dispatch, reject backward timestamps and stale versions, prevent cancellation after shipping, and restore stock exactly once.

Repository fixtures implement storage and a serializing promise queue. Two concurrent requests for the last unit produce one complete accepted box. A storage adapter that writes and then throws simulates a lost acknowledgement. Retry must return one shipment with one stock deduction. These tests assert persisted facts rather than only checking an error string or disabled button.

## Browser verification

Install the optional Python verifier dependency in your preferred isolated environment:

```powershell
python -m pip install playwright==1.59.0
python -m playwright install chromium
python scripts/verify_browser.py
```

Stop your development server first. The script owns a preview process on `127.0.0.1:5181` and refuses to reuse an occupied port. Each scenario gets a fresh browser context. It stops only its own preview process. `ASTRA_BROWSER_EXECUTABLE` selects an existing Chromium executable; `PARCELPILOT_CHECK_DIR` chooses the output directory.

The browser checks exercise forms, actual storage, downloads, separate tabs, reservation retries, lifecycle buttons, pagination, recovery, and selected responsive layouts. Fixture mutations happen only in disposable profiles. They do not alter your normal browser workspace or call real billing and shipping systems.

## Debug a rejected editor

Open two tabs at the same origin. In A, edit an item name without saving. In B, create another item and wait for the saved message. Foreground A and submit. Observe the conflict alert and retained draft, then export it. Inspect the accepted workspace to confirm that the original item name remains unchanged.

Place a breakpoint before the raw baseline comparison in `commit`. Another breakpoint before App's `accept` should not run for the rejected write. Do not repair the conflict by assigning the latest baseline to an old draft without review; that would remove the connection between what the user saw and what they edited.

## Inspect layout and naming

Automation and screenshot review serve different purposes. The first overview layout retained an old icon column, causing label and value overlap even without document overflow. The revised layout stacks each label and value and checks their bounds separately. The rating editor uses an explicit accessible name for each dropdown, matching its visible item label.

Check keyboard focus, narrow controls, empty lists, and long names manually when extending the app. Selected Chromium screenshots do not establish complete accessibility, every browser engine, or correctness for every future schema extension.
