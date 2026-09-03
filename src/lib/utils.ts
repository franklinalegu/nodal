export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
export const uid = () => Math.random().toString(36).slice(2, 9);
export const nid = (prefix="node") => `${prefix}_${uid()}_${Date.now().toString(36)}`;
