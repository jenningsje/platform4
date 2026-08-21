import { Ollama } from "ollama";

import type { SearchAsset } from "../types";

const OLLAMA_HOST =
    process.env.OLLAMA_HOST ||
    "http://host.docker.internal:11434";

const ollama = new Ollama({
    host: OLLAMA_HOST
});

const RERANK_MODEL = "granite3.1-dense";

export async function rerank(
    query: string,
    candidates: {
        asset: SearchAsset;
        score: number;
    }[]
) {
    console.log(`Reranking ${candidates.length} candidates with Ollama at ${OLLAMA_HOST}`);

    const results = [];

    for (const candidate of candidates) {
        try {
            const response = await ollama.chat({
                model: "qwen3:14b",
                messages: [
                    {
                        role: "user",
                        content: `Query: ${query}

Candidate:
Name: ${candidate.asset.name}
Description: ${candidate.asset.description}

Rate how relevant this candidate is to the query from 0 to 100.
Return only the number.`
                    }
                ],
                stream: false
            });

            const score = parseFloat(
                response.message.content.trim()
            );

            results.push({
                ...candidate,
                rerankScore: Number.isFinite(score)
                    ? score
                    : 0
            });

        } catch (error) {
            console.error(
                `Failed to rerank ${candidate.asset.name}:`,
                error
            );

            results.push({
                ...candidate,
                rerankScore: candidate.score
            });
        }
    }

    return results.sort(
        (a, b) =>
            b.rerankScore - a.rerankScore
    );
}