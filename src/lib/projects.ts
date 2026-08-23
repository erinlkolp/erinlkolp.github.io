import { GROUPS, GITHUB_OWNER, type ProjectEntry } from "../data/projects";
import { fetchRepoData, type RepoData } from "./github";

export type Project = RepoData & {
  /** The manual blurb from `projects.ts`, if any. Prefer this over `description` when displaying. */
  blurb?: string;
};

export type ProjectGroup = {
  name: string;
  projects: Project[];
};

export function displayDescription(p: Project): string {
  return p.blurb && p.blurb.trim().length > 0 ? p.blurb : p.description;
}

async function loadProjectGroups(): Promise<ProjectGroup[]> {
  // Flatten to a single fetch so one pass over the API covers every group.
  const entries: ProjectEntry[] = GROUPS.flatMap((g) => g.entries);
  const fetched = await fetchRepoData(GITHUB_OWNER, entries.map((e) => e.repo));

  let cursor = 0;
  return GROUPS.map((group) => ({
    name: group.name,
    projects: group.entries.map((entry) => ({
      ...fetched[cursor++],
      blurb: entry.blurb,
    })),
  }));
}

/**
 * Shared across every page rendered in a single build, so the homepage and the
 * projects page cost one pass over the GitHub API rather than one each.
 */
let cached: Promise<ProjectGroup[]> | null = null;

export function getProjectGroups(): Promise<ProjectGroup[]> {
  cached ??= loadProjectGroups();
  return cached;
}

/** Every featured project as one flat list, in group order. */
export async function getProjects(): Promise<Project[]> {
  const groups = await getProjectGroups();
  return groups.flatMap((g) => g.projects);
}
