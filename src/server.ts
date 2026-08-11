import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { writeModelCards } from "./output/model_card_writer";
import { searchAll } from "./search";
import {
    addDocuments,
    searchVectors
} from "./embedding/vector_store";
import { rerank } from "./ranking/reranker";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

console.log("SERVER.TS STARTED");

async function waitForSearchQuery(
    searchFile: string,
    intervalMs = 100
): Promise<string> {
    while (true) {

        try {

            const searchData = await fs.readFile(
                searchFile,
                "utf-8"
            );

            if (!searchData.trim()) {

                await new Promise(resolve =>
                    setTimeout(resolve, intervalMs)
                );

                continue;
            }

            try {

                const search = JSON.parse(
                    searchData
                );

                if (
                    search &&
                    typeof search === "object" &&
                    search.query &&
                    String(search.query).trim()
                ) {

                    return String(
                        search.query
                    ).trim();
                }

            } catch {
                // search.json is still being written.
            }

        } catch {
            // search.json does not exist yet.
        }

        await new Promise(resolve =>
            setTimeout(resolve, intervalMs)
        );
    }
}
app.post("/search", async (req, res) => {
    try {
        const query =
        typeof req.body?.query === "string"
            ? req.body.query.trim()
            : "";

        if (!query) {
            return res.status(400).json({
                error: "Query is required"
            });
        }
        console.log(
            `Searching for: "${query}"`
        );
        const assets =
            await searchAll(query);
        console.log(
            `Found ${assets.length} assets`
        );
        await addDocuments(
            assets
        );
        const candidates =
            await searchVectors(
                query,
                50
            );
        console.log(
            `Vector search returned ${candidates.length} candidates`
        );
        const ranked =
            await rerank(
                query,
                candidates
            );
        await writeModelCards(
            candidates.map(
                (item) => item.asset
            )
        );
        console.log(
            `Generated ${candidates.length} model cards`
        );
        res.json({
            query,
            results: ranked
        });
    } catch (error) {
        console.error(
            "Search failed:"
        );
        console.error(
            error
        );
        res.status(500).json({
            error: "Search failed"
        });
    }
});

app.listen(9100, () => {
    console.log(
        "AI Search Engine running on 9100"
    );
});