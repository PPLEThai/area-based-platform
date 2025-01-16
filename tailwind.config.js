/** @type {import('tailwindcss').Config} */
const {
  fontFamily
} = require("tailwindcss/defaultTheme");

export default {
  darkMode: 'class', // Enables class-based dark mode
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        anakotmai: ["Anakotmai", ...fontFamily.sans],
      },
      fontWeight: {
        light: '400',
        medium: '500',
        bold: '700',
      },
      colors: {
        primary: '#ff6a13',
        secondary: '#052b49',
        subprimary: '#f7f7f7',
        // Additional colors for dark mode
        dark: {
          primary: '#ffa366',
          secondary: '#0a192f',
          subprimary: '#1e293b',
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
};