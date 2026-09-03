"use client";
import { NODE_META, NodeType, NODE_CATEGORIES } from "@/types/nodes";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Search, Plus } from "lucide-react";
import { useState } from "react";

const ordered: NodeType[] = ["aiAssistant","imageGen","copy","critique","brief","research","creativeDirection","moodboard","strategy","audience","colorSystem","typography","logoConcept","frame","layout","social","presentation","mockup","export"];

export function LeftSidebar(){
  const addNode = useCanvasStore(s=>s.addNode);
  const [q, setQ] = useState("");
  const filtered = ordered.filter(t=>{
    const m = NODE_META[t];
    return m.label.toLowerCase().includes(q.toLowerCase()) || m.category.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="w-[260px] shrink-0 border-r border-zinc-800 bg-[#0f0f12] flex flex-col">
      <div className="p-3 border-b border-zinc-800">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-2.5 text-zinc-500"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search nodes…" className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-2 py-2 text-xs focus:outline-none focus:border-zinc-700" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-4">
        {NODE_CATEGORIES.map(cat=>{
          const nodes = filtered.filter(t=> NODE_META[t].category===cat);
          if (!nodes.length) return null;
          return (
            <div key={cat}>
              <div className="text-[10px] tracking-[0.14em] font-bold text-zinc-500 px-2 mb-2">{cat.toUpperCase()}</div>
              <div className="space-y-1">
                {nodes.map(t=>{
                  const m = NODE_META[t];
                  return (
                    <button key={t} onClick={()=>addNode(t)} className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800 group">
                      <span className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 grid place-items-center text-zinc-400 group-hover:text-white" style={{borderColor:m.color+"40"}}><Plus size={12}/></span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium leading-none text-zinc-200">{m.label}</span>
                        <span className="block text-[11px] text-zinc-500 truncate">{m.description}</span>
                      </span>
                      <span className="w-2 h-2 rounded-full" style={{background:m.color}} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-zinc-800 text-[11px] text-zinc-500 leading-relaxed">
        Drag nodes to canvas. Connect handles to build workflows. <span className="text-zinc-300">Local-first</span> — no API key required. Configure providers in Settings.
      </div>
    </div>
  );
}
