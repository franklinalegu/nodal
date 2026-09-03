export interface AIProvider {
  id: string;
  name: string;
  generateText(opts: { prompt:string; system?:string; temperature?:number; maxTokens?:number }): Promise<{ text:string; model:string }>;
  generateImage?(opts: { prompt:string; negativePrompt?:string; width?:number; height?:number; model?:string }): Promise<{ url:string; seed?:string }>;
  analyzeImage?(opts: { image:string; prompt:string }): Promise<{ text:string }>;
  critiqueDesign?(opts: { context:string }): Promise<{ text:string }>;
}

export class LocalProvider implements AIProvider {
  id = "local"; name = "Local (Unavailable)";
  async generateText(_opts: { prompt:string; system?:string; temperature?:number; maxTokens?:number }): Promise<{ text:string; model:string }> { throw new Error("Local provider not configured. Set an OpenAI-compatible endpoint in Settings (e.g. http://localhost:11434)."); }
  async generateImage(_opts: { prompt:string }): Promise<{ url:string; seed?:string }> { throw new Error("Local image provider not configured."); }
}

export class OpenAICompatibleProvider implements AIProvider {
  id = "openai-compatible"; name = "OpenAI Compatible";
  constructor(private config: { baseUrl:string; apiKey?:string; textModel:string; imageModel?:string }) {}
  async generateText(opts: { prompt:string; system?:string; temperature?:number; maxTokens?:number }) {
    const url = `${this.config.baseUrl.replace(/\/$/,"")}/chat/completions`;
    const headers: Record<string,string> = { "Content-Type":"application/json" };
    if (this.config.apiKey) headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    const res = await fetch(url, {
      method:"POST", headers,
      body: JSON.stringify({
        model: this.config.textModel || "gpt-4o-mini",
        messages: [
          ...(opts.system ? [{role:"system", content: opts.system}] : []),
          {role:"user", content: opts.prompt}
        ],
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 800,
      })
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI provider error ${res.status}: ${t.slice(0,300)}`);
    }
    const j = await res.json();
    const text = j.choices?.[0]?.message?.content || j.choices?.[0]?.text || "";
    return { text, model: this.config.textModel };
  }
  async generateImage(opts: { prompt:string; negativePrompt?:string; width?:number; height?:number; model?:string }): Promise<{ url:string; seed?:string }> {
    throw new Error("Image generation requires image model configuration. Using text generation: " + opts.prompt.slice(0,40));
  }
}

export class MockProvider implements AIProvider {
  id = "mock"; name = "Mock (Demo)";
  async generateText(opts: { prompt:string }) {
    await new Promise(r=>setTimeout(r, 900));
    // Deterministic mock based on prompt keywords
    const p = opts.prompt.toLowerCase();
    if (p.includes("strategy")) return { text: `**Positioning:** Premium, minimalist fintech for founders.\n**Mission:** Make money feel calm.\n**Values:** Clarity, Trust, Precision.\n**Promise:** Your money, finally designed.\n**Pillars:** 1) Radical Simplicity 2) Editorial Trust 3) Quiet Luxury`, model:"mock" };
    if (p.includes("creative direction")) return { text: JSON.stringify([
      { name:"Quiet Luxury", concept:"Editorial minimalism with Swiss grids", mood:"Calm, premium, trustworthy", visual:"Monochrome + single accent", typography:"Neue Haas Grotesk + Editorial Serif", color:"#0a0a0a + #f4f1ea + #6366f1", photography:"High contrast B&W portraits, soft film grain", graphic:"Thin lines, brutalist borders", prompt:"minimalist fintech brand, swiss grid, premium editorial" },
      { name:"Neo Bauhaus", concept:"Geometric, primary, bold", mood:"Confident, systematic", visual:"Grid, shapes", typography:"Space Grotesk", color:"#ff3b30 + #0a0a0a", photography:"Geometric still life", graphic:"Blocks, duotone", prompt:"bauhaus fintech, bold geometry" },
      { name:"Human Fintech", concept:"Warm, organic, approachable", mood:"Friendly, inclusive", visual:"Rounded, soft gradients", typography:"Inter + Fraunces", color:"#fef08a + #1a1a1e", photography:"Lifestyle, warm light", graphic:"Rounded cards", prompt:"warm human fintech, friendly premium" },
    ], null, 2), model:"mock" };
    if (p.includes("audience")) return { text: `Demographics: 28-42, founders/operators, urban\nPsychographics: Design-aware, skeptical of banks\nNeeds: Clarity, control, speed\nPain: Complexity, hidden fees\nMotivations: Autonomy, status of taste\nBehaviors: Pays for premium tools, reads editorial`, model:"mock" };
    if (p.includes("copy") || p.includes("headline")) return { text: `Headlines:\n1. Money, designed.\n2. Your capital. Calmer.\n3. The quiet bank.\n\nTagline: Clarity is the new wealth.\nBody: A premium financial OS for founders who value time and taste.\nCTAs: Open account → / See how it works`, model:"mock" };
    if (p.includes("critique")) return { text: `Score: 7.2/10\nHierarchy: 7 — Increase contrast on secondary CTA.\nTypography: 8 — Tighten leading to 1.4.\nColor: 6 — Accent overused, limit to 8% surface.\nBrand: 8 — Consistent voice.\nRecommendations: Add breathing room (32px), use mono for numbers, test at 320px.`, model:"mock" };
    return { text: `Generated response for:\n> ${opts.prompt.slice(0,220)}\n\n[Mock] Configure an AI provider in Settings → AI Providers to get live generations. This deterministic mock lets you test workflows offline.`, model:"mock" };
  }
}
