// =============================================
// ARQUIVO: src/components/CampoFormulario.jsx
// FUNÇÃO: Wrapper de label + campo reutilizável
// Compartilhado entre todos os modais do sistema
// =============================================

function CampoFormulario({ label, obrigatorio = false, children }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {label}
        {obrigatorio && (
          <span className="ml-1" style={{ color: "#ff0571" }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}

export default CampoFormulario;