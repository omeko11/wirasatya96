import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        polri: {
          navy: "#0A2540",
          navyDark: "#06182B",
          navyLight: "#143A61",
          gold: "#D4AF37",
          goldLight: "#F6E05E",
          goldDark: "#AA8C2C",
        },
      },
    },
  },
  plugins: [],
};
export default config;
