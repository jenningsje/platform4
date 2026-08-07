// src/search.ts

import { searchHuggingFace } from "./connectors/huggingface";
import { searchGitHub } from "./connectors/github";
import { searchPapers } from "./connectors/papers";

export async function searchAll(
    query:string
){

    const [
        huggingface,
        github,
        papers
    ] = await Promise.all([

        searchHuggingFace(query),
        searchGitHub(query),
        searchPapers(query)

    ]);


    return [
        ...huggingface,
        ...github,
        ...papers
    ];

}
