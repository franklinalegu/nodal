/**
 * Tauri storage adapter — PLACEHOLDER for desktop packaging.
 * When Tauri is added, these functions will use:
 *   - @tauri-apps/plugin-fs  -> write/read `$APPDATA/creative-canvas/projects/<id>.json`
 *   - @tauri-apps/plugin-sql -> SQLite at `$APPDATA/creative-canvas/canvas.db`
 *
 * Keep Next.js build working when Tauri is NOT installed: no top-level Tauri imports.
 * This file is only dynamically imported inside src/lib/storage/index.ts when isTauri() true.
 */
import type { PersistedProject } from "./index";

const TAURI_PROJECT_FILE = "projects/current.json";

async function invoke<T>(cmd: string, args?: unknown): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tauri = (window as unknown as { __TAURI__?: { invoke: (c:string, a?:unknown)=>Promise<T> } }).__TAURI__;
  if (!tauri?.invoke) throw new Error("Tauri not available");
  return tauri.invoke(cmd, args as never);
}

export async function saveViaTauri(payload: PersistedProject): Promise<void> {
  // Preferred: fs plugin
  try {
    await invoke("plugin:fs|write_file", { path: TAURI_PROJECT_FILE, contents: JSON.stringify(payload) });
    return;
  } catch {}
  // Fallback: SQL plugin
  try {
    await invoke("plugin:sql|execute", {
      query: "INSERT OR REPLACE INTO projects (id, data, updated_at) VALUES (?, ?, ?)",
      values: ["current", JSON.stringify(payload), payload.updatedAt],
    });
    return;
  } catch (e) {
    throw new Error(`Tauri save failed: ${String(e)}`);
  }
}

export async function loadViaTauri(): Promise<PersistedProject | null> {
  try {
    const text = await invoke<string>("plugin:fs|read_file", { path: TAURI_PROJECT_FILE });
    if (text) return JSON.parse(text) as PersistedProject;
  } catch {}
  try {
    const rows = await invoke<{ data: string }[]>("plugin:sql|select", {
      query: "SELECT data FROM projects WHERE id='current' LIMIT 1",
    });
    if (rows?.[0]?.data) return JSON.parse(rows[0].data) as PersistedProject;
  } catch {}
  return null;
}

export async function exportViaTauri(payload: PersistedProject, fileName: string): Promise<void> {
  // Let user pick dir via dialog, else write to Documents
  try {
    await invoke("plugin:fs|write_file", { path: `exports/${fileName}`, contents: JSON.stringify(payload, null, 2) });
    return;
  } catch (e) {
    throw new Error(`Tauri export failed: ${String(e)}`);
  }
}

// Migration helper: when switching from localStorage to Tauri, call once.
export async function migrateLocalStorageToTauri(): Promise<boolean> {
  try {
    const raw = localStorage.getItem("cc_canvas_v1");
    if (!raw) return false;
    const payload = JSON.parse(raw) as PersistedProject;
    await saveViaTauri(payload);
    // Keep localStorage as backup; don't delete automatically
    console.info("[tauriStorage] Migrated localStorage → Tauri");
    return true;
  } catch { return false; }
}
