import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as url from "url";
import { askOllama, processOllamaResponse } from "./search_models.ts";
import type { ModelInfo } from "./search_models.ts";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8000;
const SEARCH_JSON_PATH = path.resolve("search.json");

const server = http.createServer(async (req, res) => {
  const requestUrl = req.url || "/";

  if (req.method === "GET" && (requestUrl === "/" || requestUrl === "/index.html")) {
    const indexPath = path.resolve(__dirname, "../index.html");
    
    console.log(`[DEBUG] Attempting to serve index.html from: ${indexPath}`);
    console.log(`[DEBUG] File exists check: ${fs.existsSync(indexPath)}`);

    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`index.html not found at expected path: ${indexPath}`);
    }
    return;
  }

  if (req.method === "POST" && requestUrl === "/") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        fs.writeFileSync(SEARCH_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "search.json created/updated" }));

        console.log(`\nReceived new query from frontend: "${data.query}"`);
        await runModelWorkflow(data.query);
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON payload" }));
      }
    });
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