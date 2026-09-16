import express from "express";
import cors from "cors";

import { searchAll } from "./search";
import {
    addDocuments,
    searchVectors,
} from "./embedding/vector_store";
import { rerank } from "./ranking/reranker";
import { writeModelCards } from "./output/model_card_writer";
import type { SearchAsset } from "./types";

const app = express();

const PORT = 9100;

app.use(
    cors({
        origin: "http://localhost:8000",
    })
);

app.use(express.json());

let searchGeneration = 0;

app.post("/search", async (req, res) => {
    const query = String(
        req.body?.query || ""
    ).trim();

    if (!query) {
        res.status(400).json({
            success: false,
            error: "Query is required",
        });

        return;
    }

    const generation = ++searchGeneration;

    console.log(
        `Starting search #${generation}: "${query}"`
    );

    try {
        // --------------------------------------------------
        // Search all sources
        // --------------------------------------------------

        const rawAssets = await searchAll(query);

        console.log(
            `Search #${generation}: found ${rawAssets.length} raw assets`
        );

        // --------------------------------------------------
        // Deduplicate
        // --------------------------------------------------

        const assetMap = new Map<
            string,
            SearchAsset
        >();

        for (const asset of rawAssets) {
            const key =
                `${asset.platform}:${asset.name}`;

            if (!assetMap.has(key)) {
                assetMap.set(key, asset);
            }
        }

        const assets = Array.from(
            assetMap.values()
        );

        console.log(
            `Search #${generation}: ${assets.length} unique assets`
        );

        // --------------------------------------------------
        // Create vectors for THIS search only
        // --------------------------------------------------

        const vectors = await addDocuments(
            assets
        );

        console.log(
            `Search #${generation}: embeddings complete`
        );

        // --------------------------------------------------
        // Vector search
        // --------------------------------------------------

        const candidates = await searchVectors(
            query,
            vectors,
            50
        );

        console.log(
            `Search #${generation}: ${candidates.length} vector candidates`
        );

        // --------------------------------------------------
        // Rerank
        // --------------------------------------------------

        const ranked = await rerank(
            query,
            candidates
        );

        console.log(
            `Search #${generation}: reranking complete`
        );

        // --------------------------------------------------
        // Ignore stale searches
        // --------------------------------------------------

        if (generation !== searchGeneration) {
            console.log(
                `Search #${generation} is stale. Ignoring results.`
            );

            res.json({
                success: true,
                stale: true,
                results: [],
            });

            return;
        }

        // --------------------------------------------------
        // Write top model cards
        // --------------------------------------------------

        const topResults = ranked.slice(
            0,
            20
        );

        await writeModelCards(
            topResults.map(
                (item) => item.asset
            )
        );

        console.log(
            `Search #${generation}: wrote ${topResults.length} model cards`
        );

        // --------------------------------------------------
        // Return results
        // --------------------------------------------------

        res.json({
            success: true,
            query,
            results: topResults,
        });
    } catch (error) {
        console.error(
            `Search #${generation} failed:`,
            error
        );

        if (generation === searchGeneration) {
            res.status(500).json({
                success: false,
                error: "Search failed",
            });
        } else {
            res.json({
                success: true,
                stale: true,
                results: [],
            });
        }
    }
});

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "search-engine",
        port: PORT,
    });
});

// --------------------------------------------------
// Start search engine on 9100
// --------------------------------------------------

app.listen(PORT, () => {
    console.log(
        `Search engine running at http://localhost:${PORT}`
    );
});