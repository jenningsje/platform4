// src/connectors/huggingface.ts

import axios from "axios";
import { SearchAsset } from "../types";


export async function searchHuggingFace(
    query: string
): Promise<SearchAsset[]> {

    const results: SearchAsset[] = [];


    try {

        const models = await axios.get(
            "https://huggingface.co/api/models",
            {
                params: {
                    search: query,
                    limit: 20
                }
            }
        );


        for (const model of models.data) {

            results.push({

                name:
                    model.modelId ?? "",

                creator:
                    model.author ?? "",

                platform:
                    "Hugging Face",

                asset_type:
                    "model",

                usage_link:
                    `https://huggingface.co/${model.modelId}`,

                description:
                    model.pipeline_tag ??
                    "Machine learning model",

                capabilities:
                    model.tags ?? [],

                license:
                    model.cardData?.license ??
                    "Unknown",

                citation:
                    model.cardData?.citation ??
                    ""

            });

        }


    } catch(error){

        console.error(
            "Hugging Face model search failed",
            error
        );

    }



    try {

        const spaces = await axios.get(
            "https://huggingface.co/api/spaces",
            {
                params:{
                    search: query,
                    limit:20
                }
            }
        );


        for(const space of spaces.data){

            results.push({

                name:
                    space.id ?? "",

                creator:
                    space.author ?? "",

                platform:
                    "Hugging Face Spaces",

                asset_type:
                    "gui",

                usage_link:
                    `https://huggingface.co/spaces/${space.id}`,

                description:
                    space.sdk ??
                    "Interactive AI application",

                capabilities:
                    space.tags ?? [],

                license:
                    "Unknown",

                citation:
                    ""

            });

        }


    } catch(error){

        console.error(
            "Hugging Face Spaces search failed",
            error
        );

    }


    return results;

}
