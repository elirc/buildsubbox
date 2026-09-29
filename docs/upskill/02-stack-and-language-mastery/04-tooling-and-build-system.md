# Tooling And Build System

## Current Tooling

| Capability | Command | Evidence | Verified |
| --- | --- | --- | --- |
| Install | `npm install` | `package-lock.json`, [`package.json`](../../../package.json#L15-L18) | Yes |
| Dev server | `npm run dev` | [`package.json:7`](../../../package.json#L7-L7) | Yes |
| Build | `npm run build` | [`package.json:8`](../../../package.json#L8-L8) | Yes |
| Preview | `npm run preview` | [`package.json:9`](../../../package.json#L9-L9) | Inferred |
| Test | none | [`package.json:6-10`](../../../package.json#L6-L10) | Missing |
| Lint | none | [`package.json:6-10`](../../../package.json#L6-L10) | Missing |
| Format | none | [`package.json:6-10`](../../../package.json#L6-L10) | Missing |

## Build Pipeline Mental Model

1. `index.html` points to `/src/main.jsx` at [`index.html:11`](../../../index.html#L11-L11).
2. Vite follows imports from [`src/main.jsx`](../../../src/main.jsx#L1-L4).
3. The React plugin handles JSX through [`vite.config.js`](../../../vite.config.js#L1-L6).
4. CSS is imported once in [`src/main.jsx:4`](../../../src/main.jsx#L4-L4).
5. Production assets are emitted under `dist/`.

## Tooling Gaps Worth Adding

- Vitest + React Testing Library for component/domain tests.
- ESLint for React hooks and accessibility rules.
- Prettier or Biome for formatting.
- TypeScript or JSDoc for object contracts.
- Playwright for key UI flows.

Drill: propose the smallest tooling PR. Strong answer chooses one tool, one script, one sample test/check, and explains why the blast radius is small.
