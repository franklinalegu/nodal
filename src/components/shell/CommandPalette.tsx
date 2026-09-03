"use client";
import { useEffect, useState } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { NODE_META, NodeType } from "@/types/nodes";

export function CommandPalette({ open, onClose }: { open:boolean; onClose:()=>void }){
  const [q, setQ] = useState("");
  const addNode = useCanvasStore(s=>s.addNode);
  const save = useCanvasStore(s=>s.save);
  const exportProject = useCanvasStore(s=>s.exportProject);

  useEffect(()=>{
    if(!open) setQ("");
  },[open]);

  if(!open) return null;
  const all: NodeType[] = Object.keys(NODE_META) as NodeType[];
  const filtered = all.filter(t=> NODE_META[t].label.toLowerCase().includes(q.toLowerCase()));
  const actions = [
    { label:"Save project", run:()=>{ save(); onClose(); } },
    { label:"Export project JSON", run:()=>{ exportProject(); onClose(); } },
  ].filter(a=> a.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-start pt-[20vh]" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="w-[560px] max-w-[92vw] mx-auto bg-[#141417] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Create node, search project, export…" className="w-full bg-transparent px-4 py-3 text-sm outline-none border-b border-zinc-800 placeholder:text-zinc-500" />
        <div className="max-h-[340px] overflow-auto p-2">
          {filtered.map(t=>(
            <button key={t} onClick={()=>{ addNode(t); onClose(); }} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-900 flex justify-between items-center">
              <span className="text-sm">{NODE_META[t].label}</span><span className="text-xs text-zinc-500">{NODE_META[t].category}</span>
            </button>
          ))}
          {actions.map(a=>(
            <button key={a.label} onClick={a.run} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-900 text-sm text-violet-300">{a.label}</button>
          ))}
          {filtered.length===0 && actions.length===0 && <div className="px-3 py-6 text-center text-sm text-zinc-500">No results</div>}
        </div>
        <div className="px-3 py-2 border-t border-zinc-800 text-[11px] text-zinc-500">Enter to create • Esc to close</div>
      </div>
    </div>
  );
}
