import test from "node:test";
import assert from "node:assert/strict";
import { initial } from "../src/initial.js";
import {
  validateState,
  encode,
  decode,
  reduce,
  quoteBox,
  parseMoney,
  recommendations,
  eligible,
} from "../src/model.js";
import { repository, STORAGE_KEY } from "../src/repository.js";
const fresh = () => structuredClone(initial);
const ids = ["itm_101", "itm_102", "itm_104", "itm_105", "itm_106"];
const reserve = (s = fresh(), patch = {}) => ({
  type: "reserve",
  id: "ship-one",
  requestKey: "request-one",
  cycle: "2026-09",
  quote: quoteBox(s, "sub_4289", ids),
  at: "2026-09-09T12:00:00.000Z",
  ...patch,
});
const item = () => ({
  ...initial.items[0],
  id: "new-item",
  name: "Learning candle",
  tags: [],
  stock: 10,
});
const save = (kind, record, expected = null) => ({
  type: `${kind}.save`,
  record,
  expected,
});
function fixture(raw = null) {
  const data = new Map(raw === null ? [] : [[STORAGE_KEY, raw]]);
  let tail = Promise.resolve();
  const lock = (fn) => {
    const result = tail.then(fn);
    tail = result.catch(() => {});
    return result;
  };
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  return { data, storage, lock, repo: repository(storage, lock, fresh()) };
}
test("seed round trip has no invented shipments", () => {
  assert.deepEqual(decode(encode(fresh())), fresh());
  assert.equal(initial.shipments.length, 0);
});
test("integer-cent parsing rejects extra precision and exponent notation", () => {
  assert.equal(parseMoney("12.35"), 1235);
  for (const s of ["1.001", "1e2", "-1", "01", "100000.01", " 2"])
    assert.throws(() => parseMoney(s));
});
test("item create edit and delete are immutable versioned CRUD", () => {
  const original = fresh();
  let s = reduce(original, save("item", item()));
  assert.equal(original.items.length, 9);
  s = reduce(s, save("item", { ...s.items.at(-1), stock: 20 }, 1));
  assert.equal(s.items.at(-1).version, 2);
  s = reduce(s, { type: "item.delete", id: "new-item", expected: 2 });
  assert.equal(s.items.length, 9);
  assert.equal(s.revision, 3);
});
test("invalid item bounds and case-folded duplicate tags fail", () => {
  for (const patch of [
    { stock: -1 },
    { stock: 1.5 },
    { stock: 1000001 },
    { costCents: 1.5 },
    { name: "" },
    { tags: ["Citrus", "citrus"] },
    { segment: "unknown" },
  ])
    assert.throws(() => reduce(fresh(), save("item", { ...item(), ...patch })));
});
test("stale item version does not apply", () =>
  assert.throws(
    () => reduce(fresh(), save("item", initial.items[0], 2)),
    /changed/,
  ));
test("plans support create edit and unused delete", () => {
  let s = reduce(
    fresh(),
    save("plan", {
      id: "mini",
      version: 1,
      name: "Mini",
      priceCents: 1200,
      itemCount: 1,
      active: true,
    }),
  );
  s = reduce(s, save("plan", { ...s.plans.at(-1), priceCents: 1300 }, 1));
  assert.equal(s.plans.at(-1).version, 2);
  s = reduce(s, { type: "plan.delete", id: "mini", expected: 2 });
  assert.equal(s.plans.length, 3);
});
test("referenced plans cannot be deleted but can be archived", () => {
  assert.throws(
    () =>
      reduce(fresh(), { type: "plan.delete", id: "signature", expected: 1 }),
    /referenced/,
  );
  const s = reduce(
    fresh(),
    save("plan", { ...initial.plans[1], active: false }, 1),
  );
  assert.throws(() => quoteBox(s, "sub_4289", ids), /unavailable/);
});
test("subscriber CRUD preserves normalized unique email policy", () => {
  const u = {
    ...initial.subscribers[0],
    id: "sub-two",
    name: "Other learner",
    email: "other@example.com",
    ratings: [],
  };
  let s = reduce(fresh(), save("subscriber", u));
  s = reduce(s, save("subscriber", { ...u, status: "Paused" }, 1));
  assert.equal(s.subscribers[1].version, 2);
  s = reduce(s, { type: "subscriber.delete", id: u.id, expected: 2 });
  assert.equal(s.subscribers.length, 1);
  assert.throws(
    () =>
      reduce(
        fresh(),
        save("subscriber", { ...u, email: initial.subscribers[0].email }),
      ),
    /Duplicate/,
  );
});
test("invalid subscriber references email and rating ranges fail", () => {
  for (const patch of [
    { planId: "missing" },
    { email: "INVALID" },
    { email: "Mixed@Example.com" },
    { ratings: [{ itemId: "missing", rating: 3 }] },
    { ratings: [{ itemId: "itm_101", rating: 6 }] },
  ])
    assert.throws(() =>
      reduce(
        fresh(),
        save("subscriber", { ...initial.subscribers[0], ...patch }, 1),
      ),
    );
});
test("new subscribers cannot choose an archived plan", () => {
  const s = fresh();
  s.plans[1].active = false;
  assert.throws(
    () =>
      reduce(
        s,
        save("subscriber", {
          ...s.subscribers[0],
          id: "new-sub",
          email: "new@example.com",
        }),
      ),
    /active plan/,
  );
});
test("ratings support update removal and prevent dangling item deletion", () => {
  let s = fresh();
  assert.throws(
    () => reduce(s, { type: "item.delete", id: "itm_101", expected: 1 }),
    /rating history/,
  );
  s = reduce(s, save("subscriber", { ...s.subscribers[0], ratings: [] }, 1));
  s = reduce(s, { type: "item.delete", id: "itm_101", expected: 1 });
  assert.equal(s.items.length, 8);
});
test("excluded tags are hard filters rather than score penalties", () => {
  const s = fresh();
  s.subscribers[0].blockedTags = ["cItRuS"];
  assert.equal(eligible(s.items[0], s.subscribers[0]), false);
  assert(!recommendations(s, "sub_4289").some((r) => r.item.id === "itm_101"));
  assert.throws(() => quoteBox(s, "sub_4289", ids), /excluded/);
});
test("recommendations exclude unavailable items and use deterministic ties", () => {
  const s = fresh();
  s.items[0].stock = 0;
  s.items[1].active = false;
  s.subscribers[0].preferredTags = [];
  s.subscribers[0].ratings = [];
  const results = recommendations(s, "sub_4289");
  assert(!results.some((r) => ["itm_101", "itm_102"].includes(r.item.id)));
  assert.deepEqual(
    results.map((r) => r.item.id),
    results.map((r) => r.item.id).sort(),
  );
});
test("box quote requires exact distinct plan count", () => {
  for (const selected of [
    [],
    ids.slice(0, 4),
    [...ids, "itm_103"],
    [ids[0], ids[0], ...ids.slice(2)],
  ])
    assert.throws(() => quoteBox(fresh(), "sub_4289", selected));
});
test("paused and cancelled subscribers cannot reserve", () => {
  for (const status of ["Paused", "Cancelled"]) {
    const s = fresh();
    s.subscribers[0].status = status;
    assert.throws(() => quoteBox(s, "sub_4289", ids), /active subscriber/);
  }
});
test("reservation subtracts one unit per selected SKU and preserves source", () => {
  const s = fresh(),
    command = reserve(s),
    next = reduce(s, command);
  assert.equal(next.shipments.length, 1);
  for (const id of ids) {
    assert.equal(
      next.items.find((i) => i.id === id).stock,
      s.items.find((i) => i.id === id).stock - 1,
    );
    assert.equal(next.items.find((i) => i.id === id).version, 2);
  }
  assert.equal(next.items.find((i) => i.id === "itm_103").stock, 95);
  assert.equal(s.shipments.length, 0);
});
test("out of stock line rejects whole reservation without partial decrement", () => {
  const s = fresh(),
    command = reserve(s);
  s.items.find((i) => i.id === "itm_106").stock = 0;
  const before = encode(s);
  assert.throws(() => reduce(s, command), /unavailable/);
  assert.equal(encode(s), before);
});
test("price plan and subscriber changes invalidate accepted quote", () => {
  for (const [kind, record] of [
    ["item", { ...initial.items[0], costCents: 999 }],
    ["plan", { ...initial.plans[1], priceCents: 5000 }],
    ["subscriber", { ...initial.subscribers[0], destination: "New city" }],
  ]) {
    const c = reserve();
    const s = reduce(fresh(), save(kind, record, 1));
    assert.throws(() => reduce(s, c), /details changed/);
  }
});
test("same request replays without reserving stock twice", () => {
  const c = reserve(),
    s = reduce(fresh(), c);
  assert.equal(reduce(s, c), s);
  assert.equal(s.items[0].stock, 419);
});
test("changed cycle under an accepted key fails", () => {
  const c = reserve(),
    s = reduce(fresh(), c);
  assert.throws(
    () => reduce(s, { ...c, cycle: "2026-10" }),
    /different reservation/,
  );
});
test("new key cannot duplicate subscriber cycle", () => {
  const c = reserve(),
    s = reduce(fresh(), c);
  const second = reserve(s, { id: "ship-two", requestKey: "request-two" });
  assert.throws(() => reduce(s, second), /already has/);
});
test("cancel restores once retains history and keeps cycle uniqueness", () => {
  const c = reserve();
  let s = reduce(fresh(), c);
  s = reduce(s, {
    type: "shipment.transition",
    id: c.id,
    expected: 1,
    status: "Cancelled",
    at: "2026-09-09T13:00:00.000Z",
  });
  assert.equal(s.items[0].stock, 420);
  assert.equal(s.shipments[0].history.length, 2);
  assert.equal(reduce(s, c), s);
  assert.throws(() =>
    reduce(s, {
      type: "shipment.transition",
      id: c.id,
      expected: 2,
      status: "Cancelled",
      at: "2026-09-09T14:00:00.000Z",
    }),
  );
  assert.throws(
    () => reduce(s, reserve(s, { id: "another", requestKey: "another" })),
    /already has/,
  );
});
test("pack ship deliver enforces tracking and terminal states", () => {
  let s = reduce(fresh(), reserve());
  s = reduce(s, {
    type: "shipment.transition",
    id: "ship-one",
    expected: 1,
    status: "Packed",
    at: "2026-09-09T13:00:00.000Z",
  });
  assert.throws(() =>
    reduce(s, {
      type: "shipment.transition",
      id: "ship-one",
      expected: 2,
      status: "Shipped",
      tracking: "",
      at: "2026-09-09T14:00:00.000Z",
    }),
  );
  s = reduce(s, {
    type: "shipment.transition",
    id: "ship-one",
    expected: 2,
    status: "Shipped",
    tracking: "DEMO-123",
    at: "2026-09-09T14:00:00.000Z",
  });
  assert.throws(() =>
    reduce(s, {
      type: "shipment.transition",
      id: "ship-one",
      expected: 3,
      status: "Cancelled",
      at: "2026-09-09T15:00:00.000Z",
    }),
  );
  s = reduce(s, {
    type: "shipment.transition",
    id: "ship-one",
    expected: 3,
    status: "Delivered",
    at: "2026-09-09T15:00:00.000Z",
  });
  assert.equal(s.shipments[0].version, 4);
  assert.equal(s.items[0].stock, 419);
});
test("stale transition and backward clock cannot append history", () => {
  const s = reduce(fresh(), reserve());
  for (const patch of [{ expected: 2 }, { at: "2026-09-09T11:00:00.000Z" }])
    assert.throws(() =>
      reduce(s, {
        type: "shipment.transition",
        id: "ship-one",
        expected: 1,
        status: "Packed",
        at: "2026-09-09T13:00:00.000Z",
        ...patch,
      }),
    );
});
test("snapshots survive later catalog and subscriber edits", () => {
  let s = reduce(fresh(), reserve());
  s = reduce(
    s,
    save("item", { ...s.items[0], name: "Renamed item", costCents: 9999 }, 2),
  );
  s = reduce(
    s,
    save("subscriber", { ...s.subscribers[0], name: "Renamed subscriber" }, 1),
  );
  assert.equal(s.shipments[0].quote.lines[0].name, "Citrus Cloud Cleanser");
  assert.equal(s.shipments[0].quote.subscriberName, "Maya Chen");
  validateState(s);
});
test("shipment history blocks item subscriber and plan deletion", () => {
  const s = reduce(fresh(), reserve());
  for (const [kind, id, expected] of [
    ["item", "itm_104", 2],
    ["subscriber", "sub_4289", 1],
    ["plan", "signature", 1],
  ])
    assert.throws(() => reduce(s, { type: `${kind}.delete`, id, expected }));
});
test("bad cycle timestamp schema and extra fields are rejected", () => {
  for (const patch of [
    { cycle: "2026-13" },
    { cycle: "1999-12" },
    { at: "2026-02-30T12:00:00.000Z" },
  ])
    assert.throws(() => reduce(fresh(), reserve(fresh(), patch)));
  assert.throws(() => validateState({ ...fresh(), extra: true }));
  assert.throws(() => validateState({ ...fresh(), schema: 2 }));
});
test("import rejects tampered lifecycle totals fingerprints and references", () => {
  for (const mutate of [
    (s) => (s.shipments[0].history[0].status = "Delivered"),
    (s) => s.shipments[0].quote.costCents++,
    (s) => (s.shipments[0].fingerprint = "fake"),
    (s) => (s.items = s.items.filter((i) => i.id !== "itm_104")),
  ]) {
    const s = reduce(fresh(), reserve());
    mutate(s);
    assert.throws(() => validateState(s));
  }
});
test("import rejects excessive bytes and duplicate cycle receipts", () => {
  assert.throws(() => decode(" ".repeat(4 * 1024 * 1024 + 1)), /4 MiB/);
  const s = reduce(fresh(), reserve());
  s.shipments.push({ ...s.shipments[0], id: "two", requestKey: "two" });
  assert.throws(() => validateState(s), /Duplicate/);
});
test("missing data is not eagerly seeded and corrupt data is preserved", () => {
  const f = fixture();
  f.repo.load();
  assert.equal(f.data.size, 0);
  f.data.set(STORAGE_KEY, "broken");
  assert.throws(() => f.repo.load());
  assert.equal(f.data.get(STORAGE_KEY), "broken");
});
test("quota failure does not advance accepted state", async () => {
  const f = fixture(),
    base = f.repo.load();
  f.storage.setItem = () => {
    throw new Error("Quota");
  };
  await assert.rejects(f.repo.commit(base, save("item", item())), /Quota/);
  assert.equal(base.state.revision, 0);
  assert.equal(f.data.size, 0);
});
test("concurrent last-unit reservations accept one complete box", async () => {
  const s = fresh();
  s.items[0].stock = 1;
  s.subscribers.push({
    ...s.subscribers[0],
    id: "other",
    email: "other@example.com",
    ratings: [],
  });
  const f = fixture(encode(s));
  const a = f.repo.load(),
    b = f.repo.load();
  const ca = reserve(s),
    cb = reserve(s, {
      id: "ship-two",
      requestKey: "request-two",
      quote: quoteBox(s, "other", ids),
    });
  const results = await Promise.allSettled([
    f.repo.commit(a, ca),
    f.repo.commit(b, cb),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const after = f.repo.load().state;
  assert.equal(after.items[0].stock, 0);
  assert.equal(after.shipments.length, 1);
  assert.equal(after.items[1].stock, 259);
});
test("write accepted before acknowledgement fails is safely replayed", async () => {
  const f = fixture(),
    base = f.repo.load(),
    command = reserve();
  const original = f.storage.setItem;
  let once = true;
  f.storage.setItem = (k, v) => {
    original(k, v);
    if (once) {
      once = false;
      throw new Error("Lost acknowledgement");
    }
  };
  await assert.rejects(f.repo.commit(base, command));
  const next = await f.repo.commit(base, command);
  assert.equal(next.state.shipments.length, 1);
  assert.equal(next.state.items[0].stock, 419);
});
test("restore requires reviewed baseline and invalidates older editors", async () => {
  const f = fixture();
  const base = f.repo.load();
  await f.repo.restore(null, encode(fresh()));
  await assert.rejects(f.repo.commit(base, save("item", item())), /changed/);
  await assert.rejects(f.repo.restore(null, encode(fresh())), /changed/);
});
test("explicit corrupt-data replacement preserves failure until confirmation", async () => {
  const f = fixture("bad");
  await assert.rejects(f.repo.restore(null, encode(fresh())));
  assert.equal(f.data.get(STORAGE_KEY), "bad");
  const next = await f.repo.restore("bad", encode(fresh()));
  assert.equal(next.state.revision, 1);
});
test("unavailable cooperative lock rejects without storage effects", async () => {
  const f = fixture();
  const r = repository(
    f.storage,
    () => Promise.reject(new Error("No lock")),
    fresh(),
  );
  await assert.rejects(r.commit(r.load(), save("item", item())), /No lock/);
  assert.equal(f.data.size, 0);
});
