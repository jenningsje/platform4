// src/connectors/tensorflow_hub.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchTensorFlowHub(
    query: string
): Promise<SearchAsset[]> {

    try {

        const response = await axios.get(
            "https://tfhub.dev/sitemap.xml"
        );

        const xml =
            response.data ?? "";

        const urls =
            [...xml.matchAll(
                /<loc>(.*?)<\/loc>/g
            )]
            .map(match => match[1])
            .filter(
                (url: string) =>
                    url
                        .toLowerCase()
                        .includes(
                            query.toLowerCase()
                        )
            )
            .slice(0, 20);

        return urls.map(
            (url: string) => ({

                name:
                    url
                        .split("/")
                        .filter(Boolean)
                        .pop() ??
                    "",

                creator:
                    "TensorFlow Hub",

                platform:
                    "TensorFlow Hub",

                asset_type:
                    "model",

                usage_link:
                    url,

                description:
                    "TensorFlow model",

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
            "TensorFlow Hub search failed",
            error
        );

        return [];
    }
}