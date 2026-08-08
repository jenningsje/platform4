import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

import {
    writeModelCards
} from "./output/model_card_writer";

import {
    searchAll
} from "./search";

import {
    addDocuments,
    searchVectors
} from "./embedding/vector_store";

import {
    rerank
} from "./ranking/reranker";

const app =
    express();

app.use(cors());

app.use(express.json());

app.post(
"/search",
async(req,res)=>{
    try{
        // Read search.json from the parent directory
        const searchFile =
            path.join(
                __dirname,
                "..",
                "search.json"
            );
        const searchData =
            await fs.readFile(
                searchFile,
                "utf-8"
            );
        const search =
            JSON.parse(
                searchData
            );
        const query =
            search.query;
        if(!query){
            return res.status(400).json({
                error:
                    "search.json is missing a query"
            });
        }
        // 1. Crawl sources
        const assets =
            await searchAll(
                query
            );
        // 2. Index
        await addDocuments(
            assets
        );
        // 3. Vector search
        const candidates =
            await searchVectors(
                query,
                50
            );
        // 4. Granite ranking
        const ranked =
            await rerank(
                query,
                candidates
            );
        // 5. Write model cards
        await writeModelCards(
            candidates.map(
                item => item.asset
            )
        );
        res.json({
            query,
            results:
                ranked
        });
    }
    catch(error){
        console.error(error);
        res.status(500)
        .json({
            error:
                "Search failed"
        });
    }
});

app.listen(
    9100,
    ()=>{
        console.log(
            "AI Search Engine running on 9100"
        );
    }
);