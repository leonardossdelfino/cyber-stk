// =============================================================================
// ARQUIVO: src/components/ModalCertificadoDigital.jsx
// FUNÇÃO: Modal de criação e edição de certificados digitais
// =============================================================================

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import {
  buscarCertificado, criarCertificado, atualizarCertificado,
  listarFornecedores,
} from "../services/api";
import Campo from "./CampoFormulario";
import { estiloInput, aoFocar, aoDesfocar } from "../styles/inputStyles";
import {
  estiloOverlay, estiloModal, estiloHeader, estiloFooter,
  estiloBtnFechar, estiloBtnFecharHover,
  estiloBtnCancelar, estiloBtnSalvar, estiloErro,
} from "../styles/modalStyles";

const TIPOS_OPCOES  = ["e-CPF A1", "e-CPF A3", "e-CNPJ A1", "e-CNPJ A3", "SSL/TLS", "Outro"];
const STATUS_OPCOES = ["Ativo", "Vencido", "Revogado", "Renovado"];

const FORM_INICIAL = {
  nome: "", tipo: "e-CNPJ A1", responsavel: "", area: "",
  descricao: "", data_emissao: "", data_vencimento: "",
  valor_pago: "", status: "Ativo",
};

function ModalCertificadoDigital({ certId, onSucesso, onFechar }) {
  const editando = Boolean(certId);

  const [form,         setForm]         = useState(FORM_INICIAL);
  const [fornecedores, setFornecedores] = useState([]);
  const [salvando,     setSalvando]     = useState(false);
  const [carregando,   setCarregando]   = useState(false);
  const [erro,         setErro]         = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro("");

        // Carrega fornecedores e dados do cert em paralelo se editando
        const [forn, certRes] = await Promise.all([
          listarFornecedores(),
          editando ? buscarCertificado(certId) : Promise.resolve(null),
        ]);

        setFornecedores(Array.isArray(forn) ? forn : []);

        if (editando) {
          if (!certRes?.success) {
            setErro("Certificado não encontrado.");
            return;
          }
          const c = certRes.data;
          setForm({
            nome:            c.nome            ?? "",
            tipo:            c.tipo            ?? "e-CNPJ A1",
            responsavel:     c.responsavel     ?? "",
            area:            c.area            ?? "",
            descricao:       c.descricao       ?? "",
            data_emissao:    c.data_emissao    ?? "",
            data_vencimento: c.data_vencimento ?? "",
            valor_pago:      c.valor_pago      ?? "",
            status:          c.status          ?? "Ativo",
          });
        }
      } catch {
        setErro("Erro ao carregar dados.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [editando, certId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim())            return setErro("Nome / Razão Social é obrigatório.");
    if (!form.tipo)                   return setErro("Tipo é obrigatório.");
    if (!form.descricao.trim())       return setErro("Descrição é obrigatória.");
    if (!form.data_vencimento)        return setErro("Data de vencimento é obrigatória.");
    if (form.data_emissao && new Date(form.data_vencimento) < new Date(form.data_emissao))
      return setErro("Data de vencimento não pode ser anterior à data de emissão.");

    try {
      setSalvando(true);
      const res = editando
        ? await atualizarCertificado(certId, form)
        : await criarCertificado(form);

      if (res?.success) {
        onSucesso();
      } else {
        setErro(res?.message || "Erro ao salvar. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão com a API.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onFechar()} style={estiloOverlay}>
      <div style={estiloModal("580px")}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5" style={estiloHeader}>
          <div>
            <h2 className="text-base font-semibold text-white">
              {editando ? "Editar Certificado Digital" : "Novo Certificado Digital"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Preencha os dados do certificado
            </p>
          </div>
          <button onClick={onFechar}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={estiloBtnFechar}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, estiloBtnFecharHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, estiloBtnFechar)}>
            <X size={16} />
          </button>
        </div>

        {/* Corpo */}
        {carregando ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} style={{ color: "#ff0571" }} className="animate-spin" />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Carregando...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">

            {erro && <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={estiloErro}>{erro}</div>}

            {/* Seção 1 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#ff0571" }}>
              Identificação
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <Campo label="Nome / Razão Social" obrigatorio>
                  <select name="nome" value={form.nome} onChange={handleChange}
                    style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.razao_social} style={{ background: "#141414" }}>
                        {f.razao_social}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>
              <Campo label="Tipo" obrigatorio>
                <select name="tipo" value={form.tipo} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  {TIPOS_OPCOES.map((t) => (
                    <option key={t} value={t} style={{ background: "#141414" }}>{t}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Status">
                <select name="status" value={form.status} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  {STATUS_OPCOES.map((s) => (
                    <option key={s} value={s} style={{ background: "#141414" }}>{s}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Responsável">
                <input name="responsavel" value={form.responsavel} onChange={handleChange}
                  placeholder="Ex: João Silva"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Área / Setor">
                <input name="area" value={form.area} onChange={handleChange}
                  placeholder="Ex: Financeiro"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
            </div>

            {/* Seção 2 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#ffa300" }}>
              Datas e Valor
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Campo label="Data de Emissão">
                <input name="data_emissao" type="date" value={form.data_emissao}
                  onChange={handleChange}
                  style={{ ...estiloInput, colorScheme: "dark" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Data de Vencimento" obrigatorio>
                <input name="data_vencimento" type="date" value={form.data_vencimento}
                  onChange={handleChange}
                  style={{ ...estiloInput, colorScheme: "dark" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <div className="col-span-2">
                <Campo label="Valor Pago (R$)">
                  <input name="valor_pago" type="number" min="0" step="0.01"
                    value={form.valor_pago} onChange={handleChange} placeholder="0,00"
                    style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
                </Campo>
              </div>
            </div>

            {/* Seção 3 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#c2ff05" }}>
              Descrição
            </p>
            <div className="mb-6">
              <Campo label="Descrição do Uso" obrigatorio>
                <textarea name="descricao" value={form.descricao} onChange={handleChange}
                  placeholder="Ex: Utilizado para assinatura de NF-e e contratos..." rows={3}
                  style={{ ...estiloInput, resize: "vertical" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-5" style={estiloFooter}>
              <button type="button" onClick={onFechar}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={estiloBtnCancelar}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}>
                Cancelar
              </button>
              <button type="submit" disabled={salvando}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={estiloBtnSalvar(salvando)}>
                {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {salvando ? "Salvando..." : editando ? "Salvar Alterações" : "Criar Certificado"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default ModalCertificadoDigital;