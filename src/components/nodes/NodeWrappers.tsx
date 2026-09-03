"use client";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { NODE_META } from "@/types/nodes";
import { useCanvasStore } from "@/store/useCanvasStore";
import { MoreHorizontal, Copy, Trash2 } from "lucide-react";

function Base({ id, data, children }: NodeProps & { children: React.ReactNode }){
  const selectedId = useCanvasStore(s=>s.selectedId);
  const selected = selectedId===id;
  const meta = (NODE_META as any)[(data as any).type] || { label:(data as any).title, color:"#6366f1" };
  const status = (data as any).status || "idle";
  const statusColor = status==="completed"?"#10b981": status==="processing"?"#f59e0b": status==="failed"?"#ef4444":"#52525b";
  return (
    <div className={`w-[360px] rounded-xl border bg-[#141417] shadow-xl overflow-hidden ${selected ? "border-white/30 ring-1 ring-white/10" : "border-zinc-800"}`}>
      <div className="h-8 flex items-center gap-2 px-3 border-b border-zinc-800" style={{borderLeft:`3px solid ${meta.color}`}}>
        <span className="w-2 h-2 rounded-full" style={{background:meta.color}} />
        <span className="text-[11px] tracking-widest font-bold text-zinc-400">{meta.label.toUpperCase()}</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{background:statusColor}} />
          <span className="text-[10px] text-zinc-500">{status}</span>
        </span>
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-zinc-100 mb-2">{(data as any).title}</div>
        {children}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export function BriefNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="space-y-1 text-xs text-zinc-400"><div><b className="text-zinc-200">{d.projectName||"Untitled"}</b> — {d.client||"No client"}</div><div className="line-clamp-3">{d.objective||"Add objective…"}</div><div className="flex gap-1 text-[10px]"><span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">{d.industry||"Industry"}</span><span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">{d.deliverables||"Deliverables"}</span></div></div></Base>; }
export function StrategyNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="text-xs whitespace-pre-wrap text-zinc-300 line-clamp-6">{d.output||"Strategy output will appear here. Connect brief → strategy."}</div></Base>; }
export function CreativeDirectionNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="grid grid-cols-1 gap-2">{(d.directions||[]).slice(0,3).map((dir:any,i:number)=><div key={i} className="p-2 rounded bg-zinc-900 border border-zinc-800"><div className="text-xs font-semibold text-zinc-100">{dir.name}</div><div className="text-[11px] text-zinc-500">{dir.concept}</div></div>)}{(d.directions||[]).length===0 && <div className="text-xs text-zinc-500">Generate 3 directions via inspector.</div>}</div></Base>; }
export function MoodboardNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="grid grid-cols-3 gap-1.5">{(d.images||[]).slice(0,6).map((s:string,i:number)=><img key={i} src={s} className="aspect-square object-cover rounded border border-zinc-800" />)}{(d.images||[]).length===0 && <div className="col-span-3 text-xs text-zinc-500 py-4 text-center border border-dashed border-zinc-800 rounded">Drop images or paste URL</div>}</div></Base>; }
export function ColorSystemNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="grid grid-cols-5 gap-1.5">{(d.colors||[]).map((c:any,i:number)=><div key={i} className="text-center"><div className="h-10 rounded border border-zinc-800" style={{background:c.hex}} /><div className="text-[10px] text-zinc-500 mt-1">{c.name}</div><div className="text-[10px] font-mono text-zinc-400">{c.hex}</div></div>)}</div></Base>; }
export function TypographyNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="space-y-1 text-xs"><div className="text-lg font-bold" style={{fontFamily:d.primary}}>{d.primary||"Inter"}</div><div className="text-sm text-zinc-400" style={{fontFamily:d.secondary}}>{d.secondary||"Fraunces"}</div><div className="text-[11px] text-zinc-500">{d.hierarchy||"H1 72 / H2 48 / Body 16"}</div></div></Base>; }
export function LogoConceptNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="grid grid-cols-3 gap-2">{(d.concepts||[]).map((c:string,i:number)=><div key={i} className="aspect-square rounded bg-zinc-900 border border-zinc-800 grid place-items-center text-[10px] text-center p-2 text-zinc-400">{c}</div>)}{(d.concepts||[]).length===0 && <div className="col-span-3 text-xs text-zinc-500 text-center py-4">Concept directions</div>}</div></Base>; }
export function ImageGenNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="space-y-2"><div className="text-xs text-zinc-400 line-clamp-2">{d.prompt||"Prompt…"}</div>{d.output ? <img src={d.output} className="w-full rounded border border-zinc-800 aspect-square object-cover" /> : <div className="w-full aspect-square rounded bg-zinc-900 border border-dashed border-zinc-800 grid place-items-center text-xs text-zinc-500">No image</div>}<div className="text-[10px] text-zinc-500">{d.aspect||"1:1"} • {d.model||"mock"}</div></div></Base>; }
export function CopyNode(props: NodeProps){ const d=(props.data as any).data; const txt=d.output||d.body||""; return <Base {...props}><div className="text-xs whitespace-pre-wrap line-clamp-6 text-zinc-300">{txt||"Copy will appear here."}</div></Base>; }
export function SocialNode(props: NodeProps){ return <Base {...props}><div className="grid grid-cols-3 gap-2"><div className="aspect-square rounded bg-zinc-900 border border-zinc-800 grid place-items-center text-[10px]">Post</div><div className="aspect-[9/16] rounded bg-zinc-900 border border-zinc-800 grid place-items-center text-[10px]">Story</div><div className="aspect-[1.91/1] rounded bg-zinc-900 border border-zinc-800 grid place-items-center text-[10px]">LinkedIn</div></div></Base>; }
export function PresentationNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="space-y-1">{(d.slides||[]).map((s:string,i:number)=><div key={i} className="text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800 flex justify-between"><span>{i+1}. {s}</span></div>)}</div></Base>; }
export function CritiqueNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="text-xs whitespace-pre-wrap line-clamp-6 text-zinc-400">{d.text||"Run critique from inspector."}</div></Base>; }
export function ResearchNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="text-xs text-zinc-400 line-clamp-4">{d.competitors||d.industry||"Research insights…"}</div></Base>; }
export function AudienceNode(props: NodeProps){ const d=(props.data as any).data; return <Base {...props}><div className="text-xs whitespace-pre-wrap line-clamp-5 text-zinc-400">{d.output||"Audience personas…"}</div></Base>; }
export function ExportNode(props: NodeProps){ return <Base {...props}><div className="text-xs text-zinc-400">PNG • PDF • JSON</div></Base>; }
export function AIAssistantNode(props: NodeProps){ return <Base {...props}><div className="text-xs text-zinc-400">Ask: Make it more premium, generate alternatives, critique layout…</div></Base>; }
export function FrameNode(props: NodeProps){ return <Base {...props}><div className="w-full h-28 rounded bg-zinc-900 border border-dashed border-zinc-700 grid place-items-center text-xs text-zinc-500">Frame</div></Base>; }
export function LayoutNode(props: NodeProps){ return <Base {...props}><div className="grid grid-cols-12 gap-1 h-20"><div className="col-span-8 bg-zinc-900 rounded border border-zinc-800"/><div className="col-span-4 bg-zinc-800 rounded border border-zinc-700"/></div></Base>; }
export function MockupNode(props: NodeProps){ return <Base {...props}><div className="h-28 rounded bg-zinc-900 border border-zinc-800 grid place-items-center text-xs text-zinc-500">Mockup preview</div></Base>; }

export const nodeTypesMap = {
  brief: BriefNode,
  research: ResearchNode,
  audience: AudienceNode,
  strategy: StrategyNode,
  creativeDirection: CreativeDirectionNode,
  moodboard: MoodboardNode,
  colorSystem: ColorSystemNode,
  typography: TypographyNode,
  logoConcept: LogoConceptNode,
  imageGen: ImageGenNode,
  copy: CopyNode,
  layout: LayoutNode,
  social: SocialNode,
  presentation: PresentationNode,
  mockup: MockupNode,
  critique: CritiqueNode,
  export: ExportNode,
  frame: FrameNode,
  aiAssistant: AIAssistantNode,
};
