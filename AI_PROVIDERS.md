# AI Providers

## Abstraction
`src/lib/ai/providers.ts` defines `AIProvider`. All nodes call `getProvider().generateText(...)`.

## Providers
1. **Mock (Demo)** — default, offline. Deterministic responses for strategy/audience/copy/critique. Use without keys.
2. **OpenAI Compatible** — works with OpenAI, Groq, Together, OpenRouter, Ollama, LM Studio.
3. **Local** — placeholder that errors with hint to use OpenAI-Compatible pointing to `http://localhost:11434/v1`.

## Configure
Right Panel → AI PROVIDER dropdown.
- Select `OpenAI Compatible` → set Base URL, API Key (stored in localStorage `cc_provider_config`, never committed), Text Model, Image Model.
- Temperature slider future; currently 0.7.

Examples:
- Ollama: Base `http://localhost:11434/v1`, Model `llama3.1`, Key `ollama`
- LM Studio: Base `http://localhost:1234/v1`, Model `local-model`
- OpenAI: Base `https://api.openai.com/v1`, Model `gpt-4o-mini`

## Adding a Provider
1. Create class implementing `AIProvider` in `providers.ts`.
2. Register in `registry.ts` `getProvider` switch.
3. Add UI in `RightPanel.ProviderSettings`.

## Security
- Keys in localStorage only, never in code.
- `.env.example` provided; `.env.local` gitignored.
- Server routes should proxy keys if added later — never expose in client fetch unless user opts in.
