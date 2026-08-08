// src/connectors/npm.ts

import axios from "axios";
import { SearchAsset } from "../types";

export async function searchNpm(
    query: string
): Promise<SearchAsset[]> {

    try {

        const response = await axios.get(
            "https://registry.npmjs.org/-/v1/search",
            {
                params: {
                    text: query,
                    size: 20
                }
            }
        );

        const packages =
            response.data.objects ?? [];

        return packages.map(
            (item: any) => {

                const pkg =
                    item.package ?? {};

                return {

                    name:
                        pkg.name ??
                        "",

                    creator:
                        pkg.publisher?.username ??
                        "",

                    platform:
                        "npm",

                    asset_type:
                        "package",

                    usage_link:
                        pkg.links?.npm ??
                        `https://www.npmjs.com/package/${pkg.name}`,

                    description:
                        pkg.description ??
                        "",

                    capabilities:
                        pkg.keywords ??
                        [],

                    license:
                        pkg.license ??
                        "Unknown",

                    citation:
                        ""

                };
            }
        );

    } catch (error) {

        console.error(
            "npm search failed",
            error
        );

        return [];
    }
}
