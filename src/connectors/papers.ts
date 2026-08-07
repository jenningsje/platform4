// src/connectors/papers.ts

import axios from "axios";
import { SearchAsset } from "../types";


export async function searchPapers(
    query:string
):Promise<SearchAsset[]> {


    try {

        const response =
            await axios.get(
                "https://api.semanticscholar.org/graph/v1/paper/search",
                {
                    params:{
                        query,
                        limit:20,
                        fields:
                        "title,abstract,authors,url"
                    }
                }
            );


        return response.data.data.map(
            (paper:any)=>({

                name:
                    paper.title,

                creator:
                    paper.authors
                    ?.map(
                        (a:any)=>a.name
                    )
                    .join(", ") ??
                    "",

                platform:
                    "Semantic Scholar",

                asset_type:
                    "paper",

                usage_link:
                    paper.url ??
                    "",

                description:
                    paper.abstract ??
                    "",

                capabilities:[
                    "Research",
                    "Scientific AI"
                ],

                license:
                    "Unknown",

                citation:
                    paper.title

            })
        );


    } catch(error){

        console.error(
            "Paper search failed",
            error
        );

        return [];

    }

}
