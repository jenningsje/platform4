import ollama from "ollama";


export async function createEmbedding(
    text:string
):Promise<number[]> {


    const response =
        await ollama.embeddings({

            model:
                "nomic-embed-text",

            prompt:
                text

        });


    return response.embedding;

}



export function assetToText(
    asset:any
):string {


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
${asset.capabilities?.join(", ")}

License:
${asset.license}
`;

}
