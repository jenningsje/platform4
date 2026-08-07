// src/connectors/github.ts

import axios from "axios";
import { SearchAsset } from "../types";


export async function searchGitHub(
    query:string
):Promise<SearchAsset[]> {


    try {

        const response =
            await axios.get(
                "https://api.github.com/search/repositories",
                {
                    params:{
                        q:`${query} machine learning OR AI`,
                        per_page:20
                    },

                    headers:{
                        Accept:
                        "application/vnd.github+json"
                    }
                }
            );


        return response.data.items.map(
            (repo:any)=>({

                name:
                    repo.name,

                creator:
                    repo.owner.login,

                platform:
                    "GitHub",

                asset_type:
                    "repository",

                usage_link:
                    repo.html_url,

                description:
                    repo.description ??
                    "",

                capabilities:[
                    "AI software",
                    "Machine learning"
                ],

                license:
                    repo.license?.name ??
                    "Unknown",

                citation:
                    ""

            })
        );


    } catch(error){

        console.error(
            "GitHub search failed",
            error
        );

        return [];

    }

}
