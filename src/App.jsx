import { useEffect, useState } from "react";
import CatalogEditor from "./CatalogEditor.jsx";
import { initial } from "./initial.js";
import { decode, money, quoteBox, recommendations } from "./model.js";
import { repository, browserLock, STORAGE_KEY } from "./repository.js";
const repo = repository(
  {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  },
  browserLock,
  initial,
);
const sections = [
  "Overview",
  "Subscribers",
  "Inventory",
  "Plans",
  "Box builder",
  "Shipments",
  "Workspace",
];
const kindFor = { Inventory: "item", Plans: "plan", Subscribers: "subscriber" };
const listFor = { item: "items", plan: "plans", subscriber: "subscribers" };
function download(name, content) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function readWorkspace() {
  try {
    const snapshot = repo.load();
    return { snapshot, raw: snapshot.raw, error: "" };
  } catch (error) {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {}
    return { snapshot: null, raw, error: error.message };
  }
}
function blankRecord(kind, state) {
  const identity = { id: crypto.randomUUID(), version: 1 };
  if (kind === "item")
    return {
      ...identity,
      name: "",
      category: "Home",
      costCents: 0,
      retailCents: 0,
      stock: 0,
      tags: [],
      segment: "Core",
      active: true,
    };
  if (kind === "plan")
    return { ...identity, name: "", priceCents: 0, itemCount: 3, active: true };
  return {
    ...identity,
    name: "",
    email: "",
    destination: "",
    planId: state.plans.find((p) => p.active)?.id ?? "",
    status: "Active",
    preferredTags: [],
    blockedTags: [],
    ratings: [],
  };
}
export default function App() {
  const [loaded] = useState(readWorkspace),
    [snapshot, setSnapshot] = useState(loaded.snapshot),
    [raw, setRaw] = useState(loaded.raw),
    [error, setError] = useState(loaded.error),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [stale, setStale] = useState(false);
  const [section, setSection] = useState(
      loaded.snapshot ? "Overview" : "Workspace",
    ),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [page, setPage] = useState(1),
    [editor, setEditor] = useState(null),
    [dirty, setDirty] = useState(false);
  const [builder, setBuilder] = useState({
      subscriberId: loaded.snapshot?.state.subscribers[0]?.id ?? "",
      cycle: new Date().toISOString().slice(0, 7),
      ids: [],
    }),
    [attempt, setAttempt] = useState(null),
    [tracking, setTracking] = useState({}),
    [imported, setImported] = useState(null);
  const state = snapshot?.state;
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY || e.key === null) setStale(true);
    };
    addEventListener("storage", handler);
    return () => removeEventListener("storage", handler);
  }, []);
  useEffect(() => {
    const handler = (e) => {
      if (
        dirty ||
        builder.ids.length ||
        attempt ||
        Object.values(tracking).some(Boolean) ||
        busy
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    addEventListener("beforeunload", handler);
    return () => removeEventListener("beforeunload", handler);
  }, [dirty, builder, attempt, tracking, busy]);
  function closeEditor() {
    if (
      dirty &&
      !confirm("Discard this unsaved editor? Export its draft first if needed.")
    )
      return false;
    setEditor(null);
    setDirty(false);
    return true;
  }
  function navigate(next) {
    if (next === section || closeEditor()) {
      setSection(next);
      setQuery("");
      setFilter("all");
      setPage(1);
      setError("");
      setMessage("");
    }
  }
  function accept(next) {
    setSnapshot(next);
    setRaw(next.raw);
    setStale(false);
  }
  async function save(command, base = snapshot, after) {
    if (!base || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const next = await repo.commit(base, command);
      accept(next);
      after?.();
      setMessage(
        command.type === "reserve"
          ? "Reservation recorded locally. No charge, carrier booking or notification occurred."
          : "Saved to this browser.",
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  function edit(kind, record) {
    if (!state || !closeEditor()) return;
    setEditor({
      key: crypto.randomUUID(),
      kind,
      record: record ? structuredClone(record) : blankRecord(kind, state),
      expected: record?.version ?? null,
      base: snapshot,
    });
    setDirty(false);
    setError("");
  }
  function reload() {
    if (
      (dirty ||
        builder.ids.length ||
        attempt ||
        Object.values(tracking).some(Boolean)) &&
      !confirm(
        "Reload storage and discard local editor, box and tracking drafts? Export them first if needed.",
      )
    )
      return;
    const r = readWorkspace();
    setSnapshot(r.snapshot);
    setRaw(r.raw);
    setError(r.error);
    setMessage(r.error ? "" : "Reloaded current storage.");
    setEditor(null);
    setDirty(false);
    setAttempt(null);
    setTracking({});
    setImported(null);
    setStale(false);
    setBuilder({
      subscriberId: r.snapshot?.state.subscribers[0]?.id ?? "",
      cycle: new Date().toISOString().slice(0, 7),
      ids: [],
    });
    if (!r.snapshot) setSection("Workspace");
  }
  function exportDrafts() {
    download(
      "parcelpilot-operation-drafts.json",
      JSON.stringify({ builder, attempt, tracking }, null, 2),
    );
  }
  const subscriber = state?.subscribers.find(
      (s) => s.id === builder.subscriberId,
    ),
    plan = state?.plans.find((p) => p.id === subscriber?.planId);
  let ranked = [];
  if (state && subscriber) ranked = recommendations(state, subscriber.id);
  let quote = null,
    quoteError = "";
  if (state && subscriber)
    try {
      quote = quoteBox(state, subscriber.id, builder.ids);
    } catch (error) {
      quoteError = error.message;
    }
  function reserve() {
    if (!snapshot) return;
    try {
      const pending = attempt ?? {
        base: snapshot,
        command: {
          type: "reserve",
          id: crypto.randomUUID(),
          requestKey: crypto.randomUUID(),
          cycle: builder.cycle,
          quote: quoteBox(state, builder.subscriberId, builder.ids),
          at: new Date().toISOString(),
        },
      };
      setAttempt(pending);
      void save(pending.command, pending.base, () => {
        setAttempt(null);
        setBuilder((b) => ({ ...b, ids: [] }));
        setSection("Shipments");
        setQuery("");
        setFilter("all");
        setPage(1);
      });
    } catch (error) {
      setError(error.message);
    }
  }
  function transition(sh, status) {
    if (
      status === "Cancelled" &&
      !confirm(
        "Cancel this local reservation and return each reserved unit to available stock? Its cycle remains recorded.",
      )
    )
      return;
    const command = {
      type: "shipment.transition",
      id: sh.id,
      expected: sh.version,
      status,
      at: new Date().toISOString(),
    };
    if (status === "Shipped") command.tracking = (tracking[sh.id] ?? "").trim();
    void save(command, snapshot, () =>
      setTracking((old) => {
        const next = { ...old };
        delete next[sh.id];
        return next;
      }),
    );
  }
  async function readImport(file) {
    if (!file) return;
    setError("");
    setImported(null);
    try {
      if (file.size > 4 * 1024 * 1024) throw new Error("Backup exceeds 4 MiB.");
      const text = await file.text();
      setImported({ raw: text, state: decode(text) });
    } catch (error) {
      setError(error.message);
    }
  }
  async function restore() {
    if (
      !imported ||
      busy ||
      !confirm(
        "Replace the entire local workspace with this reviewed backup? Export current records and drafts first.",
      )
    )
      return;
    setBusy(true);
    try {
      const next = await repo.restore(raw, imported.raw);
      accept(next);
      setEditor(null);
      setDirty(false);
      setAttempt(null);
      setTracking({});
      setBuilder({
        subscriberId: next.state.subscribers[0]?.id ?? "",
        cycle: new Date().toISOString().slice(0, 7),
        ids: [],
      });
      setImported(null);
      setError("");
      setMessage("Reviewed backup restored as a new workspace revision.");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  const kind = kindFor[section];
  const records =
    kind && state
      ? state[listFor[kind]].filter(
          (v) =>
            [v.name, v.email, v.category, v.destination, ...(v.tags ?? [])]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query.trim().toLowerCase()) &&
            (filter === "all" ||
              (kind === "subscriber"
                ? v.status === filter
                : v.active === (filter === "active"))),
        )
      : [];
  const shipments =
    state?.shipments.filter(
      (sh) =>
        [
          sh.id,
          sh.cycle,
          sh.quote.subscriberName,
          sh.quote.destination,
          sh.quote.planName,
          sh.tracking,
          ...sh.quote.lines.map((l) => l.name),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (filter === "all" || sh.status === filter),
    ) ?? [];
  const list = section === "Shipments" ? shipments : records;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(list.length / 20)));
  const visible = list.slice((currentPage - 1) * 20, currentPage * 20);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">PP</div>
          <div>
            <strong>ParcelPilot</strong>
            <span>Subscription box workshop</span>
          </div>
        </div>
        <nav className="nav-tabs" aria-label="Main sections">
          {sections.map((name) => (
            <button
              type="button"
              className={section === name ? "active" : ""}
              aria-current={section === name ? "page" : undefined}
              disabled={busy || (!state && name !== "Workspace")}
              key={name}
              onClick={() => navigate(name)}
            >
              {name}
            </button>
          ))}
        </nav>
        <div className="cycle-card">
          <strong>Local operations practice</strong>
          <p>
            Fictional subscribers and inventory. No real billing, carrier jobs
            or email.
          </p>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Monthly box platform</p>
            <h1>
              {section === "Overview"
                ? "Curate a box. Keep the record."
                : section}
            </h1>
          </div>
          <button disabled={busy} onClick={reload}>
            Reload storage
          </button>
        </header>
        <p className="workspace-caption">
          Local browser workspace / USD /{" "}
          {state ? `Revision ${state.revision}` : "Recovery mode"}. Editor and
          operation drafts remain in this tab until reload.
        </p>
        {stale && (
          <p className="error-notice">
            Storage changed elsewhere. Your view and drafts are retained; reload
            before another edit.
          </p>
        )}
        {error && (
          <p role="alert" className="error-notice">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="success-notice">
            {message}
          </p>
        )}
        {state && section === "Overview" && (
          <>
            <section className="metric-grid">
              {[
                [
                  "Active subscribers",
                  state.subscribers.filter((s) => s.status === "Active").length,
                ],
                [
                  "Available units",
                  state.items.reduce((sum, i) => sum + i.stock, 0),
                ],
                [
                  "Open reservations",
                  state.shipments.filter((sh) =>
                    ["Reserved", "Packed"].includes(sh.status),
                  ).length,
                ],
                ["Recorded cycles", state.shipments.length],
              ].map(([label, value]) => (
                <article className="metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </section>
            <section className="overview-grid">
              <div className="panel hero-panel">
                <p className="eyebrow">From preference to parcel</p>
                <h2>Build a box you can account for.</h2>
                <p>
                  Manage subscribers, curate from available inventory, and
                  reserve one box for a chosen month. Accepted names, amounts
                  and contents stay attached to its shipment record.
                </p>
                <div className="action-row">
                  <button
                    className="primary"
                    onClick={() => navigate("Box builder")}
                  >
                    Build a monthly box
                  </button>
                  <button onClick={() => navigate("Inventory")}>
                    Manage inventory
                  </button>
                </div>
              </div>
              <div className="panel">
                <h2>One deliberate workflow</h2>
                <ol className="workflow-list">
                  <li>Edit a subscriber and choose an active plan.</li>
                  <li>
                    Review preferences and select the exact number of distinct
                    items.
                  </li>
                  <li>
                    Reserve one unit of each item in the same write as the cycle
                    record.
                  </li>
                  <li>
                    Pack, record a tracking reference, then mark delivered.
                  </li>
                </ol>
                <p>
                  Cancellation before dispatch restores units once. Cancelled
                  cycles remain recorded and cannot be reserved again.
                </p>
              </div>
            </section>
          </>
        )}
        {state && kind && (
          <section className="stack">
            <div className="section-controls">
              <label>
                Search {section.toLowerCase()}
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Literal text search"
                />
              </label>
              <label>
                {kind === "subscriber"
                  ? "Subscription filter"
                  : "Visibility filter"}
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All</option>
                  {(kind === "subscriber"
                    ? ["Active", "Paused", "Cancelled"]
                    : ["active", "archived"]
                  ).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary"
                disabled={busy}
                onClick={() => edit(kind)}
              >
                New {kind}
              </button>
            </div>
            {editor && (
              <CatalogEditor
                key={editor.key}
                editor={editor}
                state={state}
                busy={busy}
                onDirty={() => setDirty(true)}
                onClose={closeEditor}
                onExport={(value) =>
                  download(
                    "parcelpilot-editor-draft.json",
                    JSON.stringify(value, null, 2),
                  )
                }
                onSave={(record) =>
                  void save(
                    {
                      type: `${editor.kind}.save`,
                      record,
                      expected: editor.expected,
                    },
                    editor.base,
                    () => {
                      setEditor(null);
                      setDirty(false);
                    },
                  )
                }
              />
            )}
            <div className="record-list">
              {visible.map((record) => (
                <article className="panel record-card" key={record.id}>
                  <div>
                    <h2>{record.name}</h2>
                    {kind === "item" ? (
                      <>
                        <p>
                          {record.category} / {record.segment} / {record.stock}{" "}
                          available units
                        </p>
                        <p>
                          Cost {money(record.costCents)} / Retail{" "}
                          {money(record.retailCents)}
                        </p>
                        <div className="tag-list">
                          {record.tags.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      </>
                    ) : kind === "plan" ? (
                      <p>
                        {money(record.priceCents)} per monthly cycle /{" "}
                        {record.itemCount} distinct items
                      </p>
                    ) : (
                      <>
                        <p>
                          {record.email} / {record.destination}
                        </p>
                        <p>
                          {
                            state.plans.find((p) => p.id === record.planId)
                              ?.name
                          }{" "}
                          / {record.status}
                        </p>
                      </>
                    )}
                    <p className="muted">
                      {kind === "subscriber"
                        ? ""
                        : record.active
                          ? "Active / "
                          : "Archived / "}
                      Version {record.version}
                    </p>
                  </div>
                  <div className="action-row">
                    <button disabled={busy} onClick={() => edit(kind, record)}>
                      Edit {record.name}
                    </button>
                    <button
                      disabled={busy || !!editor}
                      className="danger"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete ${record.name}? Referenced history may prevent deletion.`,
                          )
                        )
                          void save({
                            type: `${kind}.delete`,
                            id: record.id,
                            expected: record.version,
                          });
                      }}
                    >
                      Delete {record.name}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!visible.length && (
              <p className="panel">No records match this search and filter.</p>
            )}
          </section>
        )}
        {state && section === "Box builder" && (
          <section className="stack">
            <p className="intro">
              Select one subscriber and month. Amounts are illustrative;
              recording a reservation never charges a card.
            </p>
            <fieldset disabled={busy || !!attempt} className="section-controls">
              <label>
                Subscriber
                <select
                  value={builder.subscriberId}
                  onChange={(e) => {
                    if (
                      !builder.ids.length ||
                      confirm(
                        "Changing subscriber discards the selected box items. Continue?",
                      )
                    )
                      setBuilder({
                        ...builder,
                        subscriberId: e.target.value,
                        ids: [],
                      });
                  }}
                >
                  <option value="">Choose a subscriber</option>
                  {state.subscribers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Cycle month
                <input
                  type="month"
                  min="2000-01"
                  max="2099-12"
                  value={builder.cycle}
                  onChange={(e) =>
                    setBuilder({ ...builder, cycle: e.target.value })
                  }
                />
              </label>
              <button
                disabled={
                  !subscriber || !plan?.active || subscriber.status !== "Active"
                }
                onClick={() => {
                  if (
                    !builder.ids.length ||
                    confirm(
                      "Replace selected items with current recommendations?",
                    )
                  )
                    setBuilder({
                      ...builder,
                      ids: ranked
                        .slice(0, plan.itemCount)
                        .map((r) => r.item.id),
                    });
                }}
              >
                Fill from recommendations
              </button>
            </fieldset>
            <div className="builder-layout">
              <div className="panel">
                <h2>Selected box</h2>
                {subscriber && (
                  <p>
                    {subscriber.name} / {plan?.name ?? "Unavailable plan"} /{" "}
                    {builder.ids.length} of {plan?.itemCount ?? 0} items
                  </p>
                )}
                <div className="selected-list">
                  {builder.ids.map((id) => (
                    <div className="selected-item" key={id}>
                      <strong>
                        {state.items.find((i) => i.id === id)?.name ??
                          "Unavailable item"}
                      </strong>
                      <button
                        disabled={busy || !!attempt}
                        onClick={() =>
                          setBuilder({
                            ...builder,
                            ids: builder.ids.filter((value) => value !== id),
                          })
                        }
                      >
                        Remove{" "}
                        {state.items.find((i) => i.id === id)?.name ?? "item"}
                      </button>
                    </div>
                  ))}
                </div>
                {!builder.ids.length && (
                  <p>
                    No items selected. Add candidates below or fill from
                    recommendations.
                  </p>
                )}
                {quoteError && <p className="field-help">{quoteError}</p>}
                {quote && (
                  <div className="state-list">
                    <div className="state-row">
                      <span>Accepted plan amount</span>
                      <strong>{money(quote.priceCents)}</strong>
                    </div>
                    <div className="state-row">
                      <span>Box item cost</span>
                      <strong>{money(quote.costCents)}</strong>
                    </div>
                    <div className="state-row">
                      <span>Retail value</span>
                      <strong>{money(quote.retailCents)}</strong>
                    </div>
                    <div className="state-row">
                      <span>Plan amount minus item cost</span>
                      <strong>
                        {money(quote.priceCents - quote.costCents)}
                      </strong>
                    </div>
                  </div>
                )}
                <div className="action-row">
                  <button
                    className="primary"
                    disabled={busy || (!attempt && !quote)}
                    onClick={reserve}
                  >
                    {attempt ? "Retry same reservation" : "Reserve monthly box"}
                  </button>
                  <button onClick={exportDrafts}>
                    Export operation drafts
                  </button>
                </div>
                {attempt && (
                  <>
                    <p>
                      The request is frozen. Inspect Shipments before discarding
                      after an uncertain result; retrying keeps the same request
                      key.
                    </p>
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (
                          confirm(
                            "Discard the frozen attempt? Review existing shipments first. The subscriber-month constraint still prevents a second cycle record.",
                          )
                        )
                          setAttempt(null);
                      }}
                    >
                      Discard frozen attempt
                    </button>
                  </>
                )}
              </div>
              <div className="panel">
                <h2>Preference-aware candidates</h2>
                <p>
                  Only active, in-stock items without excluded tags appear.
                  Scores rank the provided tags and ratings; they are not
                  percentages.
                </p>
                {ranked.map(({ item, score }) => (
                  <article className="candidate" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>
                        {item.category} / {item.stock} available / Score {score}
                      </p>
                      <div className="tag-list">
                        {item.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      disabled={
                        busy ||
                        !!attempt ||
                        !plan ||
                        builder.ids.includes(item.id) ||
                        builder.ids.length >= plan.itemCount
                      }
                      onClick={() =>
                        setBuilder({
                          ...builder,
                          ids: [...builder.ids, item.id],
                        })
                      }
                    >
                      {builder.ids.includes(item.id)
                        ? "Selected"
                        : `Add ${item.name}`}
                    </button>
                  </article>
                ))}
                {!ranked.length && (
                  <p>
                    No eligible candidates. Review available stock, tags and
                    subscriber selection.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
        {state && section === "Shipments" && (
          <section className="stack">
            <p className="intro">
              A local reservation and lifecycle ledger. Packing, tracking and
              delivery states do not call a carrier or payment provider.
            </p>
            <div className="section-controls">
              <label>
                Search shipments
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Subscriber, month, item or tracking"
                />
              </label>
              <label>
                Shipment status
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {[
                    "all",
                    "Reserved",
                    "Packed",
                    "Shipped",
                    "Delivered",
                    "Cancelled",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <button
                onClick={() =>
                  download(
                    "parcelpilot-shipments.json",
                    JSON.stringify(state.shipments, null, 2),
                  )
                }
              >
                Export shipments
              </button>
            </div>
            {visible.map((sh) => (
              <article className="panel shipment-card" key={sh.id}>
                <div className="record-card">
                  <div>
                    <h2>
                      {sh.quote.subscriberName} / {sh.cycle}
                    </h2>
                    <p>
                      {sh.quote.planName} / {sh.quote.destination}
                    </p>
                    <p className="receipt-id">{sh.id}</p>
                  </div>
                  <span className={`status ${sh.status.toLowerCase()}`}>
                    {sh.status} / Version {sh.version}
                  </span>
                </div>
                <ul>
                  {sh.quote.lines.map((l) => (
                    <li key={l.itemId}>
                      {l.name} / 1 unit / accepted cost {money(l.costCents)}
                    </li>
                  ))}
                </ul>
                <p>
                  Plan amount {money(sh.quote.priceCents)} / Item cost{" "}
                  {money(sh.quote.costCents)} / Retail{" "}
                  {money(sh.quote.retailCents)}
                </p>
                {sh.tracking && <p>Tracking reference: {sh.tracking}</p>}
                <details>
                  <summary>Lifecycle history</summary>
                  <ol>
                    {sh.history.map((h) => (
                      <li key={h.status}>
                        {h.status}: {new Date(h.at).toLocaleString()}
                      </li>
                    ))}
                  </ol>
                </details>
                <fieldset disabled={busy} className="action-row">
                  {sh.status === "Reserved" && (
                    <button onClick={() => transition(sh, "Packed")}>
                      Mark packed
                    </button>
                  )}
                  {sh.status === "Packed" && (
                    <>
                      <label>
                        Tracking reference
                        <input
                          maxLength={120}
                          value={tracking[sh.id] ?? ""}
                          onChange={(e) =>
                            setTracking({
                              ...tracking,
                              [sh.id]: e.target.value,
                            })
                          }
                        />
                      </label>
                      <button
                        disabled={!(tracking[sh.id] ?? "").trim()}
                        onClick={() => transition(sh, "Shipped")}
                      >
                        Mark shipped
                      </button>
                    </>
                  )}
                  {sh.status === "Shipped" && (
                    <button onClick={() => transition(sh, "Delivered")}>
                      Mark delivered
                    </button>
                  )}
                  {["Reserved", "Packed"].includes(sh.status) && (
                    <button
                      className="danger"
                      onClick={() => transition(sh, "Cancelled")}
                    >
                      Cancel reservation
                    </button>
                  )}
                  <button
                    onClick={() =>
                      download(
                        `parcelpilot-${sh.id}.json`,
                        JSON.stringify(sh, null, 2),
                      )
                    }
                  >
                    Export shipment
                  </button>
                </fieldset>
              </article>
            ))}
            {!visible.length && (
              <p className="panel">
                No shipments match this search and filter.
              </p>
            )}
          </section>
        )}
        {state && (kind || section === "Shipments") && (
          <div className="pagination">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {Math.max(1, Math.ceil(list.length / 20))} /{" "}
              {list.length} records
            </span>
            <button
              disabled={currentPage * 20 >= list.length}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
        {section === "Workspace" && (
          <section className="stack">
            <div className="panel">
              <h2>Export before replacing records</h2>
              <p>
                Complete workspace backups can be restored here. Operation,
                editor and shipment exports are reference files for manual
                review, not workspace imports.
              </p>
              <div className="action-row">
                <button
                  onClick={() =>
                    download(
                      "parcelpilot-workspace.json",
                      snapshot
                        ? JSON.stringify(snapshot.state, null, 2)
                        : (raw ?? ""),
                    )
                  }
                >
                  {snapshot
                    ? "Export loaded workspace"
                    : "Export original stored bytes"}
                </button>
                <button onClick={exportDrafts}>Export operation drafts</button>
                <button
                  onClick={() =>
                    download(
                      "parcelpilot-sample.json",
                      JSON.stringify(initial, null, 2),
                    )
                  }
                >
                  Download clean sample backup
                </button>
              </div>
            </div>
            <div className="panel editor-panel">
              <h2>Review a workspace backup</h2>
              <label>
                Workspace JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  disabled={busy}
                  onChange={(e) => void readImport(e.target.files?.[0])}
                />
              </label>
              {imported && (
                <>
                  <p>
                    Validated backup: {imported.state.items.length} items,{" "}
                    {imported.state.plans.length} plans,{" "}
                    {imported.state.subscribers.length} subscribers,{" "}
                    {imported.state.shipments.length} shipments. Replacement
                    removes current records absent from the file.
                  </p>
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() => void restore()}
                  >
                    Replace with reviewed backup
                  </button>
                </>
              )}
            </div>
            <div className="panel">
              <h2>Local workspace limits</h2>
              <p>
                4 MiB / 1,000 items / 100 plans / 1,000 subscribers / 2,000
                shipment records. Anyone with browser-profile access can inspect
                or change this data. Use fictional records for exercises.
              </p>
              <p>
                There is no scheduled billing, payment retry, carrier
                integration or notification service. Existing historical sample
                events are not treated as accepted operations. One
                subscriber-month record is retained even after cancellation; a
                replacement box in that same month is a future workflow
                exercise.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
