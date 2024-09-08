import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%)',
      },
    },
  },
  plugins: [],
};
export default config;
