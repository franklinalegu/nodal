"use client";
import { useCanvasStore } from "@/store/useCanvasStore";
import { NODE_META } from "@/types/nodes";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Sparkles, Copy, Trash2, Layers, History, Settings2 } from "lucide-react";
import { useState } from "react";
import { getProvider, loadProviderConfig, saveProviderConfig } from "@/lib/ai/registry";

export function RightPanel(){
  const { nodes, edges, selectedId, updateNodeData, duplicateNode, deleteNode, addGeneration } = useCanvasStore();
  const node = nodes.find(n=>n.id===selectedId);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string|null>(null);

  if (!node) {
    return <InspectorEmpty />;
  }
  const meta = (NODE_META as any)[(node.data as any).type];
  const data = (node.data as any).data;

  async function runAI(prompt: string, system?: string){
    setAiLoading(true); setAiError(null);
    try {
      const provider = getProvider();
      const res = await provider.generateText({ prompt, system, temperature: loadProviderConfig().openAI.temperature });
      addGeneration({ nodeId: node!.id, provider: provider.id, prompt, output: res.text });
      // Try to apply output intelligently
      if ((node!.data as any).type==="strategy") updateNodeData(node!.id, { output: res.text });
      if ((node!.data as any).type==="audience") updateNodeData(node!.id, { output: res.text });
      if ((node!.data as any).type==="copy") updateNodeData(node!.id, { output: res.text });
      if ((node!.data as any).type==="critique") updateNodeData(node!.id, { text: res.text });
      if ((node!.data as any).type==="creativeDirection") {
        try { const arr = JSON.parse(res.text); updateNodeData(node!.id, { directions: arr }); } catch { updateNodeData(node!.id, { raw: res.text }); }
      }
      updateNodeData(node!.id, { _status:"completed" });
    } catch(e:any){ setAiError(e.message || String(e)); }
    finally{ setAiLoading(false); }
  }

  return (
    <div className="w-[340px] shrink-0 border-l border-zinc-800 bg-[#0f0f12] flex flex-col">
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{background:meta.color}} />
          <span className="text-sm font-semibold">{(node.data as any).title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">{(node.data as any).type}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={()=>duplicateNode(node.id)}><Copy size={14}/></Button>
          <Button variant="ghost" size="icon" onClick={()=>deleteNode(node.id)}><Trash2 size={14}/></Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Context edges */}
        <div className="text-[11px] text-zinc-500">Connected: {edges.filter(e=>e.source===node.id||e.target===node.id).length} • Version {(node.data as any).version}</div>

        <NodeForm node={node} onChange={(patch: Record<string,unknown>)=>updateNodeData(node.id, patch)} onAI={runAI} aiLoading={aiLoading} aiError={aiError} />

        <Versioning node={node} />
      </div>

      <div className="p-3 border-t border-zinc-800">
        <ProviderSettings />
      </div>
    </div>
  );
}

function NodeForm({ node, onChange, onAI, aiLoading, aiError }: any){
  const type = (node.data as any).type;
  const d = (node.data as any).data;

  if (type==="brief") return (
    <div className="space-y-3">
      <Field label="Project Name"><Input value={d.projectName||""} onChange={e=>onChange({projectName:e.target.value})} placeholder="Aureum"/></Field>
      <Field label="Client"><Input value={d.client||""} onChange={e=>onChange({client:e.target.value})} /></Field>
      <div className="grid grid-cols-2 gap-2"><Field label="Industry"><Input value={d.industry||""} onChange={e=>onChange({industry:e.target.value})} /></Field><Field label="Deadline"><Input value={d.deadline||""} onChange={e=>onChange({deadline:e.target.value})} /></Field></div>
      <Field label="Problem"><Textarea value={d.problem||""} onChange={e=>onChange({problem:e.target.value})} /></Field>
      <Field label="Objective"><Textarea value={d.objective||""} onChange={e=>onChange({objective:e.target.value})} /></Field>
      <Field label="Audience"><Input value={d.audience||""} onChange={e=>onChange({audience:e.target.value})} /></Field>
      <Field label="Deliverables"><Input value={d.deliverables||""} onChange={e=>onChange({deliverables:e.target.value})} /></Field>
      <Field label="Constraints"><Input value={d.constraints||""} onChange={e=>onChange({constraints:e.target.value})} /></Field>
      <Button onClick={()=>onAI(`Generate brand strategy from brief: ${JSON.stringify(d)}. Include positioning, mission, values, promise, pillars.`)} disabled={aiLoading} className="w-full bg-violet-600 hover:bg-violet-700 text-white">{aiLoading?"Generating...":<><Sparkles size={14} className="mr-1"/> Generate Strategy</>}</Button>
      {aiError && <ErrorBox msg={aiError}/>}
    </div>
  );
  if (type==="strategy") return (
    <div className="space-y-3">
      <Textarea value={d.output||""} onChange={e=>onChange({output:e.target.value})} placeholder="Strategy output…" rows={10}/>
      <Button variant="sub" className="w-full" onClick={()=>onAI(`Expand brand strategy for ${d.output||"premium fintech"} with positioning, mission, vision, values, promise, personality, differentiation`, "You are a senior brand strategist.")} disabled={aiLoading}>{aiLoading?"...":"Generate Strategy"}</Button>
      {aiError && <ErrorBox msg={aiError}/>}
    </div>
  );
  if (type==="audience") return (
    <div className="space-y-3">
      <Textarea value={d.output||""} onChange={e=>onChange({output:e.target.value})} rows={10}/>
      <Button variant="sub" className="w-full" onClick={()=>onAI(`Generate audience personas: demographics, psychographics, needs, pains, motivations, behaviors for premium fintech`)} disabled={aiLoading}>Generate Audience</Button>
      {aiError && <ErrorBox msg={aiError}/>}
    </div>
  );
  if (type==="creativeDirection") return (
    <div className="space-y-3">
      {d.directions?.map((dir:any,i:number)=>(
        <div key={i} className="p-2 rounded border border-zinc-800 bg-zinc-900/50">
          <div className="text-sm font-semibold">{dir.name}</div><div className="text-xs text-zinc-400">{dir.concept}</div>
        </div>
      ))}
      {d.raw && <pre className="text-xs bg-zinc-900 p-2 rounded border border-zinc-800 whitespace-pre-wrap">{d.raw}</pre>}
      <Button className="w-full bg-violet-600 text-white" onClick={()=>onAI(`Generate 3 creative directions for premium fintech. Each with name, concept, mood, visual language, typography, color, photography, graphic style, AI prompt. Return JSON array.`)} disabled={aiLoading}>{aiLoading?"Generating...":"Generate 3 Directions"}</Button>
      {aiError && <ErrorBox msg={aiError}/>}
    </div>
  );
  if (type==="moodboard") return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {d.images?.map((src:string,i:number)=>(
          <div key={i} className="relative group">
            <img src={src} alt="" className="rounded border border-zinc-800 aspect-[4/3] object-cover w-full" />
            <button onClick={()=>onChange({images: (d.images as string[]).filter((_:string,idx:number)=> idx!==i)})} className="absolute top-1 right-1 bg-black/70 text-white rounded px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
      <Input placeholder="Paste image URL and press Enter" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>)=>{
        const t = e.target as HTMLInputElement;
        if(e.key==="Enter" && t.value.trim()){ onChange({images:[...((d.images as string[])||[]), t.value.trim()]}); t.value=""; }
      }} />
      <label className="block">
        <span className="text-xs text-zinc-400">Upload (stored as dataURL — survives reload)</span>
        <input type="file" accept="image/*" multiple onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
          const files = Array.from(e.target.files||[]);
          if (!files.length) return;
          const maxBytes = 700_000; // guard localStorage quota per image
          files.forEach((f: File)=>{
            if (f.size > 2_500_000) { alert(`${f.name} too large (>2.5MB). Compress first.`); return; }
            const reader = new FileReader();
            reader.onload = ()=>{
              const dataUrl = reader.result as string;
              if (dataUrl.length > maxBytes * 1.4) { alert(`${f.name} would exceed storage. Use URL instead.`); return; }
              const current = (d.images as string[]) || [];
              onChange({images:[...current, dataUrl]});
            };
            reader.readAsDataURL(f);
          });
          e.target.value = "";
        }} className="block w-full text-xs mt-1 file:mr-2 file:rounded file:border file:border-zinc-700 file:bg-zinc-900 file:px-2 file:py-1 file:text-xs" />
      </label>
      <Textarea value={(d.notes as string)||""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>onChange({notes:e.target.value})} placeholder="Notes, palette, references…" />
    </div>
  );
  if (type==="colorSystem") return (
    <div className="space-y-2">
      {d.colors?.map((c:any,i:number)=>(
        <div key={i} className="flex gap-2 items-center">
          <input type="color" value={c.hex} onChange={e=>{
            const next=[...d.colors]; next[i]={...next[i], hex:e.target.value}; onChange({colors:next});
          }} className="w-8 h-8 rounded bg-transparent border border-zinc-800" />
          <Input value={c.name} onChange={e=>{const n=[...d.colors]; n[i]={...n[i], name:e.target.value}; onChange({colors:n});}} className="flex-1" />
          <Input value={c.hex} onChange={e=>{const n=[...d.colors]; n[i]={...n[i], hex:e.target.value}; onChange({colors:n});}} className="w-[110px]" />
        </div>
      ))}
      <Button variant="sub" size="sm" onClick={()=>onChange({colors:[...d.colors, {name:"New",hex:"#6366f1",role:"accent"}]})}>Add color</Button>
    </div>
  );
  if (type==="typography") return (
    <div className="space-y-3">
      <Field label="Primary"><Input value={d.primary} onChange={e=>onChange({primary:e.target.value})}/></Field>
      <Field label="Secondary"><Input value={d.secondary} onChange={e=>onChange({secondary:e.target.value})}/></Field>
      <Field label="Display"><Input value={d.display} onChange={e=>onChange({display:e.target.value})}/></Field>
      <Field label="Body"><Input value={d.body} onChange={e=>onChange({body:e.target.value})}/></Field>
      <Field label="Hierarchy"><Textarea value={d.hierarchy} onChange={e=>onChange({hierarchy:e.target.value})}/></Field>
    </div>
  );
  if (type==="imageGen") return (
    <div className="space-y-3">
      <Field label="Prompt"><Textarea value={d.prompt||""} onChange={e=>onChange({prompt:e.target.value})} placeholder="minimalist editorial…" rows={3}/></Field>
      <Field label="Negative"><Input value={d.negativePrompt||""} onChange={e=>onChange({negativePrompt:e.target.value})} /></Field>
      <div className="grid grid-cols-2 gap-2"><Field label="Aspect"><select value={d.aspect||"1:1"} onChange={e=>onChange({aspect:e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2 text-sm"><option>1:1</option><option>16:9</option><option>9:16</option><option>4:3</option></select></Field><Field label="Model"><Input value={d.model||"mock"} onChange={e=>onChange({model:e.target.value})} /></Field></div>
      {d.output && <img src={d.output} className="rounded border border-zinc-800 w-full" />}
      <Button className="w-full bg-violet-600 text-white" onClick={async()=>{
        // Mock image generation: use placeholder with prompt hash
        const seed = Math.random().toString(36).slice(2,7);
        const url = `https://picsum.photos/seed/${encodeURIComponent((d.prompt||"aureum").slice(0,20)+seed)}/600/600`;
        onChange({output:url, _status:"completed"});
      }}>Generate Image</Button>
      <p className="text-[11px] text-zinc-500">Provider-agnostic. Configure local SD / ComfyUI endpoint in Settings for real generation.</p>
    </div>
  );
  if (type==="copy") return (
    <div className="space-y-3">
      <Textarea value={d.output||d.body||""} onChange={e=>onChange({output:e.target.value})} rows={10}/>
      <Button variant="sub" className="w-full" onClick={()=>onAI(`Generate headlines, taglines, body copy, CTAs for premium fintech brand Aureum. Tone: quiet luxury, editorial.`)} disabled={aiLoading}>Generate Copy</Button>
      {aiError && <ErrorBox msg={aiError}/>}
    </div>
  );
  if (type==="logoConcept") return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-500">Concept images (not final vector). Distinguish concept vs editable vector.</div>
      <Textarea value={d.note||""} onChange={e=>onChange({note:e.target.value})} placeholder="Direction notes…" />
      <ul className="text-sm list-disc pl-4 text-zinc-300">{d.concepts?.map((c:string,i:number)=><li key={i}>{c}</li>)}</ul>
    </div>
  );
  if (type==="social") return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-400">Formats: {d.formats?.join(", ")}</div>
      <Input value={d.formats?.join(", ")} onChange={e=>onChange({formats:e.target.value.split(",").map((s:string)=>s.trim())})} />
      <div className="grid grid-cols-3 gap-2">{Array.from({length:d.variations||3}).map((_,i)=>(<div key={i} className="aspect-square rounded bg-zinc-900 border border-zinc-800 grid place-items-center text-[10px] text-zinc-500">Var {i+1}</div>))}</div>
    </div>
  );
  if (type==="presentation") return (
    <div className="space-y-2">
      {d.slides?.map((s:string,i:number)=><div key={i} className="px-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-sm flex justify-between"><span>{i+1}. {s}</span><span className="text-zinc-500 text-xs">{i===0?"Cover":""}</span></div>)}
    </div>
  );
  if (type==="critique") return (
    <div className="space-y-3">
      <Textarea value={d.text||""} onChange={e=>onChange({text:e.target.value})} rows={10} placeholder="Critique will appear here…" />
      <Button variant="sub" className="w-full" onClick={()=>onAI(`Critique this design: hierarchy, composition, typography, color, brand consistency, accessibility. Score + problems + recommendations.`, "You are a senior art director.")} disabled={aiLoading}>Run Critique</Button>
      {aiError && <ErrorBox msg={aiError}/>}
    </div>
  );
  if (type==="research") return (
    <div className="space-y-3">
      <Field label="Industry"><Input value={d.industry||""} onChange={e=>onChange({industry:e.target.value})} /></Field>
      <Field label="Competitors"><Textarea value={d.competitors||""} onChange={e=>onChange({competitors:e.target.value})} /></Field>
      <Field label="Keywords"><Input value={d.keywords||""} onChange={e=>onChange({keywords:e.target.value})} /></Field>
      <Button variant="sub" className="w-full" onClick={()=>onAI(`Analyze research: ${JSON.stringify(d)}`)} disabled={aiLoading}>Analyze</Button>
      {aiError && <ErrorBox msg={aiError}/>}
    </div>
  );
  if (type==="export") return (
    <div className="space-y-3 text-sm text-zinc-400">
      <div>Formats: {d.formats?.join(", ")}</div>
      <div className="text-xs">Use Top Bar → Export to download project JSON. Add PNG/PDF export per node via properties.</div>
    </div>
  );
  if (type==="aiAssistant") return (
    <div className="space-y-3">
      <div className="text-xs text-zinc-500">The AI Director understands project context, brand, and connected nodes.</div>
      <Textarea placeholder="Ask: Make this more premium / Generate 5 alternatives / Why is this weak?" id="aiAsk"/>
      <Button className="w-full bg-violet-600 text-white" onClick={()=>{
        const el = document.getElementById("aiAsk") as HTMLTextAreaElement;
        if (el) onAI(el.value || "Give me three stronger directions");
      }} disabled={aiLoading}>Ask Director</Button>
      {aiError && <ErrorBox msg={aiError}/>}
    </div>
  );
  return <div className="text-sm text-zinc-500">No editor for {type}. Data: <pre className="text-xs whitespace-pre-wrap bg-zinc-900 p-2 rounded">{JSON.stringify(d,null,2).slice(0,600)}</pre></div>;
}

function Versioning({ node }: { node: { id: string; data: unknown } }){
  const branchVersion = useCanvasStore(s=>s.branchVersion);
  const restoreVersion = useCanvasStore(s=>s.restoreVersion);
  const cur = node.data as { version: number; versions: { id:string; label:string; createdAt:string; data: unknown }[] };
  const [open, setOpen] = useState(false);
  return (
    <div className="pt-3 border-t border-zinc-800 space-y-2">
      <div className="text-[11px] tracking-widest font-bold text-zinc-500">VERSIONING</div>
      <div className="flex gap-1">
        <Button variant="sub" size="sm" onClick={()=> branchVersion(node.id)}><Layers size={12} className="mr-1"/> Branch v{cur.version+1}</Button>
        <Button variant="ghost" size="sm" onClick={()=> setOpen(v=>!v)}><History size={12} className="mr-1"/> History {cur.versions?.length || 0}</Button>
      </div>
      {cur.versions?.length>0 && <div className="text-xs text-zinc-500">{cur.versions.map((v)=>v.label).join(" • ")}</div>}
      {open && cur.versions?.length>0 && (
        <div className="space-y-1 max-h-40 overflow-auto border border-zinc-800 rounded p-2 bg-zinc-900/40">
          {cur.versions.map(v=>(
            <div key={v.id} className="flex items-center justify-between text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
              <span>{v.label} • {new Date(v.createdAt).toLocaleTimeString()}</span>
              <button onClick={()=> restoreVersion(node.id, v.id)} className="text-violet-400 hover:text-violet-300">Restore</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }){ return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
function ErrorBox({msg}:{msg:string}){ return <div className="text-xs text-red-400 bg-red-950/30 border border-red-900 rounded p-2">{msg}</div>; }

function InspectorEmpty(){
  const gen = useCanvasStore(s=>s.generationHistory);
  return (
    <div className="w-[340px] shrink-0 border-l border-zinc-800 bg-[#0f0f12] flex flex-col">
      <div className="p-3 border-b border-zinc-800 font-semibold text-sm">Inspector</div>
      <div className="p-6 text-center text-sm text-zinc-500">Select a node to edit its properties. <br/>Tip: Drag from handle to connect.</div>
      <div className="flex-1 overflow-auto p-3 space-y-3">
        <div className="text-[11px] tracking-widest font-bold text-zinc-500">GENERATION HISTORY</div>
        {gen.length===0? <div className="text-xs text-zinc-600">No generations yet. Configure AI provider and generate.</div> : gen.slice(0,12).map(g=>(
          <div key={g.id} className="p-2 rounded border border-zinc-800 bg-zinc-900/40">
            <div className="text-xs font-medium truncate">{g.provider} • {g.prompt.slice(0,60)}</div>
            <div className="text-[11px] text-zinc-500 truncate">{new Date(g.createdAt).toLocaleString()}</div>
            <div className="text-xs text-zinc-300 whitespace-pre-wrap line-clamp-3 mt-1">{g.output.slice(0,200)}</div>
          </div>
        ))}
        <ProviderSettings />
      </div>
    </div>
  );
}

function ProviderSettings(){
  const [cfg, setCfg] = useState(()=>loadProviderConfig());
  return (
    <div className="space-y-2 border-t border-zinc-800 pt-3">
      <div className="flex items-center gap-1 text-xs font-bold tracking-widest text-zinc-500"><Settings2 size={12}/> AI PROVIDER</div>
      <select value={cfg.activeId} onChange={e=>{ const n={...cfg, activeId:e.target.value}; setCfg(n); saveProviderConfig(n); }} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-sm">
        <option value="mock">Mock (Demo — offline)</option>
        <option value="openai-compatible">OpenAI Compatible</option>
        <option value="local">Local (Custom endpoint)</option>
      </select>
      {cfg.activeId==="openai-compatible" && (
        <div className="space-y-1">
          <Input placeholder="Base URL" value={cfg.openAI.baseUrl} onChange={e=>{ const n={...cfg, openAI:{...cfg.openAI, baseUrl:e.target.value}}; setCfg(n); saveProviderConfig(n); }} />
          <Input placeholder="API Key (stored locally)" type="password" value={cfg.openAI.apiKey} onChange={e=>{ const n={...cfg, openAI:{...cfg.openAI, apiKey:e.target.value}}; setCfg(n); saveProviderConfig(n); }} />
          <div className="grid grid-cols-2 gap-1"><Input placeholder="Text model" value={cfg.openAI.textModel} onChange={e=>{ const n={...cfg, openAI:{...cfg.openAI, textModel:e.target.value}}; setCfg(n); saveProviderConfig(n); }} /><Input placeholder="Image model" value={cfg.openAI.imageModel} onChange={e=>{ const n={...cfg, openAI:{...cfg.openAI, imageModel:e.target.value}}; setCfg(n); saveProviderConfig(n); }} /></div>
          <div className="text-[11px] text-zinc-500">Use OpenAI, Groq, Ollama (http://localhost:11434/v1), LM Studio, etc.</div>
        </div>
      )}
      {cfg.activeId==="local" && <div className="text-xs text-zinc-500">Set endpoint in OpenAI-Compatible mode to http://localhost:11434/v1<br/>Model: e.g. llama3.1, qwen2</div>}
    </div>
  );
}
