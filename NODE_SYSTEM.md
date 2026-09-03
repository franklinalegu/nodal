# Node System

## Definition
Each node: `id, type, title, position, data, status, version, versions[]`. Serializable to JSON.

Category → Types:
- AI: aiAssistant, imageGen, copy, critique
- Creative: brief, research, creativeDirection, moodboard, audience
- Brand: strategy, audience, colorSystem, typography, logoConcept
- Design: frame, layout
- Production: social, presentation, mockup
- Output: export

## Node Registry
- `NODE_META` in `src/types/nodes.ts` → label, color, category.
- `nodeTypesMap` in `src/components/nodes/NodeWrappers.tsx` → React component per type.

## Connections
- XYFlow handles: `target:left, source:right`
- Rules: 1→N, N→1, branching allowed. No validation yet; add in `onConnect` if needed (e.g., brief→strategy only).
- Visual: bezier path, selected = white.

## Adding a Node Type
1. Add to `NodeType` union and `NODE_META`.
2. Add renderer in `NodeWrappers.tsx` and to `nodeTypesMap`.
3. Add default data in `store.useCanvasStore.addNode`.
4. Add inspector form in `RightPanel.NodeForm`.

## Versioning / Branching
- `version`, `versions[]` per node. "Branch" button clones current data as new version. Non-destructive — original preserved.
- Future: compare view, restore.

## Persistence
Nodes + edges saved as JSON in `cc_canvas_v1`. Demo project in `src/lib/demoProject.ts` loads if empty.
