// src/connectors/ngc.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchNGC(
    query: string
): Promise<SearchAsset[]> {

    try {

        const response = await axios.get(
            "https://api.ngc.nvidia.com/v2/search",
            {
                params: {
                    q: query,
                    pageSize: 20
                }
            }
        );

        const results =
            response.data?.resources ??
            response.data?.results ??
            [];

        return results.map(
            (item: any) => ({

                name:
                    item.name ??
                    item.displayName ??
                    "",

                creator:
                    item.publisher ??
                    item.owner ??
                    "NVIDIA",

                platform:
                    "NVIDIA NGC",

                asset_type:
                    item.type ??
                    "AI resource",

                usage_link:
                    item.url ??
                    "",

                description:
                    item.description ??
                    "",

                capabilities:
                    item.tags ??
                    [],

                license:
                    item.license ??
                    "Unknown",

                citation:
                    ""

            })
        );

    } catch (error) {

        console.error(
            "NVIDIA NGC search failed",
            error
        );

        return [];
    }
}