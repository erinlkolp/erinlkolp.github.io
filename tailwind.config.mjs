/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0d1117",
        bgAlt: "#161b22",
        fg: "#c9d1d9",
        fgMuted: "#8b949e",
        accent: "#58a6ff",
        accentGreen: "#7ee787",
        accentYellow: "#f0883e",
        border: "#30363d",
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
