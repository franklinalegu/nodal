/**
 * Storage abstraction — 100% local.
 * Today: localStorage. Tomorrow: Tauri fs + SQLite when localStorage hits limits.
 * Usage: storage.saveProject() / loadProject() — store never touches window directly.
 */
export type PersistedProject = {
  nodes: unknown[];
  edges: unknown[];
  projectName: string;
  generationHistory: unknown[];
  updatedAt: string;
  v: number;
};

const CANVAS_KEY = "cc_canvas_v1";
const PROJECT_DIR_KEY = "cc_project_dir"; // future Tauri dir

// --- Environment detection ---
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function isLocalStorageAvailable(): boolean {
  try {
    const k = "__cc_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch { return false; }
}

// --- Current impl: localStorage ---
export const storage = {
  async saveProject(payload: PersistedProject): Promise<void> {
    if (isTauri()) {
      try {
        const { saveViaTauri } = await import("./tauriStorage");
        return saveViaTauri(payload);
      } catch { /* fall through to localStorage */ }
    }
    const serialized = JSON.stringify(payload);
    if (serialized.length > 4_500_000) {
      console.warn("[storage] Project near 5MB localStorage quota. Export JSON backup and consider Tauri build.");
    }
    localStorage.setItem(CANVAS_KEY, serialized);
  },

  async loadProject(): Promise<PersistedProject | null> {
    if (isTauri()) {
      try {
        const { loadViaTauri } = await import("./tauriStorage");
        const t = await loadViaTauri();
        if (t) return t;
      } catch { /* fall through */ }
    }
    const raw = localStorage.getItem(CANVAS_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as PersistedProject; } catch { return null; }
  },

  async exportBackup(payload: PersistedProject, fileName: string): Promise<void> {
    if (isTauri()) {
      try {
        const { exportViaTauri } = await import("./tauriStorage");
        await exportViaTauri(payload, fileName);
        return;
      } catch {}
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  },

  getProjectDir(): string | null {
    try { return localStorage.getItem(PROJECT_DIR_KEY); } catch { return null; }
  },
  setProjectDir(dir: string) {
    try { localStorage.setItem(PROJECT_DIR_KEY, dir); } catch {}
  },
};

export const STORAGE_QUOTA_RECOMMENDATION = 4_500_000;
