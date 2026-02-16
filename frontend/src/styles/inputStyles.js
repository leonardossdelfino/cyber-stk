// =============================================
// ARQUIVO: src/styles/inputStyles.js
// FUNÇÃO: Estilos e handlers de input reutilizáveis
// Compartilhado entre todos os modais do sistema
// =============================================

export const estiloInput = {
  width:        "100%",
  background:   "rgba(255, 255, 255, 0.04)",
  border:       "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "8px",
  padding:      "10px 14px",
  color:        "#ffffff",
  fontSize:     "14px",
  outline:      "none",
  transition:   "border-color 0.2s, box-shadow 0.2s",
};

export const aoFocar = (e) => {
  e.target.style.borderColor = "rgba(255, 5, 113, 0.5)";
  e.target.style.boxShadow   = "0 0 0 3px rgba(255, 5, 113, 0.08)";
};

export const aoDesfocar = (e) => {
  e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
  e.target.style.boxShadow   = "none";
};