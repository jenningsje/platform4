// src/search.ts

import { searchGitHub } from "./connectors/github";
import { searchGitLab } from "./connectors/gitlab";
import { searchHuggingFace } from "./connectors/huggingface";
import { searchKaggle } from "./connectors/kaggle";
import { searchModelScope } from "./connectors/modelscope";
import { searchNGC } from "./connectors/ngc";
import { searchNpm } from "./connectors/npm";
import { searchOllama } from "./connectors/ollama";
import { searchReplicate } from "./connectors/replicate";
import { searchTensorFlowHub } from "./connectors/tensorflow_hub";

export async function searchAll(
    query: string
) {

    const results =
        await Promise.allSettled([

            searchGitHub(query),
            searchGitLab(query),
            searchHuggingFace(query),
            searchModelScope(query),
            searchKaggle(query),
            searchNGC(query),
            searchNpm(query),
            searchOllama(query),
            searchReplicate(query),
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