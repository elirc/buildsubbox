# Command Cheatsheet

| Task | Command | Status | Evidence |
| --- | --- | --- | --- |
| Install dependencies | `npm install` | Verified | `package-lock.json`, [`package.json`](../../../package.json#L15-L18) |
| Start dev server | `npm run dev` | Verified during app build | [`package.json:7`](../../../package.json#L7-L7) |
| Build production bundle | `npm run build` | Verified | [`package.json:8`](../../../package.json#L8-L8) |
| Preview production bundle | `npm run preview` | Inferred | [`package.json:9`](../../../package.json#L9-L9) |
| Lint | none | Missing | [`package.json:6-10`](../../../package.json#L6-L10) |
| Test | none | Missing | [`package.json:6-10`](../../../package.json#L6-L10) |
| Typecheck | none | Missing | No TypeScript config currently present. |
| Format | none | Missing | No formatting script found. |
| Database migrations | none | Not applicable | No database files found. |
| Docker | none | Not applicable | No Dockerfile/compose found. |
| Codegen | none | Not applicable | No codegen config found. |
| Docs | manual Markdown | Present | `docs/upskill/` |

Future inferred commands after test tooling:

```bash
npm test
npm run lint
npm run format
npm run test:e2e
```
