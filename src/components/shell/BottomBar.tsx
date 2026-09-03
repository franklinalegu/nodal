"use client";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

export function BottomBar(){
  const { nodes, selectedId, projectName, zoom } = useCanvasStore();
  const sel = nodes.find(n=>n.id===selectedId);
  // BottomBar is inside ReactFlowProvider but OUTSIDE <ReactFlow>.
  // useViewport() would crash here — use getZoom() + poll.
  let reactFlow: ReturnType<typeof useReactFlow> | null = null;
  try { reactFlow = useReactFlow(); } catch { reactFlow = null; }
  const [displayZoom, setDisplayZoom] = useState(zoom);
  useEffect(()=>{
    if (!reactFlow) return;
    const id = setInterval(()=> {
      try { setDisplayZoom(reactFlow!.getZoom()); } catch {}
    }, 300);
    return ()=> clearInterval(id);
  }, [reactFlow]);

  return (
    <div className="h-7 border-t border-zinc-800 bg-[#0f0f12] flex items-center px-2 gap-2 text-[11px] text-zinc-500 shrink-0">
      <span className="hidden sm:inline">{projectName}</span>
      <span className="hidden sm:inline">• {nodes.length} nodes</span>
      {sel && <span className="text-zinc-300">Selected: {(sel.data as unknown as { title:string }).title}</span>}
      <div className="flex-1" />
      <span>{Math.round(displayZoom*100)}%</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>reactFlow?.zoomOut()}><ZoomOut size={12}/></Button>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>reactFlow?.zoomIn()}><ZoomIn size={12}/></Button>
      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={()=>reactFlow?.fitView({padding:0.2, duration:300})}><Maximize size={12} className="mr-1"/>Fit</Button>
      <span className="hidden md:inline">Local • Autosave on • Mock AI ready</span>
    </div>
  );
}
