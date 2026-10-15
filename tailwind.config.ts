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
        bareskrim: {
          DEFAULT: "#8B0000", // Merah Tua Bareskrim
          dark: "#660000",
          crimson: "#991B1B",
          maroon: "#800020",
          light: "#B91C1C",
          subtle: "#FEF2F2",
          border: "#FECACA",
          gold: "#C5A059",
          goldDark: "#92400E",
        },
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
