// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // =============================================
        // Paleta de cores do Cyber Finance
        // #0c090d — fundo de tudo (menus, páginas, modals, forms)
        // =============================================
        onyx: {
          DEFAULT: '#0c090d',
          100: '#020202', 200: '#040305', 300: '#070507', 400: '#09070a',
          500: '#0c090d', 600: '#403146', 700: '#765980', 800: '#a68baf', 900: '#d2c5d7'
        },
        amaranth: {
          DEFAULT: '#e01a4f',
          100: '#2d0510', 200: '#590a20', 300: '#86102f', 400: '#b3153f',
          500: '#e01a4f', 600: '#e94571', 700: '#ef7394', 800: '#f4a2b8', 900: '#fad0db'
        },
        tomato: {
          DEFAULT: '#f15946',
          100: '#3a0b04', 200: '#741509', 300: '#ae200d', 400: '#e72a11',
          500: '#f15946', 600: '#f47b6b', 700: '#f79c90', 800: '#f9bdb5', 900: '#fcdeda'
        },
        tuscan_sun: {
          DEFAULT: '#f9c22e',
          100: '#392b02', 200: '#735504', 300: '#ac8005', 400: '#e6aa07',
          500: '#f9c22e', 600: '#facf59', 700: '#fbdb82', 800: '#fce7ac', 900: '#fef3d5'
        },
        pacific_blue: {
          DEFAULT: '#53b3cb',
          100: '#0d262c', 200: '#1a4c58', 300: '#277184', 400: '#3597b0',
          500: '#53b3cb', 600: '#75c2d6', 700: '#97d1e0', 800: '#bae1ea', 900: '#dcf0f5'
        },
      }
    },
  },
  plugins: [],
}