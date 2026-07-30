import * as fs from "fs";
import * as path from "path";
import { askOllama, processOllamaResponse } from "./search_models.ts";
import type { ModelInfo } from "./search_models.ts";

export function readSearchJson(jsonPath = "search.json"): string {
  const absolutePath = path.resolve(jsonPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const fileContent = fs.readFileSync(absolutePath, "utf-8");

  try {
    const parsed = JSON.parse(fileContent);

    if (typeof parsed === "object" && parsed !== null && "query" in parsed) {
      return String(parsed.query);
    }

    return typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);
  } catch {
    return fileContent.trim();
  }
}

async function main(): Promise<void> {
  let prompt: string = readSearchJson("search.json");
  prompt = prompt.trim();

  if (!prompt) {
    throw new Error("search.json is empty or missing a valid 'query' property.");
  }

  console.log(`Loaded prompt from search.json:\n"${prompt}"\n`);

  try {
    const models: ModelInfo[] = await askOllama(prompt);

    processOllamaResponse(models);
  } catch (err) {
    console.error("Failed to run Ollama model discovery:");
    console.error(err);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal error:");
  console.error(err);
  process.exitCode = 1;
});
