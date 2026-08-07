import ollama from "ollama";

export async function rerank(
    query: string,
    results: any[]
) {
    const response =
        await ollama.chat({
            model:
                "granite3.1-dense",
            format:
                "json",
            messages: [
                {
                    role: "user",
                    content: `
Rank these AI resources.
Query:
${query}
Resources:
${JSON.stringify(
results.map(
(item,index)=>({
    id:index,
    name:item.asset.name,
    platform:item.asset.platform,
    description:item.asset.description,
    capabilities:item.asset.capabilities
})
),
null,
2
)}
Return ONLY JSON array:
[
{
"id":0,
"score":95,
"reason":"why this matches"
}
]
`
                }
            ]
        });
    const parsed =
        JSON.parse(
            response.message.content
        );
    let rankings:any[];
    if (Array.isArray(parsed)) {
        rankings = parsed;
    }
    else if (Array.isArray(parsed.items)) {
        rankings = parsed.items;
    }
    else if (Array.isArray(parsed.results)) {
        rankings = parsed.results;
    }
    else if (Array.isArray(parsed.response)) {
        rankings = parsed.response;
    }
    else if (
        typeof parsed === "object" &&
        parsed !== null &&
        "id" in parsed
    ) {
        // Granite sometimes returns one result
        rankings = [parsed];
    }
    else {
        console.error(
            "Unexpected reranker output:",
            parsed
        );
        throw new Error(
            "Could not find ranking array"
        );
    }
    return rankings.map(
        (rank:any)=>({
            ...results[rank.id],
            score:
                rank.score,
            reason:
                rank.reason
        })
    );
}