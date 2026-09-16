import { Ollama } from "ollama";

import type { SearchAsset } from "../types";

const OLLAMA_HOST =
    process.env.OLLAMA_HOST ||
    "http://host.docker.internal:11434";

const ollama = new Ollama({
    host: OLLAMA_HOST,
});

const RERANK_MODEL = "granite3.1-dense";

// Only rerank the strongest vector-search candidates.
const MAX_RERANK_CANDIDATES = 10;

// Number of Ollama requests allowed to run simultaneously.
const RERANK_CONCURRENCY = 3;


type Candidate = {
    asset: SearchAsset;
    score: number;
};


type RerankedCandidate = Candidate & {
    rerankScore: number;
};


async function rerankOne(
    query: string,
    candidate: Candidate
): Promise<RerankedCandidate> {

    try {
        const response = await ollama.chat({
            model: RERANK_MODEL,

            messages: [
                {
                    role: "user",

                    content: `You are ranking machine-learning models and AI assets.

Query:
${query}

Candidate:
Name: ${candidate.asset.name}
Description: ${candidate.asset.description || ""}

Rate how relevant this candidate is to the query from 0 to 100.

Return ONLY a number.
Do not explain your answer.`,
                },
            ],

            stream: false,
        });


        /*
         * Extract a numeric score from the response.
         *
         * This is deliberately tolerant because the model may
         * occasionally return something other than just a number.
         */
        const match =
            response.message.content.match(
                /\b(?:100|[1-9]?\d(?:\.\d+)?)\b/
            );


        const parsedScore =
            match
                ? parseFloat(match[0])
                : NaN;


        const rerankScore =
            Number.isFinite(parsedScore)
                ? Math.max(
                    0,
                    Math.min(100, parsedScore)
                )
                : candidate.score;


        return {
            ...candidate,
            rerankScore,
        };

    } catch (error) {

        console.error(
            `Failed to rerank ${candidate.asset.name}:`,
            error
        );


        /*
         * If Ollama itself reports an error, preserve the
         * vector-search score instead of dropping the result.
         */
        return {
            ...candidate,
            rerankScore: candidate.score,
        };
    }
}


/**
 * Rerank vector-search candidates using Ollama.
 *
 * The vector search can return many candidates, but we only send
 * the strongest candidates to the LLM.
 *
 * The remaining candidates retain their vector similarity score.
 */
export async function rerank(
    query: string,
    candidates: Candidate[]
): Promise<RerankedCandidate[]> {

    if (candidates.length === 0) {
        return [];
    }


    const sortedCandidates =
        [...candidates].sort(
            (a, b) => b.score - a.score
        );


    const candidatesToRerank =
        sortedCandidates.slice(
            0,
            MAX_RERANK_CANDIDATES
        );


    const candidatesNotReranked =
        sortedCandidates.slice(
            MAX_RERANK_CANDIDATES
        );


    console.log(
        `Reranking top ${candidatesToRerank.length} of ${candidates.length} candidates with Ollama at ${OLLAMA_HOST}`
    );


    const reranked: RerankedCandidate[] = [];


    /*
     * Run a small number of Ollama requests concurrently.
     *
     * There is intentionally NO artificial timeout here.
     * Qwen is allowed to finish naturally.
     */
    for (
        let i = 0;
        i < candidatesToRerank.length;
        i += RERANK_CONCURRENCY
    ) {

        const batch =
            candidatesToRerank.slice(
                i,
                i + RERANK_CONCURRENCY
            );


        const batchResults =
            await Promise.all(
                batch.map(
                    (candidate) =>
                        rerankOne(
                            query,
                            candidate
                        )
                )
            );


        reranked.push(
            ...batchResults
        );


        console.log(
            `Reranked ${Math.min(
                i + RERANK_CONCURRENCY,
                candidatesToRerank.length
            )}/${candidatesToRerank.length} candidates`
        );
    }


    /*
     * Candidates that were not sent through Qwen keep their
     * original vector-search score.
     */
    const remaining: RerankedCandidate[] =
        candidatesNotReranked.map(
            (candidate) => ({
                ...candidate,
                rerankScore: candidate.score,
            })
        );


    const results = [
        ...reranked,
        ...remaining,
    ];


    results.sort(
        (a, b) =>
            b.rerankScore -
            a.rerankScore
    );


    console.log(
        `Reranking complete: ${results.length} candidates`
    );


    return results;
}