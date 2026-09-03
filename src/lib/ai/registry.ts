import { AIProvider, LocalProvider, MockProvider, OpenAICompatibleProvider } from "./providers";

export type ProviderConfig = {
  activeId: string;
  openAI: { baseUrl:string; apiKey:string; textModel:string; imageModel:string; temperature:number };
};

const defaultConfig: ProviderConfig = {
  activeId: "mock",
  openAI: {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    textModel: "gpt-4o-mini",
    imageModel: "dall-e-3",
    temperature: 0.7,
  }
};

export function loadProviderConfig(): ProviderConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const raw = localStorage.getItem("cc_provider_config");
    if (raw) return { ...defaultConfig, ...JSON.parse(raw), openAI: { ...defaultConfig.openAI, ...JSON.parse(raw).openAI } };
  } catch {}
  return defaultConfig;
}
export function saveProviderConfig(c: ProviderConfig) {
  localStorage.setItem("cc_provider_config", JSON.stringify(c));
}

export function getProvider(config?: ProviderConfig): AIProvider {
  const cfg = config || loadProviderConfig();
  if (cfg.activeId === "openai-compatible") return new OpenAICompatibleProvider({ baseUrl: cfg.openAI.baseUrl, apiKey: cfg.openAI.apiKey, textModel: cfg.openAI.textModel, imageModel: cfg.openAI.imageModel });
  if (cfg.activeId === "local") return new LocalProvider();
  return new MockProvider();
}
