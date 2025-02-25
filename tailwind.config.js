import defaultTheme from "tailwindcss/defaultTheme";
import tailwindDotGridBackgrounds from "@nauverse/tailwind-dot-grid-backgrounds";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [tailwindDotGridBackgrounds],
};
