// src/connectors/modelscope.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchModelScope(
    query: string
): Promise<SearchAsset[]> {

    try {

        const response = await axios.get(
            "https://modelscope.cn/api/v1/dolphin/models",
            {
                params: {
                    Name: query,
                    PageNumber: 1,
                    PageSize: 20
                }
            }
        );

        const models =
            response.data?.Data?.Models ??
            response.data?.data?.Models ??
            [];

        return models.map(
            (model: any) => ({

                name:
                    model.Name ??
                    model.name ??
                    "",

                creator:
                    model.Owner ??
                    model.owner ??
                    "",

                platform:
                    "ModelScope",

                asset_type:
                    "model",

                usage_link:
                    model.Path ??
                    model.path ??
                    "",

                description:
                    model.Description ??
                    model.description ??
                    "AI model",

                capabilities:
                    model.Tags ??
                    model.tags ??
                    [],

                license:
                    model.License ??
                    model.license ??
                    "Unknown",

                citation:
                    ""

            })
        );

    } catch (error) {

        console.error(
            "ModelScope search failed",
            error
        );

        return [];
    }
}