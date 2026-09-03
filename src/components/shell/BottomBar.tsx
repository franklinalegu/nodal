"use client";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactFlow, useViewport } from "@xyflow/react";
import { useEffect } from "react";

export function BottomBar(){
  const { nodes, selectedId, projectName, zoom, setZoom } = useCanvasStore();
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const viewport = useViewport();
  const sel = nodes.find(n=>n.id===selectedId);

  // keep store zoom in sync with actual viewport for accurate display
  useEffect(()=>{ setZoom(viewport.zoom); }, [viewport.zoom, setZoom]);

  const displayZoom = Math.round((viewport.zoom ?? zoom)*100);

  return (
    <div className="h-7 border-t border-zinc-800 bg-[#0f0f12] flex items-center px-2 gap-2 text-[11px] text-zinc-500 shrink-0">
      <span className="hidden sm:inline">{projectName}</span>
      <span className="hidden sm:inline">• {nodes.length} nodes</span>
      {sel && <span className="text-zinc-300">Selected: {(sel.data as unknown as { title:string }).title}</span>}
      <div className="flex-1" />
      <span>{displayZoom}%</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>zoomOut()}><ZoomOut size={12}/></Button>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>zoomIn()}><ZoomIn size={12}/></Button>
      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={()=>fitView({padding:0.2, duration:300})}><Maximize size={12} className="mr-1"/>Fit</Button>
      <span className="hidden md:inline">Local • Autosave on • Mock AI ready</span>
    </div>
  );
}
