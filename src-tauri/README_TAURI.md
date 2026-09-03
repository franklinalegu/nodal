# Tauri — 100% Local Desktop

This app is **private, not commercial**. Tauri keeps everything on-device.

## When to enable
localStorage is ~5 MB. When your moodboards + generations exceed it, enable Tauri.

## Install Rust + Tauri CLI (Windows)
```powershell
winget install Rustlang.Rustup
rustup update
cargo install tauri-cli
# or: npm install -D @tauri-apps/cli
```

## Init (if src-tauri not yet Cargo inited)
```powershell
npx tauri init --ci
# productName: Creative Canvas
# identifier: com.creativecanvas.app
# devPath: http://localhost:3000
# distDir: ../out
```

## Add plugins (when you outgrow localStorage)
```powershell
cargo add tauri-plugin-fs tauri-plugin-dialog tauri-plugin-sql tauri-plugin-store
npm install @tauri-apps/plugin-fs @tauri-apps/plugin-dialog @tauri-apps/plugin-sql
```

## Build
```powershell
npm run build        # Next.js static export (set output: export in next.config)
npx tauri dev        # desktop dev
npx tauri build      # installer in src-tauri/target/release/bundle
```

## Storage migration
1. First Tauri launch: `src/lib/storage/tauriStorage.ts:migrateLocalStorageToTauri()` auto-runs.
2. Existing `cc_canvas_v1` stays as backup.
3. Future saves go to `$APPDATA/creative-canvas/projects/current.json` + SQLite `canvas.db` (see `prisma/schema.prisma`).

No data leaves device. API keys stay in OS keychain (future: `tauri-plugin-store` encrypted).
