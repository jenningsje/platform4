import { Ollama } from "ollama";
import { Agent, fetch as undiciFetch } from "undici";
import * as fs from "fs";
import * as path from "path";

export type ModelInfo = {
  name: string;
  creator: string;
  platform: string;
  usage_link: string;
  citation: string;
  description: string;
  capabilities: string[];
  license: string;
  logo_png: string;
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const agent = new Agent({
  headersTimeout: FIVE_MINUTES_MS,
  bodyTimeout: FIVE_MINUTES_MS,
});

const customFetch: typeof fetch = (input, init) => {
  return undiciFetch(input, {
    ...init,
    dispatcher: agent,
  } as any) as unknown as Promise<Response>;
};

const ollamaHost = process.env.OLLAMA_HOST || 'http://host.docker.internal:11434';
const customOllama = new Ollama({ host: ollamaHost, fetch: customFetch });

export function saveModelCards(models: ModelInfo[], outputDir = "."): string[] {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return models.map((model, index) => {
    const fileName = `model_card${index + 1}.json`;
    const filePath = path.join(outputDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(model, null, 2), "utf-8");
    console.log(`Saved: ${filePath}`);
    return filePath;
  });
}

function extractArrayFromJSON(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;

  if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed as Record<string, unknown>;

    if (Array.isArray(obj.models)) return obj.models;
    if (Array.isArray(obj.response)) return obj.response;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj["["])) return obj["["];

    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        return obj[key] as unknown[];
      }
    }
  }

  return null;
}

function isBannedUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (host.includes("github.com") || host.includes("gitlab.com")) return true;
    if (host.includes("arxiv.org") || pathname.endsWith(".pdf")) return true;
    if (host.includes("biorxiv.org") || host.includes("medrxiv.org")) return true;

    return false;
  } catch {
    return true;
  }
}

async function verifyUrl(url: string, timeoutMs = 3000): Promise<boolean> {
  if (isBannedUrl(url)) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Model-Discovery-Validator)" },
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Model-Discovery-Validator)" },
      }).catch(() => null);
    }

    clearTimeout(timer);
    return res ? res.ok : false;
  } catch {
    return false;
  }
}

function cleanModels(models: unknown[]): ModelInfo[] {
  return models
    .filter(
      (m): m is Record<string, unknown> =>
        typeof m === "object" &&
        m !== null &&
        "name" in m &&
        "usage_link" in m
    )
    .map((m) => ({
      name: String(m.name ?? "").trim(),
      creator: String(m.creator ?? "").trim(),
      platform: String(m.platform ?? "").trim(),
      usage_link: String(m.usage_link ?? "").trim(),
      citation: String(m.citation ?? "").trim(),
      description: String(m.description ?? "").trim(),
      capabilities: Array.isArray(m.capabilities)
        ? m.capabilities.map(String)
        : [],
      license: String(m.license ?? "").trim(),
      logo_png: String(m.logo_png ?? "").trim(),
    }))
    .filter((m) => m.name.length > 0 && m.usage_link.length > 0);
}

async function validateAndFilterModels(models: ModelInfo[]): Promise<ModelInfo[]> {
  const checkResults = await Promise.all(
    models.map(async (m) => {
      const isValid = await verifyUrl(m.usage_link);
      return isValid ? m : null;
    })
  );

  return checkResults.filter((m): m is ModelInfo => m !== null);
}

export async function askOllama(prompt: string): Promise<ModelInfo[]> {
  const responseStream = await customOllama.chat({
    model: "granite3.1-dense",
    format: "json",
    stream: true,
    options: {
      temperature: 0,
    },
    messages: [
      {
        role: "user",
        content: `
i need you to generate a list of ai models that satisfy the following criteria the usage link must give me the link to the gui for example: https://gemini.google.com/app, https://grok.com/chat, https://chatgpt.com/, https://phet.colorado.edu/sims/html/models-of-the-hydrogen-atom/latest/models-of-the-hydrogen-atom_all.html, https://deepai.org/machine-learning-model/text2img, https://duckduckgo.com/?extensioninstalled=1 search for such links online and test the connection to see if they work before including them if the connection fails do not include that entry,

STRICT RULES:

1. Only provide models that can actually be accessed and used.
2. Only provide direct links where the user can use, run, download, or interact with the model.
3. Do NOT provide GitHub repositories.
4. Do NOT provide GitLab repositories.
5. Do NOT provide source-code repositories.
6. Do NOT provide papers, PDFs, blogs, or documentation pages unless they are the actual model access page.
7. Do NOT invent model names, links, creators, citations, or availability.
8. Prefer official model pages and official access endpoints.
9. If a model cannot be found on the supported platforms, do not include it.

For every model return:

- Model Name
- Model Creator/Provider
- Platform Source
- Direct Usage Link
- Citation/Reference for the Model
- Description of the Model
- Capabilities
- License Information
- PNG Logo Link if available

If no logo exists, return:
"No logo available."

Return 10 to 15 relevant models.

The user request is:

"${prompt}"

IMPORTANT:
The top-level JSON value MUST be an array.
Do not wrap the array in an object.
Do not use keys like "models", "response", or "data".
The first character of your response must be '['.
The last character must be ']'.

Return ONLY valid JSON using exactly this format:

[
  {
    "name": "Model name",
    "creator": "Creator or organization",
    "platform": "Supported platform",
    "usage_link": "https://...",
    "citation": "Citation/reference",
    "description": "Description including capabilities and limitations",
    "capabilities": [
      "capability 1",
      "capability 2"
    ],
    "license": "License information",
    "logo_png": "https://..."
  }
]
`,
      },
    ],
  });

  let fullResponse = "";
  for await (const chunk of responseStream) {
    fullResponse += chunk.message.content;
  }

  let cleanContent = fullResponse.trim();

  if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");
  }

  const parsed = JSON.parse(cleanContent);
  const rawArray = extractArrayFromJSON(parsed);

  if (!rawArray) {
    console.error("Unexpected Ollama JSON:", JSON.stringify(parsed, null, 2));
    throw new Error("Could not find model array in Ollama response.");
  }

  const cleaned = cleanModels(rawArray);
  return await validateAndFilterModels(cleaned);
}

export function processOllamaResponse(models: ModelInfo[]): void {
  saveModelCards(models);
}
