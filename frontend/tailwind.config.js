// tailwind.config.js
// Diz ao Tailwind quais arquivos ele deve escanear para gerar o CSS
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // todos os arquivos dentro de /src
  ],
  theme: {
    extend: {
      // Aqui você pode adicionar cores e estilos customizados no futuro
    },
  },
  plugins: [],
}