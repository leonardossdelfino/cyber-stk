// =============================================
// ARQUIVO: src/components/ModalFornecedor.jsx
// FUNÇÃO: Modal para criar e editar fornecedores
// Glassmorphism + borda pink + glow
// =============================================

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import {
  criarFornecedor,
  atualizarFornecedor,
} from "../services/api";

// ── Estado inicial do formulário ──────────────
const FORM_INICIAL = {
  razao_social: "",
  cnpj:         "",
  contato:      "",
  email:        "",
  descricao:    "",
};

function ModalFornecedor({ aberto, onFechar, onSalvo, fornecedorEdicao }) {
  const [form,      setForm]      = useState(FORM_INICIAL);
  const [salvando,  setSalvando]  = useState(false);
  const [erro,      setErro]      = useState("");

  const modoEdicao = !!fornecedorEdicao;

  // Preenche o form ao editar
  useEffect(() => {
    if (fornecedorEdicao) {
      setForm({
        razao_social: fornecedorEdicao.razao_social ?? "",
        cnpj:         fornecedorEdicao.cnpj         ?? "",
        contato:      fornecedorEdicao.contato       ?? "",
        email:        fornecedorEdicao.email         ?? "",
        descricao:    fornecedorEdicao.descricao     ?? "",
      });
    } else {
      setForm(FORM_INICIAL);
    }
    setErro("");
  }, [fornecedorEdicao, aberto]);

  if (!aberto) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro("");
  };

  const handleSalvar = async () => {
    if (!form.razao_social.trim()) {
      setErro("Razão social é obrigatória.");
      return;
    }

    setSalvando(true);
    try {
      if (modoEdicao) {
        await atualizarFornecedor(fornecedorEdicao.id, form);
      } else {
        await criarFornecedor(form);
      }
      onSalvo();
      onFechar();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      {/* Modal */}
      <div
        className="w-full max-w-lg rounded-2xl p-6 relative"
        style={{
          background:   "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border:       "1px solid rgba(255, 5, 113, 0.35)",
          boxShadow:    "0 0 40px rgba(255, 5, 113, 0.12), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Cabeçalho ── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {modoEdicao ? "Editar Fornecedor" : "Novo Fornecedor"}
          </h2>
          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ff0571"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Formulário ── */}
        <div className="space-y-4">

          {/* Razão Social */}
          <div>
            <label className="block text-xs font-medium mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              Razão Social <span style={{ color: "#ff0571" }}>*</span>
            </label>
            <input
              name="razao_social"
              value={form.razao_social}
              onChange={handleChange}
              placeholder="Nome da empresa"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border:     "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(255,5,113,0.5)"}
              onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* CNPJ + Contato lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                CNPJ
              </label>
              <input
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border:     "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(255,5,113,0.5)"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                Contato
              </label>
              <input
                name="contato"
                value={form.contato}
                onChange={handleChange}
                placeholder="Nome do contato"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border:     "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(255,5,113,0.5)"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              E-mail
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@empresa.com"
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border:     "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(255,5,113,0.5)"}
              onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              Descrição / Observações
            </label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o fornecedor..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all resize-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border:     "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(255,5,113,0.5)"}
              onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {/* Erro */}
          {erro && (
            <p className="text-xs px-3 py-2 rounded-lg"
              style={{ color: "#ff0571", background: "rgba(255,5,113,0.08)", border: "1px solid rgba(255,5,113,0.2)" }}>
              {erro}
            </p>
          )}

        </div>

        {/* ── Rodapé ── */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onFechar}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              color:      "rgba(255,255,255,0.5)",
              border:     "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            Cancelar
          </button>

          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all"
            style={{
              background:  salvando ? "rgba(255,5,113,0.4)" : "#ff0571",
              color:       "#fff",
              boxShadow:   salvando ? "none" : "0 0 20px rgba(255,5,113,0.35)",
            }}
          >
            {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalFornecedor;