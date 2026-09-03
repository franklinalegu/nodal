# Privacy — 100% Local

Creative Canvas is a **private, local-first** application. Not SaaS. Not commercial.

- **No telemetry, no analytics, no tracking.**
- **No cloud sync.** Projects live in `localStorage` today, `Tauri fs + SQLite` tomorrow (see `src/lib/storage/`).
- **No data leaves device** unless you explicitly configure an AI provider in Settings → AI Provider.
  - Mock provider: fully offline, no network.
  - OpenAI-Compatible: only the prompt you send leaves device, to the endpoint you configured (e.g., `https://api.openai.com`, `http://localhost:11434`). Configure local Ollama/LM Studio to keep even AI local.
- **API keys** stored in `localStorage cc_provider_config` today; Tauri build will move to OS keychain (encrypted) later. Never committed, never sent anywhere else.
- **Images**: uploaded as `dataURL` in localStorage; large files should be referenced via local path in Tauri build to avoid quota.
- **Exports**: JSON written to your chosen folder locally.

License: `UNLICENSED — Private Use Only. All Rights Reserved.`
