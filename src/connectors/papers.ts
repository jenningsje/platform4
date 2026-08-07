import axios from "axios";
import type { SearchAsset } from "../types";

export async function searchPapers(
    query: string
): Promise<SearchAsset[]> {
    try {
        const response = await axios.get(
            "https://api.semanticscholar.org/graph/v1/paper/search",
            {
                params: {
                    query,
                    limit: 20,
                    fields:
                        "title,abstract,authors,url"
                },
                timeout: 10000
            }
        );

        return response.data.data.map(
            (paper: any): SearchAsset => ({
                name:
                    paper.title ?? "",
                creator:
                    paper.authors
                        ?.map(
                            (author: any) =>
                                author.name
                        )
                        .join(", ") ?? "",
                platform:
                    "Semantic Scholar",
                asset_type:
                    "paper",
                usage_link:
                    paper.url ?? "",
                description:
                    paper.abstract ?? "",
                capabilities: [
                    "Scientific research",
                    "Machine learning"
                ],
                license:
                    "Unknown",

                citation:
                    paper.title ?? ""
            })
        );

    } catch (error: any) {
        if (error.response?.status === 429) {
            console.warn(
                "Semantic Scholar rate limit reached. Skipping paper search."
            );
        } else {
            console.error(
                "Semantic Scholar search failed:",
                error.message ?? error
            );
        }
        return [];
    }
}