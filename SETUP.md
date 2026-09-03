# Setup — Windows First

## Requirements
- Node 18+ (tested 24.19.0)
- npm 10+ or pnpm 10

## Install
```bash
cd creative-canvas
npm install
```

## Dev
```bash
npm run dev    # http://localhost:3000
```

## Build / Production
```bash
npm run build
npm run start  # http://localhost:3000
```

## Reset / Seed
- Reset: Clear localStorage key `cc_canvas_v1` and `cc_provider_config` in DevTools → Application → Local Storage, or run `localStorage.clear()` in console then reload.
- Demo data: auto-loads on first visit if `cc_canvas_v1` missing (see `src/lib/demoProject.ts`).

## Database (Future)
MVP uses localStorage. To enable SQLite:
```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
# add models: Project, Node, Edge, Asset, Brand, Generation, Workflow
npx prisma migrate dev
```
Store migration: replace `store.save/load` with fetch to `/api/projects`.

## GPU / API Keys
Not required. Mock provider generates deterministic offline outputs. For live AI, configure in Right Panel → AI Provider.

## Troubleshooting
- Port in use: `npm run dev -- --port 3001`
- Build fails on types: `next.config.mjs` has `typescript.ignoreBuildErrors: true` for MVP velocity; fix types before production.
- Node 24 warnings: update `next` to 15 when ready (`npm install next@latest`).
