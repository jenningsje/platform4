// src/connectors/kaggle.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchKaggle(
    query: string
): Promise<SearchAsset[]> {

    const results: SearchAsset[] = [];

    const username =
        process.env.KAGGLE_USERNAME;

    const key =
        process.env.KAGGLE_API_TOKEN;

    if (!username || !key) {

        console.error(
            "Kaggle search skipped: KAGGLE_USERNAME/KAGGLE_API_TOKEN not configured"
        );

        return [];
    }

    const auth = {
        username,
        password: key
    };

    try {

        const datasets =
            await axios.get(
                "https://www.kaggle.com/api/v1/datasets/list",
                {
                    params: {
                        search: query,
                        pageSize: 20
                    },
                    auth
                }
            );

        for (const dataset of datasets.data ?? []) {

            results.push({

                name:
                    dataset.ref ??
                    dataset.title ??
                    "",

                creator:
                    dataset.ownerName ??
                    "",

                platform:
                    "Kaggle",

                asset_type:
                    "dataset",

                usage_link:
                    dataset.ref
                        ? `https://www.kaggle.com/datasets/${dataset.ref}`
                        : "",

                description:
                    dataset.description ??
                    "",

                capabilities:
                    dataset.tags ??
                    [],

                license:
                    dataset.licenseName ??
                    "Unknown",

                citation:
                    ""

            });
        }

    } catch (error) {

        console.error(
            "Kaggle dataset search failed",
            error
        );

    }

    return results;
}