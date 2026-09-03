# Architecture

## Decision Log
- **Next.js App Router** over separate backend: keeps modularity, allows API routes later. API routes unused in MVP; persistence is client-side to satisfy "Local First".
- **Zustand** over Redux: minimal, no boilerplate, ideal for canvas state. Persisted via `localStorage` key `cc_canvas_v1`.
- **@xyflow/react** (React Flow) for infinite canvas: proven, handles 10k+ nodes, supports custom nodeTypes.
- **SQLite/Prisma deferred**: spec allows SQLite. For MVP, localStorage fulfills "local persistence" and avoids native deps on Windows. Migration path: move store to Prisma SQLite with `Project { nodes Json, edges Json }` — store already serializes to JSON.
- **Tailwind + minimal UI primitives** over shadcn install: avoids CLI dependency, keeps build fast. Easy to swap to shadcn later.

## Data Flow
```
User → Canvas (React Flow)
     → Zustand store (nodes, edges, projectName, history)
     → localStorage (autosave 2.5s) → JSON export
     ↘ AI Registry → Provider (Mock | OpenAI-Compatible | Local)
                    → generationHistory (in store)
```

## Node Model
```ts
Node {
  id: string
  type: NodeType
  position: {x,y}
  data: {
    title, type, status: idle|processing|completed|failed,
    data: <type-specific payload>,
    version: number,
    versions: {id,label,data,createdAt}[],
    inputs, outputs
  }
}
```
Edges: `{ id, source, target, sourceHandle, targetHandle }`

## AI Abstraction
```ts
interface AIProvider {
  generateText({prompt, system, temperature}) => {text, model}
  generateImage?({prompt, ...}) => {url}
  analyzeImage?()
  critiqueDesign?()
}
```
Registry reads `cc_provider_config` from localStorage. Providers never hardcode keys.

## Canvas UX
- XYFlow handles: left=target, right=source
- Keyboard: Ctrl+Z undo, Ctrl+Shift+Z redo, Delete, Ctrl+D duplicate, Ctrl+S save, Ctrl+K palette
- History stack: past/future arrays capped at 50
- Autosave: setInterval 2500ms + beforeunload + manual Save button

## File Handling
Images: URL.createObjectURL for local files, or external URLs. Stored as string in node data. For production: move to `public/uploads` or Tauri fs.

## Packaging Future
All persistence is abstracted behind `store.save/load`. Replace with Tauri `fs` or Electron `ipc` + SQLite without changing nodes.
