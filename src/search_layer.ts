import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export type SearchAsset = {
  name: string;
  creator: string;
  platform: string;
  asset_type: string;
  usage_link: string;
  description: string;
  capabilities: string[];
  license: string;
  citation: string;
};


async function searchHuggingFace(query: string): Promise<SearchAsset[]> {
  try {
    const response = await axios.get(
      "https://huggingface.co/api/models",
      {
        params: {
          search: query,
          limit: 20,
        },
      }
    );

    return response.data.map((model: any) => ({
      name: model.modelId ?? "",
      creator: model.author ?? "",
      platform: "Hugging Face",
      asset_type: "model",
      usage_link:
        `https://huggingface.co/${model.modelId}`,
      description:
        model.pipeline_tag ??
        "Hugging Face machine learning model",
      capabilities:
        model.tags ?? [],
      license:
        model.cardData?.license ??
        "Unknown",
      citation:
        model.cardData?.citation ??
        "",
    }));

  } catch (err) {
    console.error(
      "HuggingFace search failed:",
      err
    );

    return [];
  }
}


async function searchGitHub(query: string): Promise<SearchAsset[]> {

  try {

    const response = await axios.get(
      "https://api.github.com/search/repositories",
      {
        params: {
          q: `${query} AI`,
          per_page: 20,
        },
        headers: {
          Accept:
            "application/vnd.github+json",
        },
      }
    );


    return response.data.items.map(
      (repo: any) => ({
        name: repo.name,
        creator: repo.owner.login,
        platform: "GitHub",
        asset_type: "repository",
        usage_link: repo.html_url,
        description:
          repo.description ??
          "",
        capabilities: [
          "AI software",
          "Machine learning",
        ],
        license:
          repo.license?.name ??
          "Unknown",
        citation:
          "",
      })
    );


  } catch(err){

    console.error(
      "GitHub search failed:",
      err
    );

    return [];

  }

}



async function searchPapersWithCode(
  query: string
): Promise<SearchAsset[]> {

  try {

    const response =
      await axios.get(
        "https://paperswithcode.com/api/v1/papers/",
        {
          params:{
            search: query,
          }
        }
      );


    return response.data.results
      .slice(0,20)
      .map((paper:any)=>({

        name:
          paper.title,

        creator:
          "Research authors",

        platform:
          "Papers With Code",

        asset_type:
          "paper",

        usage_link:
          paper.url,

        description:
          paper.abstract ??
          "",

        capabilities:[
          "Research",
          "Machine Learning"
        ],

        license:
          "Unknown",

        citation:
          paper.title

      }));


  } catch(err){

    console.error(
      "Papers With Code failed:",
      err
    );

    return [];

  }

}



export async function searchAll(
  query:string
):Promise<SearchAsset[]> {


  const [
    huggingface,
    github,
    papers
  ] = await Promise.all([
    searchHuggingFace(query),
    searchGitHub(query),
    searchPapersWithCode(query),
  ]);


  return [
    ...huggingface,
    ...github,
    ...papers,
  ];

}