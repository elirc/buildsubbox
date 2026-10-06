# 08. Companion: acceptance in SQL and HTTP

[Course index](README.md) · the worked target for practice exercise 5

The browser model accepts a box by running `reduce` under a Web Lock and replaying by `requestKey`. On a server the same three ideas become a constraint, a header and a conditional update. Express + SQLite (`node:sqlite`), one route.

**Status: design sketch.** This code is not in the repo and has not been executed. Helpers such as `validateQuoteBody`, `buildReceipt`, `insertLines` and the `req.user` set by an auth middleware are assumed. It also omits the eligibility checks `quoteBox` performs (active subscriber and plan, exact item count, excluded tags) — a real route must run them inside the transaction.

## Schema

```sql
CREATE TABLE items (id TEXT PRIMARY KEY, stock INTEGER NOT NULL CHECK (stock >= 0), version INTEGER NOT NULL);
CREATE TABLE reservations (
  id TEXT PRIMARY KEY, subscriber_id TEXT NOT NULL, cycle TEXT NOT NULL,
  request_key TEXT NOT NULL, fingerprint TEXT NOT NULL, receipt TEXT NOT NULL,
  UNIQUE (subscriber_id, cycle),          -- one box per subscriber per cycle (the second identity)
  UNIQUE (request_key)                    -- one receipt per attempt (the first identity), global as in validateState
);
CREATE TABLE reservation_lines (reservation_id TEXT, item_id TEXT, name TEXT, retail_cents INTEGER);  -- the snapshot
```

## Route

```js
app.post('/reservations', (req, res) => {
  const key = req.get('idempotency-key'); if (!key) return res.status(428).json({ error: 'Idempotency-Key required' });
  const q = validateQuoteBody(req.body);                       // the same bounds validateState applies
  const fp = fingerprint(q.cycle, q);
  const tx = db.prepare('BEGIN IMMEDIATE'); tx.run();          // the Web Lock becomes the write transaction
  try {
    const prior = db.prepare('SELECT fingerprint, receipt FROM reservations WHERE request_key = ?').get(key);
    if (prior) { db.exec('ROLLBACK'); return prior.fingerprint === fp ? res.json(JSON.parse(prior.receipt)) : res.status(409).json({ error: 'Same key, different box' }); }
    for (const itemId of q.itemIds) {
      const r = db.prepare('UPDATE items SET stock = stock - 1, version = version + 1 WHERE id = ? AND stock > 0').run(itemId);
      if (r.changes === 0) { db.exec('ROLLBACK'); return res.status(409).json({ error: `Out of stock: ${itemId}` }); }
    }
    const receipt = buildReceipt(q);                           // lines are copied now: the snapshot
    db.prepare('INSERT INTO reservations VALUES (?, ?, ?, ?, ?, ?)').run(receipt.id, q.subscriberId, q.cycle, key, fp, JSON.stringify(receipt));  // the operator (req.user) is not the subscriber
    insertLines(receipt);
    db.exec('COMMIT'); res.status(201).json(receipt);
  } catch (error) {
    db.exec('ROLLBACK');
    if (String(error.message).includes('UNIQUE') && String(error.message).includes('cycle')) return res.status(409).json({ error: 'This subscriber already has a box this cycle' });
    throw error;
  }
});
```

## Line by line against the browser model

| browser (`src/model.js`) | server |
|---|---|
| `replay(s, c)` finds the shipment by `requestKey` and returns it | `SELECT ... WHERE request_key = ?` before any write; `Idempotency-Key` header |
| `fingerprint(cycle, q)` refuses a different box under the same key | stored `fingerprint` column compared on replay: equal returns the receipt, different is 409 |
| `reduce` checks available stock and decrements | `UPDATE items SET stock = stock - 1 WHERE id = ? AND stock > 0`; `changes === 0` is the refusal, and the `CHECK (stock >= 0)` is the last line of defense |
| one box per subscriber per cycle inside `reduce` | `UNIQUE (subscriber_id, cycle)` |
| `quoteBox` copies item facts into lines | `reservation_lines` written in the same transaction |
| Web Lock around the whole reduce | `BEGIN IMMEDIATE ... COMMIT` |

## Tests

Replay with the same key (201 then 200, one row); same key different body (409); two subscribers racing for the last unit (exactly one 201, stock 0, no negative); two requests for the same subscriber and cycle with different keys (one 201, one 409 from the unique constraint); a body that fails validation (400, nothing written).
