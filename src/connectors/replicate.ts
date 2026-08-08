// src/connectors/replicate.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchReplicate(
    query: string
): Promise<SearchAsset[]> {

    try {

        const response = await axios.get(
            "https://api.replicate.com/v1/search",
            {
                params: {
                    query: query,
                    limit: 20
                },

                headers: process.env.REPLICATE_API_TOKEN
                    ? {
                        Authorization:
                            `Bearer ${process.env.REPLICATE_API_TOKEN}`
                    }
                    : {}
            }
        );

        const models =
            response.data.results ?? [];

        return models
            .filter(
                (item: any) =>
                    item.type === "model" ||
                    !item.type
            )
            .map(
                (model: any) => ({

                    name:
                        model.name ??
                        "",

                    creator:
                        model.owner ??
                        "",

                    platform:
                        "Replicate",

                    asset_type:
                        "model",

                    usage_link:
                        model.url ??
                        `https://replicate.com/${model.owner}/${model.name}`,

                    description:
                        model.description ??
                        model.metadata?.generated_description ??
                        "",

                    capabilities:
                        model.metadata?.tags ??
                        [],

                    license:
                        "Unknown",

                    citation:
                        ""

                })
            );

    } catch (error) {

        console.error(
            "Replicate search failed",
            error
        );

        return [];
    }
}
