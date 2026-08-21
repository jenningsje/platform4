import axios from "axios";
import dotenv from "dotenv";
import { searchReplicate } from "./connectors/replicate";
import { searchTensorFlowHub } from "./connectors/tensorflow_hub";
import { searchNGC } from "./connectors/ngc";
import { searchOllama } from "./connectors/ollama";

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

async function searchHuggingFace(
  query: string
): Promise<SearchAsset[]> {
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

async function searchGitHub(
  query: string
): Promise<SearchAsset[]> {
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
  } catch (err) {
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
          params: {
            search: query,
          },
        }
      );

    return response.data.results
      .slice(0, 20)
      .map((paper: any) => ({
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

        capabilities: [
          "Research",
          "Machine Learning",
        ],

        license:
          "Unknown",

        citation:
          paper.title,
      }));
  } catch (err) {
    console.error(
      "Papers With Code failed:",
      err
    );

    return [];
  }
}

async function searchKaggle(
  query: string
): Promise<SearchAsset[]> {
  const username =
    process.env.KAGGLE_USERNAME;

  const key =
    process.env.KAGGLE_API_TOKEN;

  if (!username || !key) {
    console.error(
      "Kaggle search skipped: " +
      "KAGGLE_USERNAME/KAGGLE_API_TOKEN not configured"
    );

    return [];
  }

  const auth = {
    username,
    password: key,
  };

  try {
    const response =
      await axios.get(
        "https://www.kaggle.com/api/v1/datasets/list",
        {
          params: {
            search: query,
            pageSize: 20,
          },
          auth,
        }
      );

    return (response.data ?? []).map(
      (dataset: any) => ({
        name:
          dataset.ref ??
          dataset.title ??
          "",

        creator:
          dataset.ownerName ??
          "",

        platform:
          "Kaggle",

        asset_type:
          "dataset",

        usage_link:
          dataset.ref
            ? `https://www.kaggle.com/datasets/${dataset.ref}`
            : "",

        description:
          dataset.description ??
          "",

        capabilities:
          dataset.tags ??
          [],

        license:
          dataset.licenseName ??
          "Unknown",

        citation:
          "",
      })
    );
  } catch (err) {
    console.error(
      "Kaggle dataset search failed:",
      err
    );

    return [];
  }
}

async function searchModelScope(
  query: string
): Promise<SearchAsset[]> {
  try {
    const response = await axios.get(
      "https://modelscope.cn/api/v1/dolphin/models",
      {
        params: {
          Name: query,
          PageNumber: 1,
          PageSize: 20,
        },
      }
    );

    const models =
      response.data?.Data?.Models ??
      response.data?.data?.Models ??
      [];

    return models.map(
      (model: any) => ({
        name:
          model.Name ??
          model.name ??
          "",

        creator:
          model.Owner ??
          model.owner ??
          "",

        platform:
          "ModelScope",

        asset_type:
          "model",

        usage_link:
          model.Path ??
          model.path ??
          "",

        description:
          model.Description ??
          model.description ??
          "AI model",

        capabilities:
          model.Tags ??
          model.tags ??
          [],

        license:
          model.License ??
          model.license ??
          "Unknown",

        citation:
          "",
      })
    );
  } catch (error) {
    console.error(
      "ModelScope search failed",
      error
    );

    return [];
  }
}

export async function searchAll(
  query: string
): Promise<SearchAsset[]> {
  const [
    huggingface,
    github,
    papers,
    kaggle,
    modelscope,
    ngc,
    ollama,
    replicate,
    tensorflowHub,
  ] = await Promise.all([
    searchHuggingFace(query),
    searchGitHub(query),
    searchPapersWithCode(query),
    searchKaggle(query),
    searchModelScope(query),
    searchNGC(query),
    searchOllama(query),
    searchReplicate(query),
    searchTensorFlowHub(query),
  ]);

  return [
    ...huggingface,
    ...github,
    ...papers,
    ...kaggle,
    ...modelscope,
    ...ngc,
    ...ollama,
    ...replicate,
    ...tensorflowHub,
  ];
}