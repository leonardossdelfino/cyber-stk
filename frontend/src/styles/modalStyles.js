// =============================================
// ARQUIVO: src/styles/modalStyles.js
// FUNÇÃO: Estilos centralizados para todos os modais
// =============================================

// Overlay escuro que cobre a tela
export const estiloOverlay = {
  position:        "fixed",
  inset:           0,
  zIndex:          50,
  display:         "flex",
  alignItems:      "center",
  justifyContent:  "center",
  padding:         "16px",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
};

// Caixa do modal — fundo escuro levemente transparente
export const estiloModal = (maxWidth = "640px") => ({
  width:        "100%",
  maxWidth,
  maxHeight:    "90vh",
  overflowY:    "auto",
  borderRadius: "16px",
  background:   "rgba(20, 20, 20, 0.97)",
  border:       "1px solid rgba(255, 5, 113, 0.25)",
  boxShadow:    "0 24px 64px rgba(0, 0, 0, 0.70)",
});

// Cabeçalho do modal
export const estiloHeader = {
  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
};

// Rodapé do modal
export const estiloFooter = {
  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
};

// Botão fechar (X)
export const estiloBtnFechar = {
  background: "rgba(255,255,255,0.05)",
  border:     "1px solid rgba(255,255,255,0.08)",
  color:      "rgba(255,255,255,0.5)",
};

export const estiloBtnFecharHover = {
  background:  "rgba(255, 5, 113, 0.12)",
  borderColor: "rgba(255, 5, 113, 0.30)",
  color:       "#ff0571",
};

// Botão cancelar
export const estiloBtnCancelar = {
  background: "rgba(255,255,255,0.04)",
  border:     "1px solid rgba(255,255,255,0.10)",
  color:      "rgba(255,255,255,0.55)",
};

// Botão salvar
export const estiloBtnSalvar = (salvando) => ({
  background: salvando ? "rgba(255, 5, 113, 0.40)" : "#ff0571",
  color:      "#ffffff",
  border:     "1px solid rgba(255, 5, 113, 0.60)",
  boxShadow:  salvando ? "none" : "0 0 20px rgba(255, 5, 113, 0.30)",
  cursor:     salvando ? "not-allowed" : "pointer",
  opacity:    salvando ? 0.7 : 1,
});

// Caixa de erro
export const estiloErro = {
  background: "rgba(255, 5, 113, 0.10)",
  border:     "1px solid rgba(255, 5, 113, 0.25)",
  color:      "#ff6ba8",
};

// Caixa de sucesso
export const estiloSucesso = {
  background: "rgba(194, 255, 5, 0.08)",
  border:     "1px solid rgba(194, 255, 5, 0.25)",
  color:      "#c2ff05",
};