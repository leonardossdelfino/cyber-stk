// =============================================
// ARQUIVO: src/components/ModalFornecedor.jsx
// =============================================

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { criarFornecedor, atualizarFornecedor } from "../services/api";
import Campo from "./CampoFormulario";
import { estiloInput, aoFocar, aoDesfocar } from "../styles/inputStyles";
import {
  estiloOverlay, estiloModal, estiloHeader, estiloFooter,
  estiloBtnFechar, estiloBtnFecharHover,
  estiloBtnCancelar, estiloBtnSalvar, estiloErro,
} from "../styles/modalStyles";

const FORM_INICIAL = { razao_social: "", cnpj: "", contato: "", email: "", descricao: "" };

function ModalFornecedor({ aberto, onFechar, onSalvo, fornecedorEdicao }) {
  const [form,     setForm]     = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState("");

  const modoEdicao = !!fornecedorEdicao;

  useEffect(() => {
    setForm(fornecedorEdicao ? {
      razao_social: fornecedorEdicao.razao_social ?? "",
      cnpj:         fornecedorEdicao.cnpj         ?? "",
      contato:      fornecedorEdicao.contato       ?? "",
      email:        fornecedorEdicao.email         ?? "",
      descricao:    fornecedorEdicao.descricao     ?? "",
    } : FORM_INICIAL);
    setErro("");
  }, [fornecedorEdicao, aberto]);

  if (!aberto) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro("");
  };

  const handleSalvar = async () => {
    if (!form.razao_social.trim()) return setErro("Razão social é obrigatória.");
    setSalvando(true);
    try {
      modoEdicao
        ? await atualizarFornecedor(fornecedorEdicao.id, form)
        : await criarFornecedor(form);
      onSalvo();
      onFechar();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onFechar()} style={estiloOverlay}>
      <div style={estiloModal("520px")}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5" style={estiloHeader}>
          <h2 className="text-base font-semibold text-white">
            {modoEdicao ? "Editar Fornecedor" : "Novo Fornecedor"}
          </h2>
          <button onClick={onFechar}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={estiloBtnFechar}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, estiloBtnFecharHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, estiloBtnFechar)}>
            <X size={16} />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-4">

          {erro && <div className="px-4 py-3 rounded-lg text-sm" style={estiloErro}>{erro}</div>}

          <Campo label="Razão Social" obrigatorio>
            <input name="razao_social" value={form.razao_social} onChange={handleChange}
              placeholder="Nome da empresa" style={estiloInput}
              onFocus={aoFocar} onBlur={aoDesfocar} />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="CNPJ">
              <input name="cnpj" value={form.cnpj} onChange={handleChange}
                placeholder="00.000.000/0000-00" style={estiloInput}
                onFocus={aoFocar} onBlur={aoDesfocar} />
            </Campo>
            <Campo label="Contato">
              <input name="contato" value={form.contato} onChange={handleChange}
                placeholder="Nome do contato" style={estiloInput}
                onFocus={aoFocar} onBlur={aoDesfocar} />
            </Campo>
          </div>

          <Campo label="E-mail">
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="email@empresa.com" style={estiloInput}
              onFocus={aoFocar} onBlur={aoDesfocar} />
          </Campo>

          <Campo label="Descrição / Observações">
            <textarea name="descricao" value={form.descricao} onChange={handleChange}
              placeholder="Informações adicionais..." rows={3}
              style={{ ...estiloInput, resize: "none" }}
              onFocus={aoFocar} onBlur={aoDesfocar} />
          </Campo>

        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3 px-6 py-4" style={estiloFooter}>
          <button onClick={onFechar}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={estiloBtnCancelar}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}>
            Cancelar
          </button>
          <button onClick={handleSalvar} disabled={salvando}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
            style={estiloBtnSalvar(salvando)}>
            {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalFornecedor;