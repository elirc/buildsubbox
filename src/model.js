/** ParcelPilot's pure domain: validated CRUD and one atomic reservation per subscriber cycle. */
export function ensure(ok, message) {
  if (!ok) throw new Error(message);
}
function obj(v, keys) {
  ensure(
    v !== null && typeof v === "object" && !Array.isArray(v),
    "Expected an object.",
  );
  ensure(
    Object.keys(v).sort().join("|") === [...keys].sort().join("|"),
    "Unexpected or missing fields.",
  );
  return v;
}
function text(v, max, blank = false) {
  ensure(
    typeof v === "string" &&
      v === v.trim() &&
      (blank || v.length > 0) &&
      v.length <= max &&
      !/[\u0000-\u001f\u007f]/.test(v),
    "Text must be trimmed, bounded and control-free.",
  );
}
function integer(v, min, max = Number.MAX_SAFE_INTEGER - 1) {
  ensure(
    Number.isSafeInteger(v) && v >= min && v <= max,
    "Number is outside its permitted range.",
  );
}
function id(v) {
  text(v, 80);
  ensure(/^[a-zA-Z0-9_-]+$/.test(v), "Invalid identifier.");
}
function version(v) {
  integer(v, 1);
}
function bool(v) {
  ensure(typeof v === "boolean", "Expected true or false.");
}
function array(v, max) {
  ensure(Array.isArray(v) && v.length <= max, "Collection limit exceeded.");
}
function unique(v) {
  ensure(new Set(v).size === v.length, "Duplicate identifier, email or tag.");
}
function tags(v) {
  array(v, 20);
  v.forEach((t) => text(t, 50));
  unique(v.map((t) => t.toLowerCase()));
}
function instant(v) {
  ensure(
    typeof v === "string" &&
      /^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v) &&
      Number.isFinite(Date.parse(v)) &&
      new Date(v).toISOString() === v,
    "Invalid timestamp.",
  );
}
export function month(v) {
  ensure(
    typeof v === "string" && /^20\d\d-(0[1-9]|1[0-2])$/.test(v),
    "Cycle must be a month from 2000-01 through 2099-12.",
  );
}
export function validateItem(v) {
  obj(v, [
    "id",
    "version",
    "name",
    "category",
    "costCents",
    "retailCents",
    "stock",
    "tags",
    "segment",
    "active",
  ]);
  id(v.id);
  version(v.version);
  text(v.name, 120);
  text(v.category, 60);
  integer(v.costCents, 0, 10000000);
  integer(v.retailCents, 0, 10000000);
  integer(v.stock, 0, 1000000);
  tags(v.tags);
  ensure(
    ["Core", "Limited", "Premium"].includes(v.segment),
    "Invalid item segment.",
  );
  bool(v.active);
}
export function validatePlan(v) {
  obj(v, ["id", "version", "name", "priceCents", "itemCount", "active"]);
  id(v.id);
  version(v.version);
  text(v.name, 80);
  integer(v.priceCents, 0, 10000000);
  integer(v.itemCount, 1, 20);
  bool(v.active);
}
export function validateSubscriber(v) {
  obj(v, [
    "id",
    "version",
    "name",
    "email",
    "destination",
    "planId",
    "status",
    "preferredTags",
    "blockedTags",
    "ratings",
  ]);
  id(v.id);
  version(v.version);
  text(v.name, 120);
  text(v.email, 254);
  ensure(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) &&
      v.email === v.email.toLowerCase(),
    "Use a normalized email address.",
  );
  text(v.destination, 300);
  id(v.planId);
  ensure(
    ["Active", "Paused", "Cancelled"].includes(v.status),
    "Invalid subscription status.",
  );
  tags(v.preferredTags);
  tags(v.blockedTags);
  array(v.ratings, 1000);
  for (const r of v.ratings) {
    obj(r, ["itemId", "rating"]);
    id(r.itemId);
    integer(r.rating, 1, 5);
  }
  unique(v.ratings.map((r) => r.itemId));
}
function validateQuote(q) {
  obj(q, [
    "subscriberId",
    "subscriberVersion",
    "subscriberName",
    "destination",
    "planId",
    "planVersion",
    "planName",
    "priceCents",
    "itemCount",
    "lines",
    "costCents",
    "retailCents",
  ]);
  id(q.subscriberId);
  version(q.subscriberVersion);
  text(q.subscriberName, 120);
  text(q.destination, 300);
  id(q.planId);
  version(q.planVersion);
  text(q.planName, 80);
  integer(q.priceCents, 0, 10000000);
  integer(q.itemCount, 1, 20);
  array(q.lines, 20);
  ensure(
    q.lines.length === q.itemCount,
    "Box must contain the exact plan item count.",
  );
  for (const l of q.lines) {
    obj(l, [
      "itemId",
      "version",
      "name",
      "category",
      "costCents",
      "retailCents",
    ]);
    id(l.itemId);
    version(l.version);
    text(l.name, 120);
    text(l.category, 60);
    integer(l.costCents, 0, 10000000);
    integer(l.retailCents, 0, 10000000);
  }
  unique(q.lines.map((l) => l.itemId));
  ensure(
    q.lines.map((l) => l.itemId).join("|") ===
      q.lines
        .map((l) => l.itemId)
        .sort()
        .join("|"),
    "Box lines must be sorted.",
  );
  ensure(
    q.costCents === q.lines.reduce((sum, l) => sum + l.costCents, 0) &&
      q.retailCents === q.lines.reduce((sum, l) => sum + l.retailCents, 0),
    "Box totals do not agree with accepted lines.",
  );
}
export function fingerprint(cycle, q) {
  return JSON.stringify([
    cycle,
    q.subscriberId,
    q.subscriberVersion,
    q.subscriberName,
    q.destination,
    q.planId,
    q.planVersion,
    q.planName,
    q.priceCents,
    q.itemCount,
    q.lines.map((l) => [
      l.itemId,
      l.version,
      l.name,
      l.category,
      l.costCents,
      l.retailCents,
    ]),
    q.costCents,
    q.retailCents,
  ]);
}
const transitions = {
  Reserved: ["Packed", "Cancelled"],
  Packed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};
export function validateState(s) {
  obj(s, ["schema", "revision", "items", "plans", "subscribers", "shipments"]);
  ensure(s.schema === 1, "Unsupported workspace schema.");
  integer(s.revision, 0);
  array(s.items, 1000);
  array(s.plans, 100);
  array(s.subscribers, 1000);
  array(s.shipments, 2000);
  s.items.forEach(validateItem);
  s.plans.forEach(validatePlan);
  s.subscribers.forEach(validateSubscriber);
  unique(s.items.map((i) => i.id));
  unique(s.plans.map((p) => p.id));
  unique(s.subscribers.map((u) => u.id));
  unique(s.subscribers.map((u) => u.email));
  for (const u of s.subscribers) {
    ensure(
      s.plans.some((p) => p.id === u.planId),
      "Subscriber references a missing plan.",
    );
    ensure(
      u.ratings.every((r) => s.items.some((i) => i.id === r.itemId)),
      "Rating references a missing item.",
    );
  }
  for (const sh of s.shipments) {
    obj(sh, [
      "id",
      "version",
      "requestKey",
      "fingerprint",
      "cycle",
      "quote",
      "status",
      "tracking",
      "createdAt",
      "history",
    ]);
    id(sh.id);
    version(sh.version);
    id(sh.requestKey);
    month(sh.cycle);
    validateQuote(sh.quote);
    ensure(
      sh.fingerprint === fingerprint(sh.cycle, sh.quote),
      "Reservation fingerprint differs from its receipt.",
    );
    ensure(Object.hasOwn(transitions, sh.status), "Invalid shipment status.");
    text(sh.tracking, 120, true);
    instant(sh.createdAt);
    array(sh.history, 4);
    ensure(
      sh.history.length > 0 &&
        sh.history[0].status === "Reserved" &&
        sh.history[0].at === sh.createdAt,
      "Shipment must start with a reservation.",
    );
    sh.history.forEach((h, index) => {
      obj(h, ["status", "at"]);
      instant(h.at);
      if (index)
        ensure(
          transitions[sh.history[index - 1].status]?.includes(h.status) &&
            h.at >= sh.history[index - 1].at,
          "Invalid lifecycle history.",
        );
    });
    ensure(
      sh.history.at(-1).status === sh.status &&
        sh.version === sh.history.length,
      "Lifecycle version and status must match history.",
    );
    ensure(
      ["Shipped", "Delivered"].includes(sh.status)
        ? sh.tracking.length > 0
        : sh.tracking === "",
      "Tracking is required only after local shipment dispatch.",
    );
    ensure(
      s.subscribers.some((u) => u.id === sh.quote.subscriberId) &&
        s.plans.some((p) => p.id === sh.quote.planId) &&
        sh.quote.lines.every((l) => s.items.some((i) => i.id === l.itemId)),
      "Shipment references a missing record.",
    );
  }
  unique(s.shipments.map((sh) => sh.id));
  unique(s.shipments.map((sh) => sh.requestKey));
  unique(s.shipments.map((sh) => `${sh.quote.subscriberId}|${sh.cycle}`));
  return s;
}
export function decode(raw) {
  ensure(
    new TextEncoder().encode(raw).length <= 4 * 1024 * 1024,
    "Workspace exceeds 4 MiB.",
  );
  return validateState(JSON.parse(raw));
}
export function encode(s) {
  validateState(s);
  const raw = JSON.stringify(s);
  decode(raw);
  return raw;
}
export function parseMoney(value) {
  ensure(
    /^(0|[1-9]\d{0,5})(\.\d{1,2})?$/.test(value),
    "Money needs dollars and at most two decimal places.",
  );
  const [d, c = ""] = value.split(".");
  const cents = Number(d) * 100 + Number(c.padEnd(2, "0"));
  integer(cents, 0, 10000000);
  return cents;
}
export const money = (cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export function eligible(item, subscriber) {
  return (
    item.active &&
    item.stock > 0 &&
    !item.tags.some((t) =>
      subscriber.blockedTags.some((b) => b.toLowerCase() === t.toLowerCase()),
    )
  );
}
export function recommendations(s, subscriberId) {
  const subscriber = s.subscribers.find((u) => u.id === subscriberId);
  ensure(subscriber, "Subscriber does not exist.");
  return s.items
    .filter((i) => eligible(i, subscriber))
    .map((item) => ({
      item,
      score:
        item.tags.filter((t) =>
          subscriber.preferredTags.some(
            (p) => p.toLowerCase() === t.toLowerCase(),
          ),
        ).length *
          10 +
        (subscriber.ratings.find((r) => r.itemId === item.id)?.rating ?? 3) * 5,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.item.id < b.item.id ? -1 : a.item.id > b.item.id ? 1 : 0),
    );
}
export function quoteBox(s, subscriberId, itemIds) {
  array(itemIds, 20);
  unique(itemIds);
  const u = s.subscribers.find((u) => u.id === subscriberId);
  ensure(
    u && u.status === "Active",
    "Only an active subscriber can reserve a box.",
  );
  const p = s.plans.find((p) => p.id === u.planId);
  ensure(p?.active, "The subscription plan is unavailable.");
  ensure(
    itemIds.length === p.itemCount,
    `Choose exactly ${p.itemCount} distinct items.`,
  );
  const lines = itemIds
    .map((itemId) => {
      const i = s.items.find((i) => i.id === itemId);
      ensure(
        i && eligible(i, u),
        "A selected item is unavailable, out of stock, or excluded by preferences.",
      );
      return {
        itemId: i.id,
        version: i.version,
        name: i.name,
        category: i.category,
        costCents: i.costCents,
        retailCents: i.retailCents,
      };
    })
    .sort((a, b) => (a.itemId < b.itemId ? -1 : a.itemId > b.itemId ? 1 : 0));
  const q = {
    subscriberId: u.id,
    subscriberVersion: u.version,
    subscriberName: u.name,
    destination: u.destination,
    planId: p.id,
    planVersion: p.version,
    planName: p.name,
    priceCents: p.priceCents,
    itemCount: p.itemCount,
    lines,
    costCents: lines.reduce((sum, l) => sum + l.costCents, 0),
    retailCents: lines.reduce((sum, l) => sum + l.retailCents, 0),
  };
  validateQuote(q);
  return q;
}
export function replay(s, c) {
  if (c.type !== "reserve") return;
  const old = s.shipments.find((sh) => sh.requestKey === c.requestKey);
  if (old)
    ensure(
      old.fingerprint === fingerprint(c.cycle, c.quote),
      "Request key was already used with different reservation details.",
    );
  return old;
}
const definitions = {
  item: { key: "items", validate: validateItem },
  plan: { key: "plans", validate: validatePlan },
  subscriber: { key: "subscribers", validate: validateSubscriber },
};
export function reduce(s, c) {
  validateState(s);
  if (replay(s, c)) return s;
  const n = structuredClone(s);
  n.revision++;
  const [kind, action] = c.type.split(".");
  if (Object.hasOwn(definitions, kind) && action === "save") {
    const def = definitions[kind];
    def.validate(c.record);
    const list = n[def.key];
    const index = list.findIndex((v) => v.id === c.record.id);
    ensure(
      c.expected === null
        ? index === -1
        : index !== -1 && list[index].version === c.expected,
      "Record changed; reload and review the draft.",
    );
    if (
      kind === "subscriber" &&
      (index === -1 || list[index].planId !== c.record.planId)
    )
      ensure(
        n.plans.some((p) => p.id === c.record.planId && p.active),
        "Choose an active plan.",
      );
    const record = {
      ...structuredClone(c.record),
      version: c.expected === null ? 1 : c.expected + 1,
    };
    if (index === -1) list.push(record);
    else list[index] = record;
  } else if (Object.hasOwn(definitions, kind) && action === "delete") {
    const def = definitions[kind];
    const value = n[def.key].find((v) => v.id === c.id);
    ensure(
      value && value.version === c.expected,
      "Record changed; reload first.",
    );
    if (kind === "item")
      ensure(
        !n.shipments.some((sh) =>
          sh.quote.lines.some((l) => l.itemId === c.id),
        ) &&
          !n.subscribers.some((u) => u.ratings.some((r) => r.itemId === c.id)),
        "Item has shipment or rating history. Archive it instead.",
      );
    if (kind === "plan")
      ensure(
        !n.subscribers.some((u) => u.planId === c.id) &&
          !n.shipments.some((sh) => sh.quote.planId === c.id),
        "Plan is referenced. Archive it instead.",
      );
    if (kind === "subscriber")
      ensure(
        !n.shipments.some((sh) => sh.quote.subscriberId === c.id),
        "Subscriber has shipment history. Change its status instead.",
      );
    n[def.key] = n[def.key].filter((v) => v.id !== c.id);
  } else if (c.type === "reserve") {
    month(c.cycle);
    validateQuote(c.quote);
    instant(c.at);
    ensure(
      !s.shipments.some(
        (sh) =>
          sh.quote.subscriberId === c.quote.subscriberId &&
          sh.cycle === c.cycle,
      ),
      "This subscriber cycle already has a reservation, including cancelled history.",
    );
    const current = quoteBox(
      s,
      c.quote.subscriberId,
      c.quote.lines.map((l) => l.itemId),
    );
    ensure(
      fingerprint(c.cycle, current) === fingerprint(c.cycle, c.quote),
      "Box details changed; review a fresh quote.",
    );
    for (const l of c.quote.lines) {
      const item = n.items.find((i) => i.id === l.itemId);
      item.stock--;
      item.version++;
    }
    n.shipments.unshift({
      id: c.id,
      version: 1,
      requestKey: c.requestKey,
      fingerprint: fingerprint(c.cycle, c.quote),
      cycle: c.cycle,
      quote: structuredClone(c.quote),
      status: "Reserved",
      tracking: "",
      createdAt: c.at,
      history: [{ status: "Reserved", at: c.at }],
    });
  } else if (c.type === "shipment.transition") {
    const sh = n.shipments.find((sh) => sh.id === c.id);
    ensure(sh && sh.version === c.expected, "Shipment changed; reload first.");
    ensure(
      transitions[sh.status].includes(c.status),
      "This shipment transition is not allowed.",
    );
    instant(c.at);
    ensure(
      c.at >= sh.history.at(-1).at,
      "Transition time precedes accepted history.",
    );
    if (c.status === "Shipped") {
      text(c.tracking, 120);
      sh.tracking = c.tracking;
    } else
      ensure(
        c.tracking === undefined || c.tracking === sh.tracking,
        "Tracking cannot be changed in this transition.",
      );
    if (c.status === "Cancelled")
      for (const l of sh.quote.lines) {
        const item = n.items.find((i) => i.id === l.itemId);
        item.stock++;
        item.version++;
      }
    sh.status = c.status;
    sh.version++;
    sh.history.push({ status: c.status, at: c.at });
  } else throw new Error("Unknown command.");
  encode(n);
  return n;
}
