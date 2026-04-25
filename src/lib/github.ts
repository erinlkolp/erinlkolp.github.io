export type RepoData = {
  name: string;
  description: string;
  language: string | null;
  stars: number | null;
  htmlUrl: string;
  pushedAt: Date | null;
  /** True when the API call failed and this entry is a placeholder. */
  unavailable: boolean;
};

type RawRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  pushed_at: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

async function fetchOnce(url: string): Promise<Response> {
  return fetch(url, { headers: buildHeaders() });
}

async function fetchOne(owner: string, repo: string): Promise<RepoData> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;

  let response = await fetchOnce(url);

  if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
    throw new Error(
      `GitHub rate limit exhausted while fetching ${owner}/${repo}. Set GITHUB_TOKEN or wait for the limit to reset.`,
    );
  }

  if (!response.ok) {
    await sleep(500);
    response = await fetchOnce(url);
  }

  if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
    throw new Error(
      `GitHub rate limit exhausted while fetching ${owner}/${repo}. Set GITHUB_TOKEN or wait for the limit to reset.`,
    );
  }

  if (!response.ok) {
    console.warn(
      `[github] could not fetch ${owner}/${repo} (status ${response.status}); using placeholder`,
    );
    return {
      name: repo,
      description: "(unavailable)",
      language: null,
      stars: null,
      htmlUrl: `https://github.com/${owner}/${repo}`,
      pushedAt: null,
      unavailable: true,
    };
  }

  const raw = (await response.json()) as RawRepo;
  return {
    name: raw.name,
    description: raw.description ?? "",
    language: raw.language,
    stars: raw.stargazers_count,
    htmlUrl: raw.html_url,
    pushedAt: new Date(raw.pushed_at),
    unavailable: false,
  };
}

export async function fetchRepoData(
  owner: string,
  repos: string[],
): Promise<RepoData[]> {
  if (repos.length === 0) return [];
  const results: RepoData[] = [];
  for (const repo of repos) {
    results.push(await fetchOne(owner, repo));
  }
  return results;
}
