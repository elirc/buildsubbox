# ParcelPilot / Buildsubbox

A local subscription-box CRUD workshop: inventory, plans, subscribers and ratings; preference-aware curation; atomic stock reservation; persistent shipment history; reviewed backup recovery. No real billing, email or carrier operations occur.

Start the detailed junior-to-mid-level course at [astraupskill/README.md](astraupskill/README.md).

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run dev
```

Open `http://127.0.0.1:5181` consistently. Browser storage belongs to that origin. Requires Node 22.12 or newer compatible with the package engine; verified on Node 22.16.0. Dependencies and lockfile are pinned.

```powershell
npm.cmd test
npm.cmd run build
```

See [browser verification](astraupskill/04-TESTING-AND-DEBUGGING.md) and [limits](astraupskill/VERIFICATION.md). Export a complete workspace before experiments. Draft and operation exports are for manual review, not automatic workspace import.

A reservation deducts one available unit per selected item and stores the subscriber-month receipt together. Cancellation before dispatch returns units once and retains history. Cancelled cycles remain unique; replacement shipments are a future exercise. Original documentation remains under [docs/upskill](docs/upskill/README.md) as historical context.
