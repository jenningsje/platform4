import fs from "fs/promises";
import path from "path";
import type { SearchAsset } from "../types";


export type ModelCard = {
    name: string;
    creator: string;
    platform: string;
    usage_link: string;
    citation: string;
    description: string;
    capabilities: string[];
    license: string;
};

function normalizeAsset(
    asset: SearchAsset
): ModelCard {

    return {
        name:
            asset.name || "Unknown",

        creator:
            asset.creator || "Unknown",

        platform:
            asset.platform || "Unknown",

        usage_link:
            asset.usage_link || "",

        citation:
            asset.citation || "",

        description:
            asset.description ||
            "No description available.",

        capabilities:
            asset.capabilities?.length
                ? asset.capabilities
                : [asset.asset_type],

        license:
            asset.license || "Unknown"
    };
}

export async function writeModelCards(
    assets: SearchAsset[]
) {
    const outputDir =
        path.resolve("./model_cards");

    await fs.mkdir(
        outputDir,
        {
            recursive: true
        }
    );
    // Remove previous search results
    const existing =
        await fs.readdir(outputDir);

    for (const file of existing) {
        if (file.startsWith("model_card")) {
            await fs.unlink(
                path.join(
                    outputDir,
                    file
                )
            );
        }
    }
    let index = 1;
    for (const asset of assets) {
        const card =
            normalizeAsset(asset);

        await fs.writeFile(
            path.join(
                outputDir,
                `model_card${index}.json`
            ),

            JSON.stringify(
                card,
                null,
                2
            )
        );
        index++;
    }
    console.log(
        `Generated ${index - 1} model cards`
    );
}