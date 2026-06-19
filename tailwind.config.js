/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        wine: {
          50: "#FAF3F4",
          100: "#F2DEE0",
          200: "#E5BEC3",
          300: "#D5979E",
          400: "#C26B75",
          500: "#A94753",
          600: "#8A3843",
          700: "#722F37",
          800: "#5C262D",
          900: "#4A1F24",
          950: "#2E1216",
        },
        gold: {
          50: "#FBF8F0",
          100: "#F5EEDC",
          200: "#EADBB6",
          300: "#DEC48A",
          400: "#D4AE63",
          500: "#C9A962",
          600: "#B89043",
          700: "#997234",
          800: "#7C5C2E",
          900: "#664C29",
          950: "#382814",
        },
        charcoal: {
          50: "#F6F6F6",
          100: "#E7E7E7",
          200: "#D1D1D1",
          300: "#B0B0B0",
          400: "#888888",
          500: "#6D6D6D",
          600: "#5D5D5D",
          700: "#4F4F4F",
          800: "#333333",
          900: "#1A1A1A",
          950: "#0F0F0F",
        },
        ivory: {
          50: "#FDFBF6",
          100: "#FAF6EB",
          200: "#F5F1E8",
          300: "#EDE5D0",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'gold-shimmer': 'linear-gradient(135deg, #C9A962 0%, #EADBB6 50%, #C9A962 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px -8px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 40px -8px rgba(201, 169, 98, 0.15)',
        'glow-gold': '0 0 20px rgba(201, 169, 98, 0.2)',
        'glow-wine': '0 0 20px rgba(114, 47, 55, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
