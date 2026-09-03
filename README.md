# NODAL — Creative intelligence, connected.

Private, local-first node-based generative AI studio for a single professional creative.

**Canvas is the product. AI is the intelligence layer.**

> Turn creative work from a collection of disconnected files into a connected visual workflow.

![NODAL](https://img.shields.io/badge/NODAL-v0.1.0-white) ![Stack](https://img.shields.io/badge/Next.js-14-black) ![Local First](https://img.shields.io/badge/100%25_local-%E2%9C%93-emerald) ![Private](https://img.shields.io/badge/private-UNLICENSED-zinc)

### Quick Start (Windows)

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run start
```

No API key required. Mock provider works offline.

### Features (MVP)

- Infinite canvas (XYFlow), pan/zoom, minimap, controls
- 19 node types: Brief, Research, Audience, Strategy, Creative Direction, Moodboard, Color System, Typography, Logo Concept, Image Generator, Copy, Layout, Social Pack, Presentation, Mockup, Critique, Export, Frame, AI Director
- Node create / move / connect / duplicate / delete / branch
- Undo / Redo (Ctrl+Z / Ctrl+Shift+Z), Copy/Duplicate (Ctrl+D), Save (Ctrl+S)
- Command Palette (Ctrl+K)
- Project persistence: localStorage + autosave every 2.5s + recovery on reload
- File upload (drag images into Moodboard, or use URL)
- Brand system (colors, typography) persisted per project
- AI Provider abstraction: Mock (offline) + OpenAI-Compatible + Local
- Generation history, versioning, branching (non-destructive)
- JSON project export

### Demo Project
On first load you get **AUREUM — Premium Fintech Brand** with a fully connected workflow:
Brief → Research → Audience → Strategy → Creative Direction → Moodboard → Color → Typography → Logo → Image → Copy → Social → Presentation → Export

Inspect any node → edit in Right Panel → Generate via AI.

### Project Structure
```
/src/app         # Next.js App Router
/src/components  # shell (TopBar, LeftSidebar, RightPanel, BottomBar, CommandPalette)
                # canvas (React Flow wrapper)
                # nodes (19 node renderers)
                # ui (Button, Input)
/src/store       # Zustand canvas store + persistence (via src/lib/storage)
/src/types       # NodeType, BrandSystem, GenerationRecord
/src/lib         # utils, demoProject, ai/providers, ai/registry, storage/*
/prisma          # SQLite schema (used when Tauri active)
/src-tauri       # Tauri config + desktop bundle target
```

See `ARCHITECTURE.md`, `SETUP.md`, `AI_PROVIDERS.md`, `NODE_SYSTEM.md`, `WORKFLOWS.md`, `PRIVACY.md`, `src-tauri/README_TAURI.md`.

### 100% Local — Private Use Only
No auth, no billing, no telemetry, no cloud sync. See `PRIVACY.md` + `LICENSE` (UNLICENSED). Spec §40-41.

### Storage Strategy
- **Now:** `localStorage` via `src/lib/storage/index.ts:1` (autosave 2.5s, dataURL images). No install.
- **When >5 MB:** enable Tauri — `src/lib/storage/tauriStorage.ts:1` → `$APPDATA/creative-canvas/projects/current.json` + SQLite `prisma/canvas.db`. One-command migration keeps localStorage as backup.

### Future
Tauri desktop, local SD/Ollama, creative agents — architecture is ready (see `ROADMAP.md`).
