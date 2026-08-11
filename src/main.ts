import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as url from "url";

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
    const filePath = path.resolve(
        __dirname,
        "../model_cards",
        fileName
    );
    if (fs.existsSync(filePath)) {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            error: "File not found"
        }));
    }
    return;
  }

  // 3. Handle POST queries from index.html
// 3. Handle POST queries from index.html
if (req.method === "POST" && requestUrl === "/") {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", async () => {
        try {
            const data = JSON.parse(body);

            if (!data.query || !String(data.query).trim()) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    error: "Query is required"
                }));

                return;
            }

            searchStatus.processing = true;
            searchStatus.complete = false;

            // Write the query to search.json
            fs.writeFileSync(
                SEARCH_JSON_PATH,
                JSON.stringify({
                    query: String(data.query).trim()
                }, null, 2),
                "utf-8"
            );

            console.log(
                `Frontend wrote query to search.json: "${data.query}"`
            );

            // Delete old model cards
            try {
                const modelCardsDir = path.resolve(
                    __dirname,
                    "../model_cards"
                );

                const files = fs.readdirSync(modelCardsDir);

                for (const file of files) {
                    if (/^model_card\d+\.json$/.test(file)) {
                        fs.unlinkSync(
                            path.join(modelCardsDir, file)
                        );
                    }
                }

                console.log("Deleted old model cards.");

            } catch (err) {
                console.error(
                    "Failed to delete model cards:"
                );
                console.error(err);
            }

            // Tell the AI search server to start searching
            try {
                console.log(
                    "Sending search request to http://localhost:9100/search"
                );

                const searchResponse = await fetch(
                    "http://localhost:9100/search",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            query: String(data.query).trim()
                        })
                    }
                );

                if (!searchResponse.ok) {
                    throw new Error(
                        `Search server returned ${searchResponse.status}`
                    );
                }

                console.log(
                    "Search request successfully sent to 9100."
                );

            } catch (error) {
                console.error(
                    "Failed to start AI search:"
                );
                console.error(error);
            }

            // Respond to frontend immediately
            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true,
                message: "Search started"
            }));

        } catch (err) {

            console.error(
                "Invalid search request:"
            );
            console.error(err);

            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                error: "Invalid JSON payload"
            }));
        }
    });

    return;
}

  if (req.method === "GET" && requestUrl === "/search-status") {
    const modelCardsDir = path.resolve(
        __dirname,
        "../model_cards"
    );
    const files = fs.readdirSync(modelCardsDir);
    const hasCards = files.some(
        (file) => /^model_card\d+\.json$/.test(file)
    );
    if (hasCards) {
        searchStatus.processing = false;
        searchStatus.complete = true;
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

export async function main(jsonPath = SEARCH_JSON_PATH, intervalMs = 500): Promise<string> {
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

main().catch((err) => {
  console.error("Fatal error:");
  console.error(err);
  process.exitCode = 1;
});