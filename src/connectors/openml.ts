// src/connectors/openml.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchOpenML(
    query: string
): Promise<SearchAsset[]> {

    try {

        const response =
            await axios.get(
                "https://www.openml.org/api/v1/json/data/list",
                {
                    params: {
                        search: query,
                        limit: 20
                    }
                }
            );

        const datasets =
            response.data?.data?.dataset ??
            [];

        return datasets.map(
            (dataset: any) => ({

                name:
                    dataset.name ??
                    "",

                creator:
                    "OpenML",

                platform:
                    "OpenML",

                asset_type:
                    "dataset",

                usage_link:
                    `https://www.openml.org/search?type=data&sort=runs&id=${dataset.did}`,

                description:
                    dataset.description ??
                    "",

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
            "OpenML search failed",
            error
        );

        return [];
    }
}
