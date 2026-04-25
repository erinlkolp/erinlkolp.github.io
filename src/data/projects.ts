export type ProjectEntry = {
  /** Repo name (owner is implicit). */
  repo: string;
  /** Optional manual one-liner; overrides the GitHub description for display when present. */
  blurb?: string;
};

/**
 * Curated, ordered list of repos to feature on the site.
 * Display order on the site matches the order of this array.
 */
export const FEATURED: ProjectEntry[] = [
  // Add entries like: { repo: "some-repo", blurb: "Optional one-liner" },
];

export const GITHUB_OWNER = "erinlkolp";
