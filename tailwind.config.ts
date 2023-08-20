import { type Config } from "tailwindcss";

export default {
  plugins: [
    require('flowbite/plugin'),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./node_modules/flowbite/**/*.js"],
} satisfies Config;
