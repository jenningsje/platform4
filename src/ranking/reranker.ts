import ollama from "ollama";


export async function rerank(
    query:string,
    results:any[]
){


    const prompt = `

You are a search ranking model.

Rank these AI resources for the query.

Query:

${query}


Resources:

${JSON.stringify(
    results,
    null,
    2
)}


Return ONLY JSON array.

Each item:

{
"name":"",
"score":0-100,
"reason":""
}

`;



    const response =
        await ollama.chat({

            model:
                "granite3.1-dense",

            format:
                "json",

            messages:[{

                role:"user",

                content:
                    prompt

            }]

        });



    return JSON.parse(
        response.message.content
    );

}
