import { cn } from "@/lib/utils";
export function Input(props:any){ return <input className={cn("w-full bg-[#0f0f12] border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-600", props.className)} {...props} /> }
export function Textarea(props:any){ return <textarea className={cn("w-full bg-[#0f0f12] border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-600 min-h-[72px]", props.className)} {...props} /> }
export function Label(props:any){ return <label className={cn("text-[11px] tracking-widest uppercase font-semibold text-zinc-500", props.className)} {...props} /> }
