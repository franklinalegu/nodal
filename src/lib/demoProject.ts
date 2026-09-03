import { Node, Edge } from "@xyflow/react";

export const demoNodes: Node[] = [
  { id:"brief_1", type:"brief", position:{x:80,y:80}, data:{ title:"Creative Brief", type:"brief", status:"completed", version:1, versions:[], data:{ projectName:"AUREUM — Premium Fintech Brand", client:"Aureum Labs", industry:"Fintech / Private Banking", problem:"Fintech feels cheap and noisy. Founders want calm, premium money management.", objective:"Launch a premium fintech brand for founders — trusted, editorial, quiet luxury.", audience:"Founders 28-42, design-aware, time-poor", deliverables:"Brand identity, website, social, deck", constraints:"Avoid fintech clichés (piggy banks, rockets)", deadline:"Q4 2026", notes:"Reference: Aesop, Monocle, Linear" } } },
  { id:"research_1", type:"research", position:{x:480,y:80}, data:{ title:"Research", type:"research", status:"completed", version:1, versions:[], data:{ industry:"Private banking + neobanks", competitors:"Revolut (loud), Mercury (calm), Monzo (friendly)", market:"Premium fintech whitespace: $4B", keywords:"quiet, editorial, swiss, trust", references:"Linear, Stripe, Aesop" } } },
  { id:"audience_1", type:"audience", position:{x:880,y:80}, data:{ title:"Audience", type:"audience", status:"completed", version:1, versions:[], data:{ output:"Demographics: 28-42, founders/operators\nPsychographics: Skeptical of banks, buys premium tools\nNeeds: Clarity, control\nPains: Complexity" } } },
  { id:"strategy_1", type:"strategy", position:{x:80,y:380}, data:{ title:"Brand Strategy", type:"strategy", status:"completed", version:1, versions:[], data:{ output:"Positioning: The calmest money OS\nMission: Make money feel designed\nValues: Clarity, Trust, Precision\nPromise: Your money, finally calm\nPersonality: Quiet, confident, editorial" } } },
  { id:"cd_1", type:"creativeDirection", position:{x:480,y:380}, data:{ title:"Creative Direction", type:"creativeDirection", status:"completed", version:1, versions:[], data:{ directions:[{name:"Quiet Luxury", concept:"Editorial minimalism, Swiss grids"},{name:"Neo Bauhaus", concept:"Geometric, bold"},{name:"Human Fintech", concept:"Warm, rounded"}] } } },
  { id:"mood_1", type:"moodboard", position:{x:880,y:380}, data:{ title:"Moodboard", type:"moodboard", status:"idle", version:1, versions:[], data:{ images:["https://picsum.photos/seed/aureum1/400/300","https://picsum.photos/seed/aureum2/400/300","https://picsum.photos/seed/aureum3/400/300"], colors:["#0a0a0a","#f4f1ea","#6366f1"], notes:"Editorial, monochrome, soft grain" } } },
  { id:"color_1", type:"colorSystem", position:{x:80,y:700}, data:{ title:"Color System", type:"colorSystem", status:"completed", version:1, versions:[], data:{ colors:[{name:"Ink",hex:"#0a0a0c",role:"primary"},{name:"Paper",hex:"#f4f1ea",role:"background"},{name:"Accent",hex:"#6366f1",role:"accent"},{name:"Muted",hex:"#8a8a93",role:"text-muted"},{name:"Success",hex:"#10b981",role:"success"}] } } },
  { id:"type_1", type:"typography", position:{x:480,y:700}, data:{ title:"Typography", type:"typography", status:"completed", version:1, versions:[], data:{ primary:"Neue Haas Grotesk", secondary:"Fraunces", display:"Fraunces 72pt", body:"Inter 16/24", weights:"400,500,700", hierarchy:"H1 72 / H2 48 / Body 16" } } },
  { id:"logo_1", type:"logoConcept", position:{x:880,y:700}, data:{ title:"Logo Concept", type:"logoConcept", status:"idle", version:1, versions:[], data:{ concepts:["A monogram — geometric A", "Wordmark — spaced tracking 120","Symbol — intersecting arcs"], note:"Keep concept as raster, vector comes next" } } },
  { id:"img_1", type:"imageGen", position:{x:80,y:1020}, data:{ title:"Image Generator", type:"imageGen", status:"idle", version:1, versions:[], data:{ prompt:"minimalist premium fintech editorial, Swiss grid, monochrome with indigo accent, quiet luxury, 4k", negativePrompt:"clipart, piggy bank, rocket", aspect:"1:1", model:"mock", output:"" } } },
  { id:"copy_1", type:"copy", position:{x:480,y:1020}, data:{ title:"Copy", type:"copy", status:"idle", version:1, versions:[], data:{ headlines:["Money, designed.","Your capital. Calmer."], tagline:"Clarity is the new wealth.", body:"A premium OS for founders who value time and taste." } } },
  { id:"social_1", type:"social", position:{x:880,y:1020}, data:{ title:"Social Pack", type:"social", status:"idle", version:1, versions:[], data:{ formats:["Instagram Post 1080x1080","Story 1080x1920","LinkedIn 1200x627"], variations:3 } } },
  { id:"pres_1", type:"presentation", position:{x:480,y:1320}, data:{ title:"Presentation", type:"presentation", status:"idle", version:1, versions:[], data:{ slides:["Cover","Challenge","Research","Strategy","Direction","Moodboard","Identity","Applications","Next steps"] } } },
  { id:"export_1", type:"export", position:{x:880,y:1320}, data:{ title:"Export", type:"export", status:"idle", version:1, versions:[], data:{ formats:["PNG","PDF","JSON"] } } },
];

export const demoEdges: Edge[] = [
  { id:"e1", source:"brief_1", target:"research_1" },
  { id:"e2", source:"research_1", target:"audience_1" },
  { id:"e3", source:"audience_1", target:"strategy_1" },
  { id:"e4", source:"strategy_1", target:"cd_1" },
  { id:"e5", source:"cd_1", target:"mood_1" },
  { id:"e6", source:"mood_1", target:"color_1" },
  { id:"e7", source:"color_1", target:"type_1" },
  { id:"e8", source:"type_1", target:"logo_1" },
  { id:"e9", source:"logo_1", target:"img_1" },
  { id:"e10", source:"img_1", target:"copy_1" },
  { id:"e11", source:"copy_1", target:"social_1" },
  { id:"e12", source:"social_1", target:"pres_1" },
  { id:"e13", source:"pres_1", target:"export_1" },
];
