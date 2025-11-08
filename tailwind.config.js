/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f17",
        neon: { pink: "#ff00e1", cyan: "#00f6ff", lime: "#8aff00", yellow: "#ffe700" }
      },
      fontFamily: { display: ["var(--font-orbitron)"], mono: ["var(--font-jetbrains)"] },
      boxShadow: {
        neon: "0 0 10px rgba(0,246,255,.7), 0 0 30px rgba(255,0,225,.35)",
        "neon-strong": "0 0 12px rgba(0,246,255,.9), 0 0 40px rgba(255,0,225,.7)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(0, 246, 255, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 246, 255, .08) 1px, transparent 1px)",
        "neon-gradient": "linear-gradient(90deg, #ff00e1, #00f6ff, #8aff00, #ffe700)"
      },
      backgroundSize: { grid: "40px 40px", "200": "200% 200%" },
      keyframes: {
        flicker: {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": { opacity: 1 },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": { opacity: .4 }
        },
        glow: {
          "0%, 100%": { filter: "drop-shadow(0 0 6px rgba(0,246,255,.75))" },
          "50%": { filter: "drop-shadow(0 0 18px rgba(255,0,225,.75))" }
        },
        "bg-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        }
      },
      animation: {
        flicker: "flicker 3s infinite",
        glow: "glow 4s ease-in-out infinite",
        "bg-pan": "bg-pan 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        scan: "scan 4s linear infinite"
      }
    }
  },
  plugins: []
};
