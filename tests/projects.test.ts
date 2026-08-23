import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RepoData } from "../src/lib/github";

const fetchRepoData = vi.fn();

vi.mock("../src/lib/github", () => ({
  fetchRepoData: (...args: unknown[]) => fetchRepoData(...args),
}));

vi.mock("../src/data/projects", () => ({
  GITHUB_OWNER: "erinlkolp",
  GROUPS: [
    {
      name: "Group One",
      entries: [{ repo: "alpha" }, { repo: "beta", blurb: "Hand-written blurb." }],
    },
    {
      name: "Group Two",
      entries: [{ repo: "gamma" }],
    },
  ],
}));

function repo(name: string, description = `desc of ${name}`): RepoData {
  return {
    name,
    description,
    language: "Python",
    stars: 1,
    htmlUrl: `https://github.com/erinlkolp/${name}`,
    pushedAt: new Date("2026-04-20T12:00:00Z"),
    unavailable: false,
  };
}

describe("getProjectGroups", () => {
  beforeEach(() => {
    fetchRepoData.mockReset();
    // getProjectGroups caches per module instance; reload it for each test.
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves group order and within-group order", async () => {
    fetchRepoData.mockResolvedValueOnce([repo("alpha"), repo("beta"), repo("gamma")]);
    const { getProjectGroups } = await import("../src/lib/projects");

    const groups = await getProjectGroups();

    expect(groups.map((g) => g.name)).toEqual(["Group One", "Group Two"]);
    expect(groups[0].projects.map((p) => p.name)).toEqual(["alpha", "beta"]);
    expect(groups[1].projects.map((p) => p.name)).toEqual(["gamma"]);
  });

  it("fetches every repo across all groups in a single call", async () => {
    fetchRepoData.mockResolvedValueOnce([repo("alpha"), repo("beta"), repo("gamma")]);
    const { getProjectGroups } = await import("../src/lib/projects");

    await getProjectGroups();

    expect(fetchRepoData).toHaveBeenCalledTimes(1);
    expect(fetchRepoData).toHaveBeenCalledWith("erinlkolp", ["alpha", "beta", "gamma"]);
  });

  it("attaches the manual blurb to the matching entry", async () => {
    fetchRepoData.mockResolvedValueOnce([repo("alpha"), repo("beta"), repo("gamma")]);
    const { getProjectGroups, displayDescription } = await import("../src/lib/projects");

    const groups = await getProjectGroups();
    const [alpha, beta] = groups[0].projects;

    expect(displayDescription(alpha)).toBe("desc of alpha");
    expect(displayDescription(beta)).toBe("Hand-written blurb.");
  });

  it("falls back to the GitHub description when the blurb is blank", async () => {
    fetchRepoData.mockResolvedValueOnce([repo("alpha"), repo("beta"), repo("gamma")]);
    const { displayDescription } = await import("../src/lib/projects");

    expect(displayDescription({ ...repo("alpha"), blurb: "   " })).toBe("desc of alpha");
  });

  it("caches across calls so one build makes a single API pass", async () => {
    fetchRepoData.mockResolvedValueOnce([repo("alpha"), repo("beta"), repo("gamma")]);
    const { getProjectGroups, getProjects } = await import("../src/lib/projects");

    await getProjectGroups();
    await getProjectGroups();
    await getProjects();

    expect(fetchRepoData).toHaveBeenCalledTimes(1);
  });
});

describe("getProjects", () => {
  beforeEach(() => {
    fetchRepoData.mockReset();
    vi.resetModules();
  });

  it("flattens every group into one list in group order", async () => {
    fetchRepoData.mockResolvedValueOnce([repo("alpha"), repo("beta"), repo("gamma")]);
    const { getProjects } = await import("../src/lib/projects");

    const projects = await getProjects();

    expect(projects.map((p) => p.name)).toEqual(["alpha", "beta", "gamma"]);
  });
});
