/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100ch", // add required value here
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        base: {
          black: "#100F0F",
          950: "#1C1B1A",
          900: "#282726",
          850: "#343331",
          800: "#403E3C",
          700: "#575653",
          600: "#6F6E69",
          500: "#878580",
          300: "#B7B5AC",
          200: "#CECDC3",
          150: "#DAD8CE",
          100: "#E6E4D9",
          50: "#F2F0E5",
          paper: "#FFFCF0",
        },
        light: {
          "color-red": "#AF3029",
          "color-orange": "#BC5215",
          "color-yellow": "#AD8301",
          "color-green": "#66800B",
          "color-cyan": "#24837B",
          "color-blue": "#205EA6",
          "color-purple": "#5E409D",
          "color-pink": "#A02F6F",

          "color-base-00": "#FFFCF0",
          "color-base-05": "#FFFCF0",
          "color-base-10": "#F2F0E5",
          "color-base-20": "#F2F0E5",
          "color-base-25": "#E6E4D9",
          "color-base-30": "#E6E4D9",
          "color-base-35": "#DAD8CE",
          "color-base-40": "#CECDC3",
          "color-base-50": "#B7B5AC",
          "color-base-60": "#878580",
          "color-base-70": "#6F6E69",
          "color-base-100": "#100F0F",
        },
        dark: {
          "color-red": "#D14D41",
          "color-orange": "#DA702C",
          "color-yellow": "#D0A215",
          "color-green": "#879A39",
          "color-cyan": "#3AA99F",
          "color-blue": "#4385BE",
          "color-purple": "#8B7EC8",
          "color-pink": "#CE5D97",

          "color-base-00": "#100F0F",
          "color-base-05": "#100F0F",
          "color-base-10": "#1C1B1A",
          "color-base-20": "#1C1B1A",
          "color-base-25": "#282726",
          "color-base-30": "#282726",
          "color-base-35": "#343331",
          "color-base-40": "#403E3C",
          "color-base-50": "#575653",
          "color-base-60": "#6F6E69",
          "color-base-70": "#878580",
          "color-base-100": "#CECDC3",
        },
      },
    },
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    require('@tailwindcss/typography')
  ],
}
