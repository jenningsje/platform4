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

const vectors: VectorEntry[] = [];

export async function addDocuments(
    assets: SearchAsset[]
): Promise<void> {

    for (const asset of assets) {

        try {

            const text = assetToText(asset);

            const vector =
                await createEmbedding(text);

            vectors.push({
                id: crypto.randomUUID(),
                asset,
                vector
            });

        } catch (error) {

            console.error(
                `Failed to embed: ${asset.name}`,
                error
            );

        }
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
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    if (magA === 0 || magB === 0) {
        return 0;
    }

    return dot /
        (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function searchVectors(
    query: string,
    limit: number = 50
) {

    const queryVector =
        await createEmbedding(query);

    return vectors
        .map(entry => ({
            asset: entry.asset,
            score: cosineSimilarity(
                queryVector,
                entry.vector
            )
        }))
        .sort(
            (a, b) => b.score - a.score
        )
        .slice(0, limit);
}