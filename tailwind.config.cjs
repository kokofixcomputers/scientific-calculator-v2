/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,css}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)",
        soft: "0 8px 20px rgba(0,0,0,0.06)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
}
