import express from "express";
import cors from "cors";

import { writeModelCards } from "./output/model_card_writer";
import { searchAll } from "./search";
import {
    addDocuments,
    searchVectors
} from "./embedding/vector_store";
import { rerank } from "./ranking/reranker";

const app = express();

app.use(cors());
app.use(express.json());

console.log("SERVER.TS STARTED");

app.post("/search", async (req, res) => {

    try {

        // --------------------------------------------------
        // 1. Get query directly from POST body
        // --------------------------------------------------

        const query = req.body?.query;

        if (!query || !String(query).trim()) {

            return res.status(400).json({
                success: false,
                error: "Query is required"
            });
        }

        const cleanQuery = String(query).trim();

        console.log(
            `Searching for: "${cleanQuery}"`
        );


        // --------------------------------------------------
        // 2. Search external sources
        // --------------------------------------------------

        console.log(
            "========== BEFORE searchAll =========="
        );

        const assets = await searchAll(
            cleanQuery
        );

        console.log(
            "========== AFTER searchAll =========="
        );

        console.log(
            `Found ${assets.length} assets`
        );


        // --------------------------------------------------
        // 3. Generate embeddings
        // --------------------------------------------------

        console.log(
            "========== BEFORE addDocuments =========="
        );

        await addDocuments(
            assets
        );

        console.log(
            "========== AFTER addDocuments =========="
        );


        // --------------------------------------------------
        // 4. Vector search
        // --------------------------------------------------

        console.log(
            "========== BEFORE searchVectors =========="
        );

        const candidates =
            await searchVectors(
                cleanQuery,
                50
            );

        console.log(
            "========== AFTER searchVectors =========="
        );

        console.log(
            `Vector search returned ${candidates.length} candidates`
        );


        // --------------------------------------------------
        // 5. Rerank
        // --------------------------------------------------

        console.log(
            "========== BEFORE rerank =========="
        );

        const ranked =
            await rerank(
                cleanQuery,
                candidates
            );

        console.log(
            "========== AFTER rerank =========="
        );


        // --------------------------------------------------
        // 6. Write model cards
        // --------------------------------------------------

        console.log(
            "========== BEFORE writeModelCards =========="
        );

        await writeModelCards(
            candidates.map(
                (item) => item.asset
            )
        );

        console.log(
            "========== AFTER writeModelCards =========="
        );


        // --------------------------------------------------
        // 7. Return results
        // --------------------------------------------------

        res.json({
            success: true,
            query: cleanQuery,
            results: ranked
        });

    } catch (error) {

        console.error(
            "========== SEARCH FAILED =========="
        );

        if (error instanceof Error) {

            console.error(
                "Name:",
                error.name
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Stack:",
                error.stack
            );

            if (error.cause) {

                console.error(
                    "Cause:",
                    error.cause
                );
            }

        } else {

            console.error(
                "Unknown error:",
                error
            );
        }

        console.error(
            "==================================="
        );

        res.status(500).json({
            success: false,
            error: "Search failed"
        });
    }
});


app.listen(9100, () => {

    console.log(
        "AI Search Engine running on 9100"
    );

});