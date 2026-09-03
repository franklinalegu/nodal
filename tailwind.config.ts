import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0a0a0c",
        surface: "#141417",
        panel: "#1a1a1e",
        border: "#26262b",
        muted: "#8a8a93",
      },
    },
  },
  plugins: [],
};
export default config;
