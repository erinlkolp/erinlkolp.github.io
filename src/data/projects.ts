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
  { repo: "vu1-dial-python-module" },
  { repo: "alexa-plex-music-player-skill" },
  { repo: "erin-slack-notes-bot" },
  { repo: "liquibase-percona-mysql-docker-demo" },
];

export const GITHUB_OWNER = "erinlkolp";
