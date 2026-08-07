import {
    createEmbedding,
    assetToText
} from "./embedder";


export type VectorEntry = {

    id:string;

    asset:any;

    vector:number[];

};



const vectors:VectorEntry[] = [];



export async function addDocuments(
    assets:any[]
){


    for(const asset of assets){


        const vector =
            await createEmbedding(
                assetToText(asset)
            );


        vectors.push({

            id:
                crypto.randomUUID(),

            asset,

            vector

        });


    }


    console.log(
        `Vector store size: ${vectors.length}`
    );

}




function cosineSimilarity(
    a:number[],
    b:number[]
){


    let dot = 0;

    let magA = 0;

    let magB = 0;



    for(
        let i=0;
        i<a.length;
        i++
    ){

        dot += a[i]*b[i];

        magA += a[i]*a[i];

        magB += b[i]*b[i];

    }



    return (
        dot /
        (
            Math.sqrt(magA) *
            Math.sqrt(magB)
        )
    );

}




export async function searchVectors(
    query:string,
    limit:number=50
){


    const queryVector =
        await createEmbedding(query);



    return vectors
        .map(entry=>({

            asset:
                entry.asset,

            score:
                cosineSimilarity(
                    queryVector,
                    entry.vector
                )

        }))
        .sort(
            (a,b)=>
                b.score-a.score
        )
        .slice(0,limit);

}
