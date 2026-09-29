import { decode, encode, reduce, replay } from "./model.js";
export const STORAGE_KEY = "parcelpilot-workspace-v1";
export function repository(storage, lock, initial) {
  function load() {
    const raw = storage.getItem(STORAGE_KEY);
    return {
      raw,
      state: raw === null ? structuredClone(initial) : decode(raw),
    };
  }
  async function commit(base, command) {
    return lock(() => {
      const current = load();
      if (replay(current.state, command)) return current;
      if (current.raw !== base.raw)
        throw new Error(
          "Workspace changed in another tab. Export your draft and reload before saving.",
        );
      const state = reduce(current.state, command);
      const raw = encode(state);
      storage.setItem(STORAGE_KEY, raw);
      return { state, raw };
    });
  }
  async function restore(baseRaw, raw) {
    const imported = decode(raw);
    return lock(() => {
      const currentRaw = storage.getItem(STORAGE_KEY);
      if (currentRaw !== baseRaw)
        throw new Error(
          "Workspace changed while reviewing the backup. Reload first.",
        );
      let revision = 0;
      try {
        revision = currentRaw === null ? 0 : decode(currentRaw).revision;
      } catch {}
      const state = {
        ...structuredClone(imported),
        revision: Math.max(revision, imported.revision) + 1,
      };
      const encoded = encode(state);
      storage.setItem(STORAGE_KEY, encoded);
      return { state, raw: encoded };
    });
  }
  return { load, commit, restore };
}
export function browserLock(work) {
  if (!navigator.locks)
    return Promise.reject(
      new Error(
        "Safe writes require Web Locks on a supported localhost browser.",
      ),
    );
  return navigator.locks.request(STORAGE_KEY, work);
}
