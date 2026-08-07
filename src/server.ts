import express from "express";
import cors from "cors";

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
        const query =
            req.body.query;
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
    9000,
    ()=>{
        console.log(
            "AI Search Engine running on 9000"
        );
    }
);
