import * as fs from "fs";
import * as path from "path";
import { askOllama, processOllamaResponse } from "./search_models.ts";
import type { ModelInfo } from "./search_models.ts";

// Helper function to wait until the file exists and is populated
async function waitForSearchJson(jsonPath = "search.json", intervalMs = 500): Promise<string> {
  const absolutePath = path.resolve(jsonPath);
  console.log(`Waiting for ${absolutePath} to appear...`);

  while (!fs.existsSync(absolutePath)) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // Small extra buffer to ensure file write has fully completed
  await new Promise((resolve) => setTimeout(resolve, 100));

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
  let prompt: string = await waitForSearchJson("search.json");
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