import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRepoData, type RepoData } from "../src/lib/github";

const sampleRepoResponse = {
  name: "demo-repo",
  description: "A demo repo",
  language: "TypeScript",
  stargazers_count: 42,
  html_url: "https://github.com/erinlkolp/demo-repo",
  pushed_at: "2026-04-20T12:00:00Z",
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "x-ratelimit-remaining": "100", "content-type": "application/json" },
    ...init,
  });
}

describe("fetchRepoData", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns mapped repo data on success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(sampleRepoResponse));

    const result = await fetchRepoData("erinlkolp", ["demo-repo"]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject<Partial<RepoData>>({
      name: "demo-repo",
      description: "A demo repo",
      language: "TypeScript",
      stars: 42,
      htmlUrl: "https://github.com/erinlkolp/demo-repo",
      unavailable: false,
    });
    expect(result[0].pushedAt).toBeInstanceOf(Date);
  });

  it("retries once on transient failure and succeeds", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("boom", { status: 503 }))
      .mockResolvedValueOnce(jsonResponse(sampleRepoResponse));

    const result = await fetchRepoData("erinlkolp", ["demo-repo"]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result[0].unavailable).toBe(false);
    expect(result[0].stars).toBe(42);
  });

  it("falls back to a placeholder when both attempts fail", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("boom", { status: 503 }))
      .mockResolvedValueOnce(new Response("boom", { status: 503 }));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await fetchRepoData("erinlkolp", ["demo-repo"]);

    expect(result).toEqual([
      {
        name: "demo-repo",
        description: "(unavailable)",
        language: null,
        stars: null,
        htmlUrl: "https://github.com/erinlkolp/demo-repo",
        pushedAt: null,
        unavailable: true,
      },
    ]);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("throws when rate limit is exhausted", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("rate limited", {
        status: 403,
        headers: { "x-ratelimit-remaining": "0" },
      }),
    );

    await expect(fetchRepoData("erinlkolp", ["demo-repo"])).rejects.toThrow(
      /rate limit/i,
    );
  });

  it("returns an empty array when given no repos", async () => {
    const result = await fetchRepoData("erinlkolp", []);
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
