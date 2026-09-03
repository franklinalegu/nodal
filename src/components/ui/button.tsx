import { cn } from "@/lib/utils";
export function Button({ className, variant="default", size="default", ...props }: any){
  const v = {
    default:"bg-white text-black hover:bg-zinc-200",
    ghost:"bg-transparent hover:bg-zinc-900 text-zinc-300",
    outline:"border border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-200",
    sub:"bg-[#1a1a1e] hover:bg-zinc-800 text-zinc-200 border border-zinc-800",
  }[variant] || "";
  const s = { default:"h-8 px-3 text-[13px]", sm:"h-7 px-2 text-xs", lg:"h-9 px-4 text-sm", icon:"h-8 w-8 p-0" }[size] || "";
  return <button className={cn("inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50", v, s, className)} {...props} />
}
