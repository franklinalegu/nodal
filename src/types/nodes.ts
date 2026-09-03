export type NodeType =
  | "brief"
  | "research"
  | "audience"
  | "strategy"
  | "creativeDirection"
  | "moodboard"
  | "colorSystem"
  | "typography"
  | "logoConcept"
  | "imageGen"
  | "copy"
  | "layout"
  | "social"
  | "presentation"
  | "mockup"
  | "critique"
  | "export"
  | "frame"
  | "aiAssistant";

export interface CanvasNodeData {
  title: string;
  type: NodeType;
  status: "idle" | "processing" | "completed" | "failed";
  inputs: string[];
  outputs: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  version: number;
  versions: { id:string; label:string; data:any; createdAt:string; note?:string }[];
  branchFrom?: string;
  metadata?: Record<string,unknown>;
}

export interface ProjectContext {
  id: string;
  name: string;
  client?: string;
  description?: string;
  status: "draft"|"active"|"archived";
  brandId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandSystem {
  id: string;
  name: string;
  industry?: string;
  positioning?: string;
  personality?: string[];
  tone?: string;
  colors: { name:string; hex:string; role:string }[];
  typography: { primary:string; secondary:string; display?:string; body?:string };
  principles?: string[];
  restrictions?: string[];
  updatedAt: string;
}

export interface GenerationRecord {
  id: string;
  nodeId: string;
  provider: string;
  model?: string;
  prompt: string;
  params?: Record<string,unknown>;
  output?: string;
  status: "pending"|"success"|"failed";
  createdAt: string;
  durationMs?: number;
}

export const NODE_META: Record<NodeType, { label:string; category:string; color:string; icon:string; description:string }> = {
  brief: { label: "Creative Brief", category: "Creative", color: "#6366f1", icon: "FileText", description: "Project brief & objectives" },
  research: { label: "Research", category: "Creative", color: "#06b6d4", icon: "Search", description: "Market & competitor research" },
  audience: { label: "Audience", category: "Brand", color: "#8b5cf6", icon: "Users", description: "Audience personas" },
  strategy: { label: "Brand Strategy", category: "Brand", color: "#a855f7", icon: "Target", description: "Positioning & messaging" },
  creativeDirection: { label: "Creative Direction", category: "Creative", color: "#ec4899", icon: "Compass", description: "3 direction concepts" },
  moodboard: { label: "Moodboard", category: "Creative", color: "#f59e0b", icon: "LayoutGrid", description: "Visual collage" },
  colorSystem: { label: "Color System", category: "Brand", color: "#10b981", icon: "Palette", description: "Brand palette" },
  typography: { label: "Typography", category: "Brand", color: "#6366f1", icon: "Type", description: "Type system" },
  logoConcept: { label: "Logo Concept", category: "Brand", color: "#eab308", icon: "Hexagon", description: "Concept exploration" },
  imageGen: { label: "Image Generator", category: "AI", color: "#ef4444", icon: "Image", description: "AI image generation" },
  copy: { label: "Copy", category: "AI", color: "#14b8a6", icon: "PenLine", description: "Headlines & copy" },
  layout: { label: "Layout", category: "Design", color: "#3b82f6", icon: "PanelsTopLeft", description: "Composition" },
  social: { label: "Social Pack", category: "Production", color: "#f43f5e", icon: "Smartphone", description: "Social variations" },
  presentation: { label: "Presentation", category: "Production", color: "#22c55e", icon: "Presentation", description: "Deck structure" },
  mockup: { label: "Mockup", category: "Production", color: "#a3a3a3", icon: "Monitor", description: "Mockup workflow" },
  critique: { label: "Critique", category: "AI", color: "#f97316", icon: "Eye", description: "AI design critique" },
  export: { label: "Export", category: "Output", color: "#6b7280", icon: "Download", description: "Export assets" },
  frame: { label: "Frame", category: "Design", color: "#52525b", icon: "Frame", description: "Container" },
  aiAssistant: { label: "AI Director", category: "AI", color: "#6366f1", icon: "Sparkles", description: "Creative assistant" },
};

export const NODE_CATEGORIES = ["AI","Creative","Brand","Design","Production","Output"] as const;
