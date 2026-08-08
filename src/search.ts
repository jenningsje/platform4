// src/search.ts

import { searchHuggingFace } from "./connectors/huggingface";
import { searchGitHub } from "./connectors/github";
import { searchModelScope } from "./connectors/modelscope";
import { searchKaggle } from "./connectors/kaggle";
import { searchNGC } from "./connectors/ngc";
import { searchTensorFlowHub } from "./connectors/tensorflow_hub";

export async function searchAll(
    query: string
) {

    const results =
        await Promise.allSettled([

            searchHuggingFace(query),
            searchGitHub(query),
            searchModelScope(query),
            searchKaggle(query),
            searchNGC(query),
            searchTensorFlowHub(query)

        ]);

    const assets = [];

    for (const result of results) {

        if (result.status === "fulfilled") {

            assets.push(
                ...result.value
            );

        } else {

            console.error(
                "Search connector failed:",
                result.reason
            );

        }
    }

    console.log(
        `Total assets found: ${assets.length}`
    );

    return assets;
}