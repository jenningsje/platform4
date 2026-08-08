// src/connectors/ollama.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchOllama(
    query: string
): Promise<SearchAsset[]> {

    try {

        const response =
            await axios.get(
                "https://ollama.com/api/tags"
            );

        const models =
            response.data.models ?? [];

        const terms =
            query
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);

        return models
            .filter((model: any) => {

                const text = [
                    model.name ?? "",
                    model.model ?? ""
                ]
                    .join(" ")
                    .toLowerCase();

                return terms.some(
                    term => text.includes(term)
                );
            })
            .slice(0, 20)
            .map(
                (model: any) => ({

                    name:
                        model.name ??
                        model.model ??
                        "",

                    creator:
                        model.name?.split("/")[0] ??
                        "Ollama",

                    platform:
                        "Ollama",

                    asset_type:
                        "local LLM",

                    usage_link:
                        `https://ollama.com/library/${model.name}`,

                    description:
                        "Local large language model",

                    capabilities:
                        [],

                    license:
                        "Unknown",

                    citation:
                        ""

                })
            );

    } catch (error) {

        console.error(
            "Ollama search failed",
            error
        );

        return [];
    }
}
