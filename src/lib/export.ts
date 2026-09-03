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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 2000);
}

async function captureViewport(): Promise<HTMLCanvasElement | null> {
  const viewport = document.querySelector(".react-flow__viewport") as HTMLElement | null;
  const container = document.querySelector(".react-flow") as HTMLElement | null;
  const target = container || viewport;
  if (!target) return null;
  const { default: html2canvas } = await import("html2canvas");
  // Ensure background for dark canvas
  const canvas = await html2canvas(target, {
    backgroundColor: "#08080a",
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
  });
  return canvas;
}

export async function exportCanvasPng(): Promise<void> {
  const canvas = await captureViewport();
  if (!canvas) { alert("Canvas not ready"); return; }
  canvas.toBlob(b => { if (b) downloadBlob(b, `${slug(document.title.replace("NODAL — ","")) || "nodal"}_canvas.png`); }, "image/png", 0.95);
}

export async function exportCanvasJpg(): Promise<void> {
  const canvas = await captureViewport();
  if (!canvas) { alert("Canvas not ready"); return; }
  // JPG needs opaque background
  const jpgCanvas = document.createElement("canvas");
  jpgCanvas.width = canvas.width; jpgCanvas.height = canvas.height;
  const ctx = jpgCanvas.getContext("2d")!;
  ctx.fillStyle = "#08080a"; ctx.fillRect(0,0,jpgCanvas.width, jpgCanvas.height);
  ctx.drawImage(canvas, 0, 0);
  jpgCanvas.toBlob(b => { if (b) downloadBlob(b, `${slug(document.title.replace("NODAL — ","")) || "nodal"}_canvas.jpg`); }, "image/jpeg", 0.92);
}

export async function exportCanvasSvg(): Promise<void> {
  const viewport = document.querySelector(".react-flow__viewport");
  if (!viewport) { alert("Canvas not ready"); return; }
  // Serialize nodes/edges as SVG placeholder + embed project meta
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
  <rect width="100%" height="100%" fill="#08080a"/>
  <text x="24" y="40" fill="#e8e8ea" font-family="Inter, sans-serif" font-size="22" font-weight="800">NODAL — ${document.title.replace("NODAL — ","")}</text>
  <text x="24" y="68" fill="#8a8a93" font-family="monospace" font-size="12">Exported ${new Date().toISOString()} — re-import project.json to restore full graph</text>
  <text x="24" y="96" fill="#6366f1" font-size="12">SVG is a placeholder for vector workflows. PNG/JPG capture the current viewport.</text>
</svg>`;
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${slug(document.title.replace("NODAL — ","")) || "nodal"}_canvas.svg`);
}

export async function exportCanvasPdf(): Promise<void> {
  const canvas = await captureViewport();
  if (!canvas) { alert("Canvas not ready"); return; }
  const { default: jsPDF } = await import("jspdf");
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "px", format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${slug(document.title.replace("NODAL — ","")) || "nodal"}_canvas.pdf`);
}

export async function exportFullBundleWithImage(payload: ExportPayload, format: "png"|"jpg"|"pdf"): Promise<void> {
  const zip = new JSZip();
  const root = slug(payload.projectName);
  zip.file(`${root}/project.json`, JSON.stringify(payload, null, 2));
  zip.file(`${root}/generation_history.json`, JSON.stringify(payload.generationHistory, null, 2));
  // try capture image
  const canvas = await captureViewport();
  if (canvas) {
    const blob: Blob | null = await new Promise(res=> canvas.toBlob(b=> res(b), format==="jpg" ? "image/jpeg" : "image/png", 0.92));
    if (blob) zip.file(`${root}/exports/canvas.${format}`, blob);
  }
  const out = await zip.generateAsync({ type:"blob", compression:"DEFLATE", compressionOptions:{level:6}});
  downloadBlob(out, `${root}_bundle_${format}.zip`);
}
