export type ProjectEntry = {
  /** Repo name (owner is implicit). */
  repo: string;
  /** Optional manual one-liner; overrides the GitHub description for display when present. */
  blurb?: string;
};

export type ProjectGroupEntry = {
  /** Section heading shown on the projects page. */
  name: string;
  entries: ProjectEntry[];
};

/**
 * Curated, ordered list of repo groups to feature on the site.
 * Section order matches this array; card order matches each `entries` array.
 */
export const GROUPS: ProjectGroupEntry[] = [
  {
    name: "Google Glass",
    entries: [
      { repo: "google-glass-notifications" },
      { repo: "google-glass-gesture-launcher" },
      { repo: "google-glass-spotify-widget" },
      { repo: "google-glass-copy-photos" },
    ],
  },
  {
    name: "VU Dials",
    entries: [
      { repo: "vu-dials-module" },
      { repo: "vu-dials-gem" },
    ],
  },
  {
    name: "Bots, MCP & Languages",
    entries: [
      { repo: "erin-slack-notes-bot" },
      { repo: "discord-mcp-server" },
      { repo: "recallnest" },
      { repo: "charlottelang" },
      { repo: "alexa-plex-music-player-skill" },
    ],
  },
];

export const GITHUB_OWNER = "erinlkolp";
