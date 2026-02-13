// =============================================
// tailwind.config.js
// Paleta oficial Cyber Finance — v3
//
// #111111 — fundo de TUDO sem exceção
// #ff0571 — rosa/pink — destaque principal (botões, bordas ativas)
// #c2ff05 — verde limão — destaque secundário (confirmações, tags)
// #ffa300 — âmbar — destaque terciário (alertas, avisos)
// =============================================

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {

        // ─── FUNDO PRINCIPAL ──────────────────────────────
        void: {
          DEFAULT: '#111111',
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#c2c2c2',
          300: '#a3a3a3',
          400: '#858585',
          500: '#666666',
          600: '#474747',
          700: '#292929',
          800: '#1a1a1a',
          900: '#0a0a0a',
        },

        // ─── ROSA / PINK — destaque principal ────────────
        neon_pink: {
          DEFAULT: '#ff0571',
          50:  '#fff0f5',
          100: '#ffd6e7',
          200: '#ffadcf',
          300: '#ff85b7',
          400: '#ff3c94',
          500: '#ff0571',
          600: '#cc0059',
          700: '#990042',
          800: '#66002c',
          900: '#330016',
        },

        // ─── VERDE LIMÃO — destaque secundário ───────────
        acid: {
          DEFAULT: '#c2ff05',
          50:  '#f7ffe0',
          100: '#eaffb3',
          200: '#d5ff66',
          300: '#c2ff05',
          400: '#a8df00',
          500: '#8bbf00',
          600: '#6e9900',
          700: '#527300',
          800: '#354d00',
          900: '#192600',
        },

        // ─── ÂMBAR — destaque terciário ──────────────────
        amber: {
          DEFAULT: '#ffa300',
          50:  '#fff8e6',
          100: '#ffedb3',
          200: '#ffd966',
          300: '#ffc41a',
          400: '#ffa300',
          500: '#cc8200',
          600: '#996200',
          700: '#664100',
          800: '#332100',
          900: '#1a1000',
        },

      },
    },
  },
  plugins: [],
}