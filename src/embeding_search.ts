import ollama from "ollama";
import { SearchAsset } from "./search_layer";


type EmbeddedAsset = {
    asset: SearchAsset;
    embedding: number[];
};


const database: EmbeddedAsset[] = [];



function assetToText(asset: SearchAsset): string {

    return `
Name:
${asset.name}

Creator:
${asset.creator}

Platform:
${asset.platform}

Type:
${asset.asset_type}

Description:
${asset.description}

Capabilities:
${asset.capabilities.join(", ")}

License:
${asset.license}
`;

}



async function createEmbedding(
    text: string
): Promise<number[]> {


    const result =
        await ollama.embeddings({
            model: "nomic-embed-text",
            prompt: text,
        });


    return result.embedding;
}



export async function indexAssets(
    assets: SearchAsset[]
): Promise<void> {


    database.length = 0;


    for (const asset of assets) {

        const embedding =
            await createEmbedding(
                assetToText(asset)
            );


        database.push({
            asset,
            embedding,
        });

    }


    console.log(
        `Indexed ${database.length} assets`
    );

}




function cosineSimilarity(
    a:number[],
    b:number[]
):number {


    let dot = 0;
    let normA = 0;
    let normB = 0;


    for(let i=0;i<a.length;i++){

        dot += a[i] * b[i];

        normA += a[i] * a[i];

        normB += b[i] * b[i];

    }


    return (
        dot /
        (Math.sqrt(normA) *
        Math.sqrt(normB))
    );

}




export async function semanticSearch(
    query:string,
    limit:number = 10
):Promise<SearchAsset[]> {


    const queryEmbedding =
        await createEmbedding(query);



    const ranked =
        database
        .map(item => ({
            asset:item.asset,
            score:
                cosineSimilarity(
                    queryEmbedding,
                    item.embedding
                )
        }))
        .sort(
            (a,b)=>
                b.score-a.score
        )
        .slice(0,limit);



    return ranked.map(
        item => item.asset
    );

}
