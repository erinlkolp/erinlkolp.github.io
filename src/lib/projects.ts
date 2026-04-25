import { FEATURED, GITHUB_OWNER, type ProjectEntry } from "../data/projects";
import { fetchRepoData, type RepoData } from "./github";

export type Project = RepoData & {
  /** The manual blurb from `projects.ts`, if any. Prefer this over `description` when displaying. */
  blurb?: string;
};

export function displayDescription(p: Project): string {
  return p.blurb && p.blurb.trim().length > 0 ? p.blurb : p.description;
}

export async function getProjects(): Promise<Project[]> {
  const entries: ProjectEntry[] = FEATURED;
  const repoNames = entries.map((e) => e.repo);
  const fetched = await fetchRepoData(GITHUB_OWNER, repoNames);
  // Preserve the order from FEATURED.
  return entries.map((entry, idx) => ({
    ...fetched[idx],
    blurb: entry.blurb,
  }));
}
