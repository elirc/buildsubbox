# Trace lab: reconcile one subscriber-month

Choose a disposable browser workspace and export a complete backup before experimenting. Keep a table with action, workspace revision, item stock, item version, shipment status, shipment version, and request key. Use [the repository](../src/repository.js) and [model tests](../test/model.test.mjs) to explain each observation.

## The duplicate-policy case Lab C reproduces

Lab C asks you to resend one reservation. The model test states the expected outcome exactly: replaying the same command returns an identical state object and stock is decremented once. From `test/model.test.mjs:250-263`:

```js
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
```

## Lab A: prepare a valid box

Open Maya Chen's subscriber editor and inspect plan, preferences, excluded tags and ratings. In Box builder, choose a month with no recorded reservation. Fill from recommendations. Note the five selected item IDs from an exported operation draft and the visible product names.

Predict whether a high rating can override an excluded tag. Edit the subscriber to exclude Citrus, reload the builder selection deliberately, and observe that citrus-tagged candidates disappear. Restore the preference through a normal accepted edit before continuing. Explain why eligibility runs before ranking rather than subtracting a penalty from an otherwise selectable item.

## Lab B: accept one reservation

Record the selected items' available quantities. Reserve the box and export its shipment receipt. Each selected item should decrease by one and advance its version. Unselected items should remain unchanged. The receipt begins at Reserved with one history event, while the workspace advances once for the whole operation.

Compare the accepted plan amount, item costs, and retail values. Explain why the displayed plan-amount-minus-item-cost value is not a complete profit calculation. Identify missing costs instead of inventing a margin guarantee. The application records local facts and explicitly does not charge the subscriber.

## Lab C: retry and duplicate policy

Study the automated lost-acknowledgement case. Its storage adapter performs the actual write and then throws once. The UI retains a frozen command even though a shipment already exists. A matching retry returns that record and leaves each available count unchanged.

Now try a fresh request for the same subscriber-month. It should fail under the cycle uniqueness rule, even with a different key. Write two separate sentences explaining these protections: one about transport retries, one about business duplicates. A system may need both, and removing either changes observable behavior.

## Lab D: cancel or dispatch

For one reservation, choose cancellation before dispatch. Observe one returned unit per selected item and a retained Cancelled history entry. Try another reservation in the same month and explain its rejection. Cancellation does not erase the business slot.

For a different month, reserve and mark Packed. Shipping requires a tracking reference. After Mark shipped, cancellation is unavailable and the model rejects it even if a caller bypasses the button. Mark Delivered and inspect all four lifecycle events. The accepted tracking reference remains, but no carrier system was contacted.

## Lab E: change history's references

Rename a selected catalog item and adjust its current cost. The receipt retains its earlier name and cost. Attempt to delete the subscriber or referenced plan and observe the history safeguard. Change status or archive where appropriate instead of erasing referenced records.

Finish by opening two tabs, creating a stale editor, and exporting the rejected draft. Explain which bytes were accepted and which values only existed in memory. Write a brief review note with one verified invariant, one reproduced failure, one untested boundary, and a proposed server-side transaction. This is useful evidence of engineering reasoning beyond a successful screen recording.
