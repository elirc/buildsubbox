import { useState } from "react";
import { parseMoney } from "./model.js";
const labels = { item: "item", plan: "plan", subscriber: "subscriber" };
const textFields = {
  item: [
    ["name", "Name", 120],
    ["category", "Category", 60],
  ],
  plan: [["name", "Plan name", 80]],
  subscriber: [
    ["name", "Subscriber name", 120],
    ["email", "Email", 254],
    ["destination", "Destination", 300],
  ],
};
const moneyFields = {
  item: [
    ["costCents", "Unit cost in USD"],
    ["retailCents", "Retail value in USD"],
  ],
  plan: [["priceCents", "Monthly plan amount in USD"]],
  subscriber: [],
};
const tagFields = {
  item: [["tags", "Tags"]],
  plan: [],
  subscriber: [
    ["preferredTags", "Preferred tags"],
    ["blockedTags", "Excluded tags"],
  ],
};
export default function CatalogEditor({
  editor,
  state,
  busy,
  onSave,
  onClose,
  onDirty,
  onExport,
}) {
  const [draft, setDraft] = useState(() => structuredClone(editor.record));
  const [amounts, setAmounts] = useState(() =>
    Object.fromEntries(
      moneyFields[editor.kind].map(([k]) => [
        k,
        (editor.record[k] / 100).toFixed(2),
      ]),
    ),
  );
  const [tagText, setTagText] = useState(() =>
    Object.fromEntries(
      tagFields[editor.kind].map(([k]) => [k, editor.record[k].join(", ")]),
    ),
  );
  const [error, setError] = useState("");
  function change(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
    onDirty();
  }
  function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const record = structuredClone(draft);
      for (const [key] of textFields[editor.kind])
        record[key] = record[key].trim();
      if (editor.kind === "subscriber")
        record.email = record.email.toLowerCase();
      for (const [key] of moneyFields[editor.kind])
        record[key] = parseMoney(amounts[key]);
      for (const [key] of tagFields[editor.kind])
        record[key] = tagText[key]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      if (editor.kind === "item") record.stock = Number(record.stock);
      if (editor.kind === "plan") record.itemCount = Number(record.itemCount);
      onSave(record);
    } catch (error) {
      setError(error.message);
    }
  }
  return (
    <form className="panel editor-panel" onSubmit={submit}>
      <h2>
        {editor.expected === null ? "Create" : "Edit"} {labels[editor.kind]}
      </h2>
      {error && (
        <p role="alert" className="error-notice">
          {error}
        </p>
      )}
      <fieldset disabled={busy} className="editor-fields">
        {textFields[editor.kind].map(([key, label, max]) => (
          <label key={key}>
            {label}
            <input
              required
              type={key === "email" ? "email" : "text"}
              maxLength={max}
              value={draft[key]}
              onChange={(e) => change(key, e.target.value)}
            />
          </label>
        ))}
        {moneyFields[editor.kind].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              required
              inputMode="decimal"
              value={amounts[key]}
              onChange={(e) => {
                setAmounts({ ...amounts, [key]: e.target.value });
                onDirty();
              }}
            />
          </label>
        ))}
        {tagFields[editor.kind].map(([key, label]) => (
          <label key={key}>
            {label} (comma separated)
            <input
              maxLength={1100}
              value={tagText[key]}
              onChange={(e) => {
                setTagText({ ...tagText, [key]: e.target.value });
                onDirty();
              }}
            />
          </label>
        ))}
        {editor.kind === "item" && (
          <>
            <label>
              Available units
              <input
                required
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={draft.stock}
                onChange={(e) => change("stock", e.target.value)}
              />
            </label>
            <label>
              Segment
              <select
                aria-label="Segment"
                value={draft.segment}
                onChange={(e) => change("segment", e.target.value)}
              >
                {["Core", "Limited", "Premium"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <p className="field-help wide">
              Available units exclude accepted reservations. Editing this count
              is a manual stock adjustment; it does not revise older shipment
              receipts.
            </p>
          </>
        )}
        {editor.kind === "plan" && (
          <label>
            Items per box
            <input
              required
              type="number"
              min="1"
              max="20"
              step="1"
              value={draft.itemCount}
              onChange={(e) => change("itemCount", e.target.value)}
            />
          </label>
        )}
        {editor.kind === "subscriber" ? (
          <>
            <label>
              Plan
              <select
                required
                aria-label="Plan"
                value={draft.planId}
                onChange={(e) => change("planId", e.target.value)}
              >
                <option value="">Choose a plan</option>
                {state.plans.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={!p.active && p.id !== draft.planId}
                  >
                    {p.name}
                    {p.active ? "" : " (archived)"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Subscription status
              <select
                aria-label="Subscription status"
                value={draft.status}
                onChange={(e) => change("status", e.target.value)}
              >
                {["Active", "Paused", "Cancelled"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <div className="wide ratings-editor">
              <h3>Item ratings</h3>
              <p>
                Ratings change recommendation order. Excluded tags always remove
                a matching item from selection.
              </p>
              {draft.ratings.map((r) => (
                <div className="rating-control" key={r.itemId}>
                  <label>
                    Rating for{" "}
                    {state.items.find((i) => i.id === r.itemId)?.name ??
                      "Unavailable item"}
                    <select
                      aria-label={`Rating for ${state.items.find((i) => i.id === r.itemId)?.name ?? "Unavailable item"}`}
                      value={r.rating}
                      onChange={(e) =>
                        change(
                          "ratings",
                          draft.ratings.map((old) =>
                            old.itemId === r.itemId
                              ? { ...old, rating: Number(e.target.value) }
                              : old,
                          ),
                        )
                      }
                    >
                      {[1, 2, 3, 4, 5].map((v) => (
                        <option key={v} value={v}>
                          {v} of 5
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      change(
                        "ratings",
                        draft.ratings.filter((old) => old.itemId !== r.itemId),
                      )
                    }
                  >
                    Remove rating for{" "}
                    {state.items.find((i) => i.id === r.itemId)?.name}
                  </button>
                </div>
              ))}
              <label>
                Add item rating
                <select
                  aria-label="Add item rating" value=""
                  onChange={(e) => {
                    if (e.target.value)
                      change("ratings", [
                        ...draft.ratings,
                        { itemId: e.target.value, rating: 3 },
                      ]);
                  }}
                >
                  <option value="">Choose an unrated item</option>
                  {state.items
                    .filter(
                      (i) => !draft.ratings.some((r) => r.itemId === i.id),
                    )
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          </>
        ) : (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => change("active", e.target.checked)}
            />
            Active
          </label>
        )}
        <div className="action-row wide">
          <button className="primary" type="submit">
            Save {labels[editor.kind]}
          </button>
          <button
            type="button"
            onClick={() =>
              onExport({
                kind: editor.kind,
                draft,
                amounts,
                tagText,
                expected: editor.expected,
                baselineRevision: editor.base.state.revision,
              })
            }
          >
            Export editor draft
          </button>
          <button type="button" onClick={onClose}>
            Close editor
          </button>
        </div>
      </fieldset>
    </form>
  );
}
