"use client";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/store/useCanvasStore";
import { Save, Undo2, Redo2, Download, Sparkles, Command, Play } from "lucide-react";
import { useEffect, useState } from "react";

export function TopBar({ onCommand }: { onCommand:()=>void }){
  const { projectName, setProjectName, saveStatus, save, undo, redo, exportProject } = useCanvasStore();
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(projectName);
  useEffect(()=>setTmp(projectName),[projectName]);

  return (
    <div className="h-[48px] border-b border-zinc-800 bg-[#0f0f12] flex items-center px-3 gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-white text-black grid place-items-center font-black text-[11px] tracking-widest">◈</div>
        <span className="font-black tracking-[0.14em] text-sm hidden sm:block">NODAL</span>
        <span className="text-zinc-500 text-[11px] hidden sm:block tracking-wide">Creative intelligence, connected.</span>
      </div>
      <div className="h-6 w-px bg-zinc-800 mx-1" />
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {editing ? (
          <input autoFocus value={tmp} onChange={e=>setTmp(e.target.value)} onBlur={()=>{ setProjectName(tmp); setEditing(false); }} onKeyDown={e=>{ if(e.key==="Enter"){ setProjectName(tmp); setEditing(false);} }} className="bg-zinc-900 border border-violet-600 rounded px-2 py-1 text-sm w-full max-w-[360px]" />
        ) : (
          <button onClick={()=>setEditing(true)} className="text-sm font-medium truncate hover:bg-zinc-900 px-2 py-1 rounded">{projectName}</button>
        )}
        <span className={`text-[11px] px-1.5 py-0.5 rounded border ${saveStatus==="saved"?"border-emerald-900 text-emerald-400 bg-emerald-950/30": saveStatus==="saving"?"border-amber-900 text-amber-400":"border-zinc-800 text-zinc-500"}`}>{saveStatus==="saved"?"Saved":saveStatus==="saving"?"Saving...":"Unsaved"}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={undo} title="Undo (Ctrl+Z)"><Undo2 size={16}/></Button>
        <Button variant="ghost" size="icon" onClick={redo} title="Redo (Ctrl+Shift+Z)"><Redo2 size={16}/></Button>
        <Button variant="ghost" size="icon" onClick={onCommand} title="Command (Ctrl+K)"><Command size={16}/></Button>
        <Button variant="sub" size="sm" onClick={save}><Save size={14} className="mr-1"/> Save</Button>
        <Button variant="sub" size="sm" onClick={exportProject}><Download size={14} className="mr-1"/> Export</Button>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white"><Play size={14} className="mr-1"/> Present</Button>
      </div>
    </div>
  );
}
