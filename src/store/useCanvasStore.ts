"use client";
import { create } from "zustand";
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from "@xyflow/react";
import { demoNodes, demoEdges } from "@/lib/demoProject";
import { nid } from "@/lib/utils";
import { NodeType } from "@/types/nodes";

type History = { nodes: Node[]; edges: Edge[]; projectName: string; generationHistory: CanvasState["generationHistory"] };

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedId: string | null;
  projectName: string;
  saveStatus: "saved"|"saving"|"unsaved";
  zoom: number;
  generationHistory: { id:string; nodeId:string; provider:string; prompt:string; output:string; createdAt:string }[];
  past: History[];
  future: History[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (c: Connection) => void;
  setSelected: (id:string|null)=>void;
  addNode: (type: NodeType, pos?: {x:number;y:number})=>void;
  updateNodeData: (id:string, patch: Record<string, unknown>)=>void;
  duplicateNode: (id:string)=>void;
  deleteNode: (id:string)=>void;
  deleteSelected: ()=>void;
  branchVersion: (id:string)=>void;
  restoreVersion: (nodeId:string, versionId:string)=>void;
  undo: ()=>void;
  redo: ()=>void;
  save: ()=>Promise<void>;
  load: ()=>Promise<void>;
  exportProject: ()=>Promise<void>;
  setProjectName: (n:string)=>void;
  setZoom: (z:number)=>void;
  pushHistory: ()=>void;
  addGeneration: (g:{nodeId:string; provider:string; prompt:string; output:string})=>void;
}

const MAX_HISTORY = 50;

function snapHistory(s: CanvasState): History {
  return {
    nodes: JSON.parse(JSON.stringify(s.nodes)),
    edges: JSON.parse(JSON.stringify(s.edges)),
    projectName: s.projectName,
    generationHistory: JSON.parse(JSON.stringify(s.generationHistory)),
  };
}



export const useCanvasStore = create<CanvasState>((set, get)=>({
  nodes: demoNodes,
  edges: demoEdges,
  selectedId: null,
  projectName: "AUREUM — Premium Fintech",
  saveStatus: "saved",
  zoom: 1,
  generationHistory: [],
  past: [],
  future: [],

  setProjectName: (n)=> set({ projectName:n, saveStatus:"unsaved" }),

  setSelected: (id)=> set({ selectedId: id }),

  setZoom: (z)=> set({ zoom: z }),

  pushHistory: ()=>{
    const past = get().past;
    set({ past: [...past.slice(-MAX_HISTORY+1), snapHistory(get() as unknown as CanvasState)], future: [] });
  },

  onNodesChange: (changes)=> {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node[], saveStatus:"unsaved" });
  },
  onEdgesChange: (changes)=> {
    set({ edges: applyEdgeChanges(changes, get().edges), saveStatus:"unsaved" });
  },
  onConnect: (c)=>{
    get().pushHistory();
    const edge: Edge = { id: `e_${uid()}`, source: c.source!, target: c.target!, sourceHandle: c.sourceHandle, targetHandle: c.targetHandle };
    set({ edges: [...get().edges, edge], saveStatus:"unsaved" });
  },

  addNode: (type, pos)=>{
    get().pushHistory();
    const id = nid(type);
    const titleMap: Record<string,string> = { brief:"Creative Brief", research:"Research", audience:"Audience", strategy:"Brand Strategy", creativeDirection:"Creative Direction", moodboard:"Moodboard", colorSystem:"Color System", typography:"Typography", logoConcept:"Logo Concept", imageGen:"Image Generator", copy:"Copy", layout:"Layout", social:"Social Pack", presentation:"Presentation", mockup:"Mockup", critique:"Critique", export:"Export", frame:"Frame", aiAssistant:"AI Director" };
    const defaults: Record<string, unknown> = {
      brief:{ projectName:"", client:"", industry:"", problem:"", objective:"", audience:"", deliverables:"", constraints:"", notes:"" },
      research:{ industry:"", competitors:"", market:"", keywords:"", references:"" },
      audience:{ output:"" },
      strategy:{ output:"" },
      creativeDirection:{ directions:[] },
      moodboard:{ images:[], colors:["#0a0a0c","#f4f1ea"], notes:"" },
      colorSystem:{ colors:[{name:"Primary",hex:"#0a0a0c",role:"primary"},{name:"Background",hex:"#f4f1ea",role:"background"},{name:"Accent",hex:"#6366f1",role:"accent"}] },
      typography:{ primary:"Inter", secondary:"Fraunces", display:"72pt", body:"16/24", weights:"400,500,700", hierarchy:"H1 72 / H2 48" },
      logoConcept:{ concepts:[], note:"" },
      imageGen:{ prompt:"", negativePrompt:"", aspect:"1:1", output:"" },
      copy:{ headlines:[], tagline:"", body:"" },
      social:{ formats:["IG Post"], variations:3 },
      presentation:{ slides:["Cover","Strategy","Direction","Next steps"] },
      export:{ formats:["PNG","PDF","JSON"] },
      critique:{ score:null, text:"" },
      aiAssistant:{ messages:[] },
      layout:{ notes:"" },
      mockup:{ image:"" },
      frame:{ w:400, h:300 },
    };
    const node: Node = {
      id,
      type,
      position: pos || { x: 200 + Math.random()*300, y: 150 + Math.random()*200 },
      data: { title: titleMap[type]||type, type, status:"idle", version:1, versions:[], data: (defaults[type] as Record<string, unknown>) || {} },
      width: type==="moodboard"||type==="creativeDirection"?420:360,
    };
    set({ nodes: [...get().nodes, node], selectedId:id, saveStatus:"unsaved" });
  },

  updateNodeData: (id, patch)=>{
    const { _status, version, versions, ...dataPatch } = patch as Record<string, unknown> & { _status?: string; version?: number; versions?: unknown[] };
    set({
      nodes: get().nodes.map(n=> {
        if (n.id!==id) return n;
        const cur = n.data as unknown as { data: Record<string,unknown>; status: string; version: number; versions: unknown[]; title: string; type: string };
        const nextData = { ...cur.data, ...dataPatch };
        const nextStatus = (_status as string) || cur.status;
        const nextVersion = (version as number) ?? cur.version;
        const nextVersions = (versions as unknown[]) ?? cur.versions;
        return { ...n, data: { ...cur, data: nextData, status: nextStatus, version: nextVersion, versions: nextVersions } } as Node;
      }),
      saveStatus:"unsaved"
    });
  },

  duplicateNode: (id)=>{
    get().pushHistory();
    const n = get().nodes.find(x=>x.id===id);
    if (!n) return;
    const copy: Node = { ...n, id: nid(n.type as string), position:{ x: (n.position.x||0)+40, y:(n.position.y||0)+40 }, data:{ ...(n.data as Record<string,unknown>), version:1, versions:[] } as unknown as Node["data"] };
    set({ nodes:[...get().nodes, copy], selectedId: copy.id, saveStatus:"unsaved" });
  },
  deleteNode: (id)=>{
    get().pushHistory();
    set({ nodes: get().nodes.filter(n=>n.id!==id), edges: get().edges.filter(e=>e.source!==id && e.target!==id), selectedId:null, saveStatus:"unsaved" });
  },
  deleteSelected: ()=>{
    const id = get().selectedId;
    if (id) get().deleteNode(id);
  },

  branchVersion: (id)=>{
    get().pushHistory();
    const n = get().nodes.find(x=>x.id===id);
    if (!n) return;
    const cur = n.data as unknown as { version: number; versions: { id:string; label:string; data: unknown; createdAt:string }[]; data: Record<string,unknown> };
    const nextVersion = cur.version + 1;
    const snap = { id: `v_${Date.now().toString(36)}`, label: `v${nextVersion}`, data: JSON.parse(JSON.stringify(cur.data)), createdAt: new Date().toISOString() };
    const updatedNodes = get().nodes.map(x=> x.id===id ? { ...x, data: { ...(x.data as object), version: nextVersion, versions: [...(cur.versions||[]), snap] } as Node["data"] } : x);
    set({ nodes: updatedNodes, saveStatus:"unsaved" });
  },

  restoreVersion: (nodeId, versionId)=>{
    get().pushHistory();
    const n = get().nodes.find(x=>x.id===nodeId);
    if (!n) return;
    const cur = n.data as unknown as { versions: { id:string; label:string; data: Record<string,unknown> }[] };
    const v = cur.versions.find(x=>x.id===versionId);
    if (!v) return;
    const updated = get().nodes.map(x=> x.id===nodeId ? { ...x, data: { ...(x.data as object), data: JSON.parse(JSON.stringify(v.data)) } as Node["data"] } : x);
    set({ nodes: updated, saveStatus:"unsaved" });
  },

  undo: ()=>{
    const { past, nodes, edges, future, projectName, generationHistory } = get();
    if (past.length===0) return;
    const prev = past[past.length-1];
    set({ nodes: prev.nodes, edges: prev.edges, projectName: prev.projectName, generationHistory: prev.generationHistory, past: past.slice(0,-1), future: [...future, { nodes, edges, projectName, generationHistory }] });
  },
  redo: ()=>{
    const { future, nodes, edges, past, projectName, generationHistory } = get();
    if (future.length===0) return;
    const next = future[future.length-1];
    set({ nodes: next.nodes, edges: next.edges, projectName: next.projectName, generationHistory: next.generationHistory, future: future.slice(0,-1), past:[...past, {nodes, edges, projectName, generationHistory}] });
  },

  save: async ()=>{
    const { nodes, edges, projectName, generationHistory } = get();
    const payload = { nodes, edges, projectName, generationHistory, updatedAt: new Date().toISOString(), v: 1 };
    set({ saveStatus:"saving" });
    try {
      const { storage } = await import("@/lib/storage");
      await storage.saveProject(payload as never);
      set({ saveStatus:"saved" });
    } catch (e) {
      console.error("[CreativeCanvas] save failed", e);
      set({ saveStatus:"unsaved" });
    }
  },
  load: async ()=>{
    try {
      const { storage } = await import("@/lib/storage");
      const parsed = await storage.loadProject() as { nodes?: Node[]; edges?: Edge[]; projectName?: string; generationHistory?: CanvasState["generationHistory"] } | null;
      if (!parsed || !parsed.nodes) return;
      const sanitizedNodes = parsed.nodes.map(n=>{
        const data = (n.data as unknown as { data: Record<string,unknown> })?.data as Record<string,unknown> | undefined;
        if (data && Array.isArray((data as { images?: unknown[] }).images)) {
          const imgs = (data.images as string[]).filter(s=> typeof s==="string" && !s.startsWith("blob:"));
          return { ...n, data: { ...(n.data as object), data: { ...data, images: imgs } } as Node["data"] };
        }
        return n;
      });
      set({ nodes: sanitizedNodes, edges: parsed.edges || [], projectName: parsed.projectName || "Untitled", generationHistory: parsed.generationHistory||[], saveStatus:"saved" });
    } catch {}
  },
  exportProject: async ()=>{
    const { nodes, edges, projectName, generationHistory } = get();
    const payload = { projectName, nodes, edges, generationHistory, exportedAt: new Date().toISOString(), v: 1 };
    const { storage } = await import("@/lib/storage");
    const fileName = `${projectName.replace(/\W+/g,"_").toLowerCase()}.json`;
    await storage.exportBackup(payload as never, fileName);
  },
  addGeneration: (g)=>{
    const rec = { id: nid("gen"), ...g, createdAt: new Date().toISOString() };
    set({ generationHistory: [rec, ...get().generationHistory].slice(0,100), saveStatus:"unsaved" });
  }
}));

function uid(){ return Math.random().toString(36).slice(2,9); }
