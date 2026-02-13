// src/components/ModalOC.jsx
import { useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import {
  useOC,
  OPCOES_STATUS,
  OPCOES_PAGAMENTO,
  OPCOES_APROVACAO,
} from "../hooks/useOC";

function Campo({ label, children, colSpan = "" }) {
  return (
    <div className={colSpan}>
      <label className="block text-xs font-medium text-carbon-800 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-carbon-400 border border-carbon-600 rounded-lg px-3 py-2 text-sm text-white placeholder-carbon-700 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime transition-all";

function ModalOC({ ocId = null, onFechar, onSalvo }) {
  const {
    form,
    loading,
    saving,
    erro,
    sucesso,
    handleChange,
    handleSubmit: handleSubmitHook,
  } = useOC(ocId, onSalvo);

  // Bloqueia scroll da página com modal aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onFechar(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onFechar]);

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.70)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Clique fora fecha */}
      <div className="absolute inset-0" onClick={onFechar} />

      {/* ===== JANELA DO MODAL ===== */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl z-10"
        style={{
          background: "rgba(39, 39, 39, 0.97)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          // Borda lime sutil com brilho suave simulando luz
          border: "1px solid rgba(177, 255, 0, 0.25)",
          boxShadow: `
            0 0 20px rgba(177, 255, 0, 0.05),
            0 0 60px rgba(177, 255, 0, 0.03),
            0 25px 60px rgba(0, 0, 0, 0.8)
          `,
        }}
      >

        {/* ===== HEADER ===== */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(177, 255, 0, 0.15)" }}
        >
          <div>
            <h2 className="text-lg font-bold text-white">
              {ocId ? "Editar Ordem de Compra" : "Nova Ordem de Compra"}
            </h2>
            <p className="text-xs text-carbon-800 mt-0.5">
              {ocId ? `Editando OC #${ocId}` : "Preencha os dados da nova OC"}
            </p>
          </div>

          <button
            onClick={onFechar}
            className="p-2 rounded-lg text-carbon-800 hover:text-white hover:bg-carbon-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ===== CORPO ===== */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-flame" size={36} />
          </div>
        ) : (
          <form onSubmit={handleSubmitHook}>
            <div className="px-6 py-5 space-y-6">

              {/* Feedback */}
              {erro && (
                <div className="p-3 rounded-lg border text-sm"
                  style={{ background: "rgba(255,156,0,0.08)", borderColor: "rgba(255,156,0,0.3)", color: "#ff9c00" }}>
                  ⚠️ {erro}
                </div>
              )}
              {sucesso && (
                <div className="p-3 rounded-lg border text-sm"
                  style={{ background: "rgba(77,255,0,0.08)", borderColor: "rgba(77,255,0,0.3)", color: "#4dff00" }}>
                  ✅ {sucesso}
                </div>
              )}

              {/* --- IDENTIFICAÇÃO --- */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#b1ff00" }}>
                  Identificação
                </p>
                <div className="grid grid-cols-2 gap-3">

                  <Campo label="Número da OC *">
                    <input type="text" name="oc_numero" value={form.oc_numero}
                      onChange={handleChange} placeholder="Ex: 1284065821"
                      className={inputClass} />
                  </Campo>

                  <Campo label="Nome do Fornecedor *">
                    <input type="text" name="oc_nome_fornecedor" value={form.oc_nome_fornecedor}
                      onChange={handleChange} placeholder="Ex: Apple, Worldzone..."
                      className={inputClass} />
                  </Campo>

                  <Campo label="Descrição *" colSpan="col-span-2">
                    <textarea name="oc_descricao" value={form.oc_descricao}
                      onChange={handleChange} placeholder="Descreva o que está sendo comprado..."
                      rows={3} className={`${inputClass} resize-none`} />
                  </Campo>

                </div>
              </div>

              {/* --- VALORES E PAGAMENTO --- */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#b1ff00" }}>
                  Valores e Pagamento
                </p>
                <div className="grid grid-cols-3 gap-3">

                  <Campo label="Valor (R$) *">
                    <input type="number" name="oc_valor" value={form.oc_valor}
                      onChange={handleChange} placeholder="0.00" step="0.01" min="0"
                      className={inputClass} />
                  </Campo>

                  <Campo label="Forma de Pagamento *">
                    <select name="oc_forma_pagamento" value={form.oc_forma_pagamento}
                      onChange={handleChange} className={inputClass}>
                      {OPCOES_PAGAMENTO.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </Campo>

                  <Campo label="Data de Referência *">
                    <input type="date" name="oc_data_referencia" value={form.oc_data_referencia}
                      onChange={handleChange} className={inputClass} />
                  </Campo>

                </div>
              </div>

              {/* --- STATUS E APROVAÇÃO --- */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#b1ff00" }}>
                  Status e Aprovação
                </p>
                <div className="grid grid-cols-2 gap-3">

                  <Campo label="Status *">
                    <select name="oc_status" value={form.oc_status}
                      onChange={handleChange} className={inputClass}>
                      {OPCOES_STATUS.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </Campo>

                  <Campo label="Aprovação *">
                    <select name="oc_aprovacao" value={form.oc_aprovacao}
                      onChange={handleChange} className={inputClass}>
                      {OPCOES_APROVACAO.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </Campo>

                </div>
              </div>

              {/* --- RESPONSÁVEL --- */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#b1ff00" }}>
                  Responsável
                </p>
                <div className="grid grid-cols-2 gap-3">

                  <Campo label="Centro de Custo *">
                    <input type="text" name="oc_centro_de_custo" value={form.oc_centro_de_custo}
                      onChange={handleChange} placeholder="Ex: TI, Marketing, RH..."
                      className={inputClass} />
                  </Campo>

                  <Campo label="Solicitante *">
                    <input type="text" name="oc_solicitante" value={form.oc_solicitante}
                      onChange={handleChange} placeholder="Nome de quem solicitou"
                      className={inputClass} />
                  </Campo>

                </div>
              </div>

            </div>

            {/* ===== FOOTER ===== */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: "rgba(177, 255, 0, 0.15)" }}
            >
              <button
                type="button" onClick={onFechar}
                className="px-5 py-2 rounded-lg border border-carbon-600 text-carbon-800 hover:bg-carbon-600 hover:text-white transition-colors text-sm font-medium"
              >
                Cancelar
              </button>

              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-carbon text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  background: saving ? "#b1ff00" : "#ff9c00",
                  boxShadow: saving ? "none" : "0 0 20px rgba(255, 156, 0, 0.30)",
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