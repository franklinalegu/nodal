"use client";
import JSZip from "jszip";

export type ExportPayload = {
  projectName: string;
  nodes: unknown[];
  edges: unknown[];
  generationHistory: unknown[];
  brand?: unknown;
  exportedAt: string;
};

function slug(n: string) { return n.replace(/\W+/g, "_").toLowerCase().replace(/^_+|_+$/g, "") || "project"; }

export async function exportProjectZip(payload: ExportPayload): Promise<void> {
  const zip = new JSZip();
  const root = slug(payload.projectName);

  // project.json at root
  zip.file(`${root}/project.json`, JSON.stringify(payload, null, 2));

  // brand/brand.json
  const brandFolder = zip.folder(`${root}/brand`)!;
  const brandNode = (payload.nodes as { data?: { type?: string; data?: unknown } }[]).find(n => n.data?.type === "colorSystem" || n.data?.type === "typography");
  brandFolder.file("brand.json", JSON.stringify({
    project: payload.projectName,
    brand: brandNode?.data ?? null,
    colors: (payload.nodes as { data?: { type?: string; data?: { colors?: unknown } } }[]).find(n=> n.data?.type==="colorSystem")?.data?.data ?? null,
    typography: (payload.nodes as { data?: { type?: string; data?: unknown } }[]).find(n=> n.data?.type==="typography")?.data?.data ?? null,
    exportedAt: payload.exportedAt,
  }, null, 2));

  // assets/ — list + placeholder for dataURL images
  const assetsFolder = zip.folder(`${root}/assets`)!;
  const moodboard = (payload.nodes as { data?: { type?: string; data?: { images?: string[] } } }[]).find(n=> n.data?.type==="moodboard");
  const images = moodboard?.data?.data?.images ?? [];
  if (images.length) {
    assetsFolder.file("assets.json", JSON.stringify({ images, count: images.length }, null, 2));
    // Note: dataURLs are inside project.json; for true files Tauri will write fs files.
    assetsFolder.file("README.txt", "Images are stored as dataURLs in project.json. In Tauri builds, /assets contains real files.");
  } else {
    assetsFolder.file("README.txt", "No assets in this export. Add images to Moodboard.");
  }

  // workflows/workflows.json — node graph + edges
  const wfFolder = zip.folder(`${root}/workflows`)!;
  wfFolder.file("workflows.json", JSON.stringify({
    name: `${payload.projectName} workflow`,
    nodes: payload.nodes,
    edges: payload.edges,
    exportedAt: payload.exportedAt,
  }, null, 2));

  // exports/ — placeholder for PNG/PDF/SVG (generated per node in future)
  const expFolder = zip.folder(`${root}/exports`)!;
  expFolder.file("README.txt", [
    "Exports folder for rendered outputs.",
    "PNG/JPG/SVG/PDF per node will be written here.",
    "Use per-node Export action or canvas screenshot.",
    `Generated: ${payload.exportedAt}`,
  ].join("\n"));

  // Also include generationHistory
  zip.file(`${root}/generation_history.json`, JSON.stringify(payload.generationHistory, null, 2));

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${root}.zip`; a.click();
  URL.revokeObjectURL(url);

  // Also download single project.json for quick import
  const singleBlob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  // Not auto-downloading twice to avoid spam; keep zip as primary
}

export async function exportCanvasPng(): Promise<void> {
  // Future: use html2canvas on .react-flow__viewport
  const el = document.querySelector(".react-flow__viewport") as HTMLElement | null;
  if (!el) { alert("Canvas not ready"); return; }
  // Fallback zip already covers project; PNG export via screenshot later
  alert("PNG export: Use browser screenshot or future canvas export. Project ZIP already downloaded with full structure.");
}
