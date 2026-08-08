// src/connectors/gitlab.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchGitLab(
    query: string
): Promise<SearchAsset[]> {

    try {

        const response = await axios.get(
            "https://gitlab.com/api/v4/projects",
            {
                params: {
                    search: query,
                    per_page: 20
                }
            }
        );

        return response.data.map(
            (project: any) => ({

                name:
                    project.name ?? "",

                creator:
                    project.namespace?.name ??
                    project.namespace?.path ??
                    "",

                platform:
                    "GitLab",

                asset_type:
                    "repository",

                usage_link:
                    project.web_url ?? "",

                description:
                    project.description ??
                    "",

                capabilities:
                    project.topics ?? [],

                license:
                    project.license?.name ??
                    "Unknown",

                citation:
                    ""

            })
        );

    } catch (error) {

        console.error(
            "GitLab search failed",
            error
        );

        return [];
    }
}
