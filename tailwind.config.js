/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F19",
        cardBg: "#1E293B",
        cardBorder: "#334155",
        brandAlpha: "rgba(0, 229, 255, 0.1)",
        brandAltAlpha: "rgba(168, 85, 247, 0.1)",
        primary: "#00E5FF",
        secondary: "#A855F7",
        danger: "#F43F5E",
        success: "#4ADE80",
        warning: "#EAB308",
        textMain: "#E0E7FF",
        textSec: "#9CA3AF"
      }
    },
  },
  plugins: [],
}
