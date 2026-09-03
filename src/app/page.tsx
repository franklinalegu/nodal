"use client";
import { TopBar } from "@/components/shell/TopBar";
import { LeftSidebar } from "@/components/shell/LeftSidebar";
import { RightPanel } from "@/components/shell/RightPanel";
import { BottomBar } from "@/components/shell/BottomBar";
import { CreativeCanvas } from "@/components/canvas/CreativeCanvas";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";

export default function Home(){
  const load = useCanvasStore(s=>s.load);
  const save = useCanvasStore(s=>s.save);
  const saveStatus = useCanvasStore(s=>s.saveStatus);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(()=>{
    load();
    const id = setInterval(()=>{ if(useCanvasStore.getState().saveStatus==="unsaved") save(); }, 2500);
    const onKey = (e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="k"){ e.preventDefault(); setCommandOpen(v=>!v); } };
    window.addEventListener("keydown", onKey);
    return ()=>{ clearInterval(id); window.removeEventListener("keydown", onKey); };
  }, [load, save]);

  useEffect(()=>{
    const h = ()=>{ if(useCanvasStore.getState().saveStatus==="unsaved") useCanvasStore.getState().save(); };
    window.addEventListener("beforeunload", h);
    return ()=> window.removeEventListener("beforeunload", h);
  }, []);

  // Persist unsaved indicator in tab title
  useEffect(()=>{
    document.title = `${saveStatus==="unsaved"?"• ":""}NODAL — Creative intelligence, connected.`;
  }, [saveStatus]);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-[#08080a]">
        <TopBar onCommand={()=>setCommandOpen(true)} />
        <div className="flex flex-1 min-h-0">
          <LeftSidebar />
          <CreativeCanvas />
          <RightPanel />
        </div>
        <BottomBar />
        <CommandPalette open={commandOpen} onClose={()=>setCommandOpen(false)} />
      </div>
    </ReactFlowProvider>
  );
}
