"use client";
import { ReactFlow, Background, Controls, MiniMap, Panel, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/store/useCanvasStore";
import { nodeTypesMap } from "@/components/nodes/NodeWrappers";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Trash2, Copy } from "lucide-react";

export function CreativeCanvas(){
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelected, duplicateNode, deleteNode, selectedId, setZoom } = useCanvasStore();
  const { zoomIn, zoomOut, fitView, getZoom, screenToFlowPosition } = useReactFlow();
  const ref = useRef<HTMLDivElement>(null);

  const onNodeClick = useCallback((_:unknown, n: {id:string})=> setSelected(n.id), [setSelected]);
  const onPaneClick = useCallback(()=> setSelected(null), [setSelected]);
  const onSelectionChange = useCallback(({nodes: sel}:{nodes:{id:string}[]})=>{
    if(sel.length===1) setSelected(sel[0].id);
  }, [setSelected]);

  const onMove = useCallback(()=>{ setZoom(getZoom()); }, [getZoom, setZoom]);

  useEffect(()=>{
    const h = (e:KeyboardEvent)=>{
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="z" && !e.shiftKey){ e.preventDefault(); useCanvasStore.getState().undo(); }
      if ((e.ctrlKey||e.metaKey) && (e.key.toLowerCase()==="z" && e.shiftKey || e.key.toLowerCase()==="y")){ e.preventDefault(); useCanvasStore.getState().redo(); }
      if (e.key==="Delete" || (e.key==="Backspace" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement))){ if(selectedId) deleteNode(selectedId); }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="d"){ e.preventDefault(); if(selectedId) duplicateNode(selectedId); }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="s"){ e.preventDefault(); useCanvasStore.getState().save(); }
    };
    window.addEventListener("keydown", h);
    return ()=> window.removeEventListener("keydown", h);
  }, [selectedId, duplicateNode, deleteNode]);

  const onDrop = useCallback((e: React.DragEvent)=>{
    e.preventDefault();
    const type = e.dataTransfer.getData("application/reactflow");
    if(!type) return;
    const pos = screenToFlowPosition({ x:e.clientX, y:e.clientY });
    useCanvasStore.getState().addNode(type as never, pos);
  }, [screenToFlowPosition]);

  // Defensive: hide any ReactFlow a11y live region that leaks as visible text
  useEffect(()=>{
    const hide = ()=>{
      document.querySelectorAll('[aria-live="polite"],[aria-live="assertive"],.react-flow__aria-live').forEach(el=>{
        (el as HTMLElement).style.display = 'none';
        (el as HTMLElement).style.visibility = 'hidden';
      });
    };
    hide();
    const obs = new MutationObserver(hide);
    obs.observe(document.body, { childList:true, subtree:true });
    return ()=> obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex-1 relative bg-[#08080a]" onDrop={onDrop} onDragOver={e=>{e.preventDefault(); e.dataTransfer.dropEffect="move";}}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick as never}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange as never}
        onMove={onMove}
        nodeTypes={nodeTypesMap as never}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution:true }}
        className="bg-[#08080a]"
      >
        <Background gap={24} size={1} color="#1a1a1e" />
        <Controls position="bottom-left" />
        <MiniMap position="bottom-right" className="!bg-[#141417] !border-zinc-800" maskColor="rgba(0,0,0,0.6)" pannable zoomable />
        <Panel position="top-center" className="!m-2">
          <div className="flex items-center gap-1 bg-[#141417] border border-zinc-800 rounded-full px-2 py-1 shadow-xl">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={()=>zoomOut()}><ZoomOut size={14}/></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={()=>zoomIn()}><ZoomIn size={14}/></Button>
            <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs" onClick={()=>fitView({padding:0.2})}><Maximize size={12} className="mr-1"/>Fit</Button>
            <div className="w-px h-4 bg-zinc-800 mx-1"/>
            <span className="text-[11px] text-zinc-500 px-1">{Math.round(getZoom()*100)}%</span>
          </div>
        </Panel>
        {selectedId && (
          <Panel position="top-right" className="!m-2">
            <div className="flex gap-1">
              <Button variant="sub" size="sm" onClick={()=>duplicateNode(selectedId)}><Copy size={12} className="mr-1"/>Duplicate</Button>
              <Button variant="sub" size="sm" onClick={()=>deleteNode(selectedId)}><Trash2 size={12} className="mr-1"/>Delete</Button>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
