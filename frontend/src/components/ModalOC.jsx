// =============================================
// ARQUIVO: src/components/ModalOC.jsx
// =============================================

import { useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { useOC } from "../hooks/useOC";
import InputFornecedor from "./InputFornecedor";
import Campo from "./CampoFormulario";
import { estiloInput, aoFocar, aoDesfocar } from "../styles/inputStyles";
import {
  estiloOverlay, estiloModal, estiloHeader, estiloFooter,
  estiloBtnFechar, estiloBtnFecharHover,
  estiloBtnCancelar, estiloBtnSalvar,
  estiloErro, estiloSucesso,
} from "../styles/modalStyles";

function ModalOC({ ocId = null, onFechar, onSalvo }) {
  const {
    form, loading, saving, erro, sucesso,
    handleChange, handleSubmit, setField,
    opcoesStatus, opcoesPagamento, opcoesAprovacao, fornecedores,
  } = useOC(ocId, onSalvo);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={(e) => e.target === e.currentTarget && onFechar()} style={estiloOverlay}>
      <div style={estiloModal("740px")}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5" style={estiloHeader}>
          <div>
            <h2 className="text-base font-semibold text-white">
              {ocId ? "Editar Ordem de Compra" : "Nova Ordem de Compra"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {ocId ? `Editando OC #${ocId}` : "Preencha os dados da nova OC"}
            </p>
          </div>
          <button
            onClick={onFechar}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={estiloBtnFechar}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, estiloBtnFecharHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, estiloBtnFechar)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} style={{ color: "#ff0571" }} className="animate-spin" />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Carregando...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">

            {erro    && <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={estiloErro}>{erro}</div>}
            {sucesso && <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={estiloSucesso}>{sucesso}</div>}

            {/* Seção 1 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#ff0571" }}>
              Identificação
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Campo label="Número da OC" obrigatorio>
                <input type="text" name="oc_numero" value={form.oc_numero}
                  onChange={handleChange} placeholder="Ex: OC-2024-001"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Solicitante">
                <input type="text" name="oc_solicitante" value={form.oc_solicitante}
                  onChange={handleChange} placeholder="Nome de quem solicitou"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <div className="col-span-2">
                <Campo label="Descrição" obrigatorio>
                  <textarea name="oc_descricao" value={form.oc_descricao}
                    onChange={handleChange} placeholder="Descreva o que está sendo comprado..."
                    rows={3} style={{ ...estiloInput, resize: "vertical" }}
                    onFocus={aoFocar} onBlur={aoDesfocar} />
                </Campo>
              </div>
            </div>

            {/* Seção 2 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#ffa300" }}>
              Fornecedor e Valor
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Campo label="Fornecedor" obrigatorio>
                <InputFornecedor
                  value={form.oc_nome_fornecedor}
                  fornecedores={fornecedores}
                  onChange={(val) => setField("oc_nome_fornecedor", val)}
                />
              </Campo>
              <Campo label="Valor (R$)" obrigatorio>
                <input type="number" name="oc_valor" value={form.oc_valor}
                  onChange={handleChange} placeholder="0.00" step="0.01" min="0"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Forma de Pagamento" obrigatorio>
                <select name="oc_forma_pagamento" value={form.oc_forma_pagamento}
                  onChange={handleChange} style={{ ...estiloInput, cursor: "pointer" }}
                  onFocus={aoFocar} onBlur={aoDesfocar}>
                  {opcoesPagamento.map((op) => (
                    <option key={op} value={op} style={{ background: "#141414" }}>{op}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Data de Abertura" obrigatorio>
                <input type="date" name="oc_data_referencia" value={form.oc_data_referencia}
                  onChange={handleChange} style={{ ...estiloInput, colorScheme: "dark" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
            </div>

            {/* Seção 3 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#c2ff05" }}>
              Status e Aprovação
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Campo label="Centro de Custo">
                <input type="text" name="oc_centro_de_custo" value={form.oc_centro_de_custo}
                  onChange={handleChange} placeholder="Ex: TI, Marketing..."
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Status">
                <select name="oc_status" value={form.oc_status}
                  onChange={handleChange} style={{ ...estiloInput, cursor: "pointer" }}
                  onFocus={aoFocar} onBlur={aoDesfocar}>
                  {opcoesStatus.map((op) => (
                    <option key={op} value={op} style={{ background: "#141414" }}>{op}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Aprovação">
                <select name="oc_aprovacao" value={form.oc_aprovacao}
                  onChange={handleChange} style={{ ...estiloInput, cursor: "pointer" }}
                  onFocus={aoFocar} onBlur={aoDesfocar}>
                  {opcoesAprovacao.map((op) => (
                    <option key={op} value={op} style={{ background: "#141414" }}>{op}</option>
                  ))}
                </select>
              </Campo>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-5" style={estiloFooter}>
              <button type="button" onClick={onFechar}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={estiloBtnCancelar}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={estiloBtnSalvar(saving)}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
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