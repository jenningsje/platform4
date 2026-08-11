import {
    createEmbedding,
    assetToText
} from "./embedder";

import type { SearchAsset } from "../types";


export type VectorEntry = {
    id: string;
    asset: SearchAsset;
    vector: number[];
};


// In-memory vector store
const vectors: VectorEntry[] = [];


// Number of embeddings allowed to run simultaneously.
// Start conservatively; increase if Ollama handles it well.
const EMBEDDING_CONCURRENCY = 8;


async function embedAsset(
    asset: SearchAsset
): Promise<VectorEntry | null> {

    try {

        const text =
            assetToText(asset);

        const vector =
            await createEmbedding(text);

        return {
            id: crypto.randomUUID(),
            asset,
            vector
        };

    } catch (error) {

        console.error(
            `Failed to embed: ${asset.name}`,
            error
        );

        return null;
    }
}


export async function addDocuments(
    assets: SearchAsset[]
): Promise<void> {

    console.log(
        `Embedding ${assets.length} assets with concurrency ${EMBEDDING_CONCURRENCY}`
    );

    /*
     * Process assets in controlled batches.
     *
     * Instead of:
     *
     *   asset 1 -> wait
     *   asset 2 -> wait
     *   asset 3 -> wait
     *
     * we do:
     *
     *   asset 1 ─┐
     *   asset 2  │
     *   asset 3  │
     *   ...      ├─> Ollama
     *   asset 8 ─┘
     *
     * then continue with the next batch.
     */

    for (
        let i = 0;
        i < assets.length;
        i += EMBEDDING_CONCURRENCY
    ) {

        const batch =
            assets.slice(
                i,
                i + EMBEDDING_CONCURRENCY
            );

        const results =
            await Promise.all(
                batch.map(
                    embedAsset
                )
            );

        for (const result of results) {

            if (result) {
                vectors.push(result);
            }
        }

        console.log(
            `Embedded ${Math.min(
                i + EMBEDDING_CONCURRENCY,
                assets.length
            )}/${assets.length}`
        );
    }

    console.log(
        `Vector store size: ${vectors.length}`
    );
}


function cosineSimilarity(
    a: number[],
    b: number[]
): number {

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (
        let i = 0;
        i < a.length;
        i++
    ) {

        dot +=
            a[i] * b[i];

        magA +=
            a[i] * a[i];

        magB +=
            b[i] * b[i];
    }

    if (
        magA === 0 ||
        magB === 0
    ) {
        return 0;
    }

    return (
        dot /
        (
            Math.sqrt(magA) *
            Math.sqrt(magB)
        )
    );
}


export async function searchVectors(
    query: string,
    limit: number = 50
) {

    console.log(
        "Generating query embedding..."
    );

    const queryVector =
        await createEmbedding(query);

    console.log(
        "Searching vector store..."
    );

    return vectors
        .map(entry => ({
            asset: entry.asset,
            score: cosineSimilarity(
                queryVector,
                entry.vector
            )
        }))
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .slice(
            0,
            limit
        );
}