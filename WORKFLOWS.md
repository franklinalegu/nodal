# Workflows

## Templates
Save a graph as workflow JSON via Export → project JSON. Reimport by loading JSON.

Example: Brand Identity Workflow
```
Brief → Research → Audience → Strategy → Creative Direction → Moodboard → Color → Typography → Logo → Applications → Presentation
```

Social Campaign:
```
Brief → Strategy → Copy → Image → Layout → Variations → Export
```

## Execution
MVP: workflows are declarative (node graph). User connects nodes manually. AI nodes pull context from upstream nodes via inspector.

Future automation: `Trigger → AI Action → Condition → Next Node` engine. Store already has `generationHistory` and `creativeDecisions` can be added.

## Command Palette
Ctrl+K → Create node, Search, Export, Save.

## Export
Top Bar → Export → downloads `projectname.json` with `{ projectName, nodes, edges, generationHistory, exportedAt }`.
Per-node PNG/PDF: future — use `html2canvas` for canvas area or `react-to-print`.

## Project Context Engine (Future)
Current: nodes read each other's data manually. Planned:
```ts
projectContext = { brief, strategy, audience, brand, decisions, assets }
```
AI prompts auto-inject context.
