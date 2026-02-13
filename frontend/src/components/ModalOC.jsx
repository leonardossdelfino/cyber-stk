// =============================================
// ARQUIVO: src/components/ModalOC.jsx
// FUNÇÃO: Modal de criação e edição de OC
// Efeito glassmorphism — fundo vidro translúcido
// Borda #ff0571 com glow suave simulando luz
// Paleta v3 — fundo #111111
// =============================================

import { useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { useOC, OPCOES_STATUS, OPCOES_PAGAMENTO, OPCOES_APROVACAO } from "../hooks/useOC";

// -----------------------------------------------
// Campo de formulário reutilizável
// -----------------------------------------------
function Campo({ label, obrigatorio = false, children }) {
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

// -----------------------------------------------
// Estilos base dos inputs — reutilizáveis
// -----------------------------------------------
const estiloInput = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "8px",
  padding: "10px 14px",
  color: "#ffffff",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

// Focus: borda pink sutil
const aoFocar = (e) => {
  e.target.style.borderColor = "rgba(255, 5, 113, 0.5)";
  e.target.style.boxShadow   = "0 0 0 3px rgba(255, 5, 113, 0.08)";
};
const aoDesfocar = (e) => {
  e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
  e.target.style.boxShadow   = "none";
};

// -----------------------------------------------
// ModalOC
// -----------------------------------------------
function ModalOC({ ocId = null, onFechar, onSalvo }) {
  const { form, loading, saving, erro, sucesso, handleChange, handleSubmit } =
    useOC(ocId, onSalvo);

  // Bloqueia scroll da página enquanto o modal está aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Fecha ao clicar fora (no overlay)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onFechar();
  };

  return (
    /* ===== OVERLAY ===== */
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        // fundo escuro levemente embaçado
        backgroundColor: "rgba(0, 0, 0, 0.70)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >

      {/* ===== JANELA DO MODAL — efeito vidro ===== */}
      <div
        style={{
          width: "100%",
          maxWidth: "740px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "16px",
          // Vidro: fundo semitransparente com blur forte
          background: "rgba(17, 17, 17, 0.80)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          // Borda pink sutil
          border: "1px solid rgba(255, 5, 113, 0.30)",
          // Glow: simula luz fraca vindo da borda
          boxShadow: `
            0 0 0 1px rgba(255, 5, 113, 0.08),
            0 0 24px rgba(255, 5, 113, 0.10),
            0 0 60px rgba(255, 5, 113, 0.05),
            0 32px 64px rgba(0, 0, 0, 0.80)
          `,
          // Linha de luz no topo (toque de elegância)
          outline: "1px solid rgba(255, 255, 255, 0.04)",
        }}
      >

        {/* ── Cabeçalho ── */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
        >
          <div>
            <h2 className="text-base font-semibold text-white">
              {ocId ? "Editar Ordem de Compra" : "Nova Ordem de Compra"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {ocId ? `Editando OC #${ocId}` : "Preencha os dados da nova OC"}
            </p>
          </div>

          {/* Botão fechar */}
          <button
            onClick={onFechar}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 5, 113, 0.12)";
              e.currentTarget.style.borderColor = "rgba(255, 5, 113, 0.30)";
              e.currentTarget.style.color = "#ff0571";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Conteúdo ── */}
        {loading ? (
          /* Carregando dados (modo edição) */
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} style={{ color: "#ff0571" }} className="animate-spin" />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Carregando...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">

            {/* ── Mensagens de feedback ── */}
            {erro && (
              <div
                className="mb-5 px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "rgba(255, 5, 113, 0.10)",
                  border: "1px solid rgba(255, 5, 113, 0.25)",
                  color: "#ff6ba8",
                }}
              >
                {erro}
              </div>
            )}
            {sucesso && (
              <div
                className="mb-5 px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "rgba(194, 255, 5, 0.08)",
                  border: "1px solid rgba(194, 255, 5, 0.25)",
                  color: "#c2ff05",
                }}
              >
                {sucesso}
              </div>
            )}

            {/* ── Seção 1: Identificação ── */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4"
               style={{ color: "#ff0571" }}>
              Identificação
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">

              {/* Número OC */}
              <Campo label="Número da OC" obrigatorio>
                <input
                  type="text"
                  name="oc_numero"
                  value={form.oc_numero}
                  onChange={handleChange}
                  placeholder="Ex: OC-2024-001"
                  style={estiloInput}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                />
              </Campo>

              {/* Solicitante — opcional */}
              <Campo label="Solicitante">
                <input
                  type="text"
                  name="oc_solicitante"
                  value={form.oc_solicitante}
                  onChange={handleChange}
                  placeholder="Nome de quem solicitou"
                  style={estiloInput}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                />
              </Campo>

              {/* Descrição — ocupa linha inteira */}
              <div className="col-span-2">
                <Campo label="Descrição" obrigatorio>
                  <textarea
                    name="oc_descricao"
                    value={form.oc_descricao}
                    onChange={handleChange}
                    placeholder="Descreva o que está sendo comprado..."
                    rows={3}
                    style={{ ...estiloInput, resize: "vertical" }}
                    onFocus={aoFocar}
                    onBlur={aoDesfocar}
                  />
                </Campo>
              </div>

            </div>

            {/* ── Seção 2: Fornecedor e Valor ── */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4"
               style={{ color: "#ffa300" }}>
              Fornecedor e Valor
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">

              {/* Fornecedor */}
              <Campo label="Fornecedor" obrigatorio>
                <input
                  type="text"
                  name="oc_nome_fornecedor"
                  value={form.oc_nome_fornecedor}
                  onChange={handleChange}
                  placeholder="Nome do fornecedor"
                  style={estiloInput}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                />
              </Campo>

              {/* Valor — número simples, formatado só na listagem */}
              <Campo label="Valor (R$)" obrigatorio>
                <input
                  type="number"
                  name="oc_valor"
                  value={form.oc_valor}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  style={estiloInput}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                />
              </Campo>

              {/* Forma de pagamento — obrigatório */}
              <Campo label="Forma de Pagamento" obrigatorio>
                <select
                  name="oc_forma_pagamento"
                  value={form.oc_forma_pagamento}
                  onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                >
                  {OPCOES_PAGAMENTO.map((op) => (
                    <option key={op} value={op} style={{ background: "#1a1a1a" }}>
                      {op}
                    </option>
                  ))}
                </select>
              </Campo>

              {/* Data de abertura */}
              <Campo label="Data de Abertura" obrigatorio>
                <input
                  type="date"
                  name="oc_data_referencia"
                  value={form.oc_data_referencia}
                  onChange={handleChange}
                  style={{ ...estiloInput, colorScheme: "dark" }}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                />
              </Campo>

            </div>

            {/* ── Seção 3: Status e Aprovação ── */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4"
               style={{ color: "#c2ff05" }}>
              Status e Aprovação
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">

              {/* Centro de custo — opcional */}
              <Campo label="Centro de Custo">
                <input
                  type="text"
                  name="oc_centro_de_custo"
                  value={form.oc_centro_de_custo}
                  onChange={handleChange}
                  placeholder="Ex: TI, Marketing..."
                  style={estiloInput}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                />
              </Campo>

              {/* Status — opcional */}
              <Campo label="Status">
                <select
                  name="oc_status"
                  value={form.oc_status}
                  onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                >
                  {OPCOES_STATUS.map((op) => (
                    <option key={op} value={op} style={{ background: "#1a1a1a" }}>
                      {op}
                    </option>
                  ))}
                </select>
              </Campo>

              {/* Aprovação — opcional */}
              <Campo label="Aprovação">
                <select
                  name="oc_aprovacao"
                  value={form.oc_aprovacao}
                  onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }}
                  onFocus={aoFocar}
                  onBlur={aoDesfocar}
                >
                  {OPCOES_APROVACAO.map((op) => (
                    <option key={op} value={op} style={{ background: "#1a1a1a" }}>
                      {op}
                    </option>
                  ))}
                </select>
              </Campo>

            </div>

            {/* ── Botões de ação ── */}
            <div
              className="flex items-center justify-end gap-3 pt-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >

              {/* Cancelar */}
              <button
                type="button"
                onClick={onFechar}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.55)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                }}
              >
                Cancelar
              </button>

              {/* Salvar */}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={{
                  background: saving
                    ? "rgba(255, 5, 113, 0.40)"
                    : "#ff0571",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 5, 113, 0.60)",
                  boxShadow: saving
                    ? "none"
                    : "0 0 20px rgba(255, 5, 113, 0.30)",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving ? "Salvando..." : "Salvar OC"}
              </button>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}

export default ModalOC;