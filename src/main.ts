import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as url from "url";
import { askOllama, processOllamaResponse } from "./search_models.ts";
import type { ModelInfo } from "./search_models.ts";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 9000;
const SEARCH_JSON_PATH = path.resolve("search.json");

let searchStatus = {
  processing: false,
  complete: false,
};

const server = http.createServer(async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestUrl = req.url || "/";

  // 1. Serve index.html
  // 1. Serve index.html and static frontend assets from src/ or root
  if (req.method === "GET") {
    let filePath = "";
    let contentType = "text/plain";

    if (requestUrl === "/" || requestUrl === "/index.html") {
      filePath = path.resolve(__dirname, "../index.html");
      contentType = "text/html";
    } else if (requestUrl.endsWith(".js") || requestUrl.endsWith(".jsx")) {
      filePath = path.resolve(__dirname, requestUrl);
      contentType = "application/javascript";
    } else if (requestUrl.endsWith(".css")) {
      filePath = path.resolve(__dirname, requestUrl);
      contentType = "text/css";
    }

    if (filePath && fs.existsSync(filePath)) {
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 2. Serve model_card files (e.g. /model_card1.json)
  if (req.method === "GET" && requestUrl.startsWith("/model_card")) {
    const fileName = path.basename(requestUrl);
    const filePath = path.resolve(".", fileName);

    if (fs.existsSync(filePath)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "File not found" }));
    }
    return;
  }

  // 3. Handle POST queries from index.html
  if (req.method === "POST" && requestUrl === "/") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        searchStatus.processing = true;
        searchStatus.complete = false;

        fs.writeFileSync(
            SEARCH_JSON_PATH,
            JSON.stringify(data, null, 2),
            "utf-8"
        );

        fs.writeFileSync(SEARCH_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "search.json created/updated" }));

        console.log(`\nFrontend wrote query to search.json: "${data.query}"`);
        try {
            for (let i = 1; i<=15; i++) {
                const cardPath = path.resolve(`model_card${i}.json`);

                if (!fs.existsSync(cardPath)) {
                    break;
                }

                fs.unlinkSync(cardPath);
            }

            console.log("Deleted old model cards.");
        } catch (err) {
            console.error("Failed to delete model cards:");
            console.error(err);
        }

      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON payload" }));
      }
    });
    return;
  }

  if (req.method === "GET" && requestUrl === "/search-status") {

    let hasCards = false;

    for (let i = 1; i <= 15; i++) {
        if (fs.existsSync(path.resolve(`model_card${i}.json`))) {
            hasCards = true;
            break;
        }
    }

    res.writeHead(200, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        processing: searchStatus.processing,
        complete: searchStatus.complete,
        hasCards
    }));

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

async function runModelWorkflow(prompt: string): Promise<void> {
  const trimmed = prompt.trim();
  if (!trimmed) return;

  console.log(`Running workflow for prompt:\n"${trimmed}"\n`);

  try {
    const models: ModelInfo[] = await askOllama(trimmed);
    processOllamaResponse(models);
  } catch (err) {
    console.error("Failed to run Ollama model discovery:");
    console.error(err);
  }
}

export async function waitForSearchJson(jsonPath = SEARCH_JSON_PATH, intervalMs = 500): Promise<string> {
  const absolutePath = path.resolve(jsonPath);
  console.log(`Waiting for ${absolutePath} to appear...`);

  while (!fs.existsSync(absolutePath)) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // Small buffer to ensure write has fully completed
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
  while (true) {
    let prompt: string = await waitForSearchJson(SEARCH_JSON_PATH);
    prompt = prompt.trim();

    if (!prompt) {
      console.log("search.json is empty. Waiting for a valid query...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    console.log(`Loaded prompt from search.json:\n"${prompt}"\n`);

    try {
      const models: ModelInfo[] = await askOllama(prompt);
      processOllamaResponse(models);
    } catch (err) {
      console.error("Failed to run Ollama model discovery:");
      console.error(err);
    }

    if (fs.existsSync(SEARCH_JSON_PATH)) {
      fs.unlinkSync(SEARCH_JSON_PATH);
    }

    searchStatus.processing = false;
    searchStatus.complete = true;

    console.log("\nConsumed search.json, waiting for next query...\n");
  }
}

main().catch((err) => {
  console.error("Fatal error:");
  console.error(err);
  process.exitCode = 1;
});
