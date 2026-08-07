import ollama from "ollama";
import type { SearchAsset } from "../types";

const EMBEDDING_MODEL = "nomic-embed-text";

// Keep embedding input comfortably below the model's context limit.
const MAX_EMBEDDING_CHARS = 3000;

export function assetToText(asset: SearchAsset): string {
    const capabilities = Array.isArray(asset.capabilities)
        ? asset.capabilities.slice(0, 20).join(", ")
        : "";

    const text = [
        `Name: ${asset.name}`,
        `Creator: ${asset.creator}`,
        `Platform: ${asset.platform}`,
        `Type: ${asset.asset_type}`,
        `Description: ${asset.description}`,
        `Capabilities: ${capabilities}`,
        `License: ${asset.license}`,
    ].join("\n");

    return text.slice(0, MAX_EMBEDDING_CHARS);
}

export async function createEmbedding(
    text: string
): Promise<number[]> {
    const safeText = text.slice(0, MAX_EMBEDDING_CHARS);

    const response = await ollama.embeddings({
        model: EMBEDDING_MODEL,
        prompt: safeText,
    });

    return response.embedding;
}