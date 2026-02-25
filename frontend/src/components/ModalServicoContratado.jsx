// =============================================================================
// ARQUIVO: src/components/ModalServicoContratado.jsx
// FUNÇÃO: Modal de criação e edição de serviços contratados
// =============================================================================

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import {
  buscarServico, criarServico, atualizarServico,
  listarConfiguracao, listarFornecedores,
} from "../services/api";
import InputFornecedor from "./InputFornecedor";
import Campo from "./CampoFormulario";
import { estiloInput, aoFocar, aoDesfocar } from "../styles/inputStyles";
import {
  estiloOverlay, estiloModal, estiloHeader, estiloFooter,
  estiloBtnFechar, estiloBtnFecharHover,
  estiloBtnCancelar, estiloBtnSalvar, estiloErro,
} from "../styles/modalStyles";

const STATUS_OPCOES = ["Ativa", "Inativa", "Encerrada", "Em Renovação", "Cancelada"];

const FORM_INICIAL = {
  nome: "", fornecedor: "", categoria: "", forma_pagamento: "",
  descricao: "", valor_total: "", data_inicio: "", data_termino: "",
  status: "Ativa",
};

function ModalServicoContratado({ servico, onSucesso, onFechar }) {
  const editando = Boolean(servico);

  const [form,           setForm]           = useState(FORM_INICIAL);
  const [arquivo,        setArquivo]        = useState(null);
  const [categorias,     setCategorias]     = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [fornecedores,   setFornecedores]   = useState([]);
  const [salvando,       setSalvando]       = useState(false);
  const [carregando,     setCarregando]     = useState(false);
  const [erro,           setErro]           = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro("");

        const [cats, formas, forn] = await Promise.all([
          listarConfiguracao("categorias"),
          listarConfiguracao("formas_pagamento"),
          listarFornecedores(),
        ]);

        setCategorias(cats);
        setFormasPagamento(formas);
        setFornecedores(forn);

        if (editando) {
          // Modo edição — servicos_contratados.php retorna { success, data }
          const res = await buscarServico(servico.id);
          if (!res?.success) {
            setErro("Serviço não encontrado.");
            return;
          }
          const s = res.data;
          setForm({
            nome:            s.nome            ?? "",
            fornecedor:      s.fornecedor      ?? "",
            categoria:       s.categoria       ?? "",
            forma_pagamento: s.forma_pagamento ?? "",
            descricao:       s.descricao       ?? "",
            valor_total:     s.valor_total     ?? "",
            data_inicio:     s.data_inicio     ?? "",
            data_termino:    s.data_termino    ?? "",
            status:          s.status          ?? "Ativa",
          });
        } else {
          // Modo criação — preenche defaults com primeiro item de cada lista
          setForm((prev) => ({
            ...prev,
            categoria:       cats.length  > 0 ? cats[0].nome   : "",
            forma_pagamento: formas.length > 0 ? formas[0].nome : "",
          }));
        }
      } catch {
        setErro("Erro ao carregar dados.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [editando, servico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim())        return setErro("Nome é obrigatório.");
    if (!form.fornecedor.trim())  return setErro("Fornecedor é obrigatório.");
    if (!form.data_inicio)        return setErro("Data de início é obrigatória.");
    if (!form.data_termino)       return setErro("Data de término é obrigatória.");
    if (new Date(form.data_termino) < new Date(form.data_inicio))
      return setErro("A data de término não pode ser anterior à data de início.");

    try {
      setSalvando(true);
      const res = editando
        ? await atualizarServico(servico.id, form, arquivo)
        : await criarServico(form, arquivo);

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
      <div style={estiloModal("600px")}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5" style={estiloHeader}>
          <div>
            <h2 className="text-base font-semibold text-white">
              {editando ? "Editar Serviço Contratado" : "Novo Serviço Contratado"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Preencha os dados do serviço contratado
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
              <Campo label="Nome do Serviço" obrigatorio>
                <input name="nome" value={form.nome} onChange={handleChange}
                  placeholder="Ex: Suporte técnico mensal"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Fornecedor" obrigatorio>
                <InputFornecedor
                  value={form.fornecedor}
                  fornecedores={fornecedores}
                  onChange={(val) => { setForm((prev) => ({ ...prev, fornecedor: val })); setErro(""); }}
                />
              </Campo>
              <Campo label="Categoria">
                <select name="categoria" value={form.categoria} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  <option value="">Selecione</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.nome} style={{ background: "#141414" }}>{c.nome}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Valor Total (R$)">
                <input name="valor_total" type="number" min="0" step="0.01"
                  value={form.valor_total} onChange={handleChange} placeholder="0,00"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
            </div>

            {/* Seção 2 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#ffa300" }}>
              Datas e Pagamento
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Campo label="Data de Início" obrigatorio>
                <input name="data_inicio" type="date" value={form.data_inicio}
                  onChange={handleChange}
                  style={{ ...estiloInput, colorScheme: "dark" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Data de Término" obrigatorio>
                <input name="data_termino" type="date" value={form.data_termino}
                  onChange={handleChange}
                  style={{ ...estiloInput, colorScheme: "dark" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Forma de Pagamento">
                <select name="forma_pagamento" value={form.forma_pagamento} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  <option value="">Selecione</option>
                  {formasPagamento.map((f) => (
                    <option key={f.id} value={f.nome} style={{ background: "#141414" }}>{f.nome}</option>
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
            </div>

            {/* Seção 3 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#c2ff05" }}>
              Detalhes
            </p>
            <div className="mb-6 flex flex-col gap-4">
              <Campo label="Descrição">
                <textarea name="descricao" value={form.descricao} onChange={handleChange}
                  placeholder="Detalhes sobre o serviço contratado..." rows={3}
                  style={{ ...estiloInput, resize: "vertical" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label={editando && servico?.arquivo_contrato ? "Substituir contrato (opcional)" : "Anexar contrato (opcional)"}>
                {editando && servico?.arquivo_contrato && (
                  <p className="text-xs mb-2" style={{ color: "#00bfff" }}>
                    📎 Arquivo atual: {servico.arquivo_contrato}
                  </p>
                )}
                <input type="file" accept=".pdf,.doc,.docx"
                  onChange={(e) => setArquivo(e.target.files[0] ?? null)}
                  style={{ ...estiloInput, cursor: "pointer" }} />
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.30)" }}>
                  PDF, DOC ou DOCX · Máximo 10MB
                </p>
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
                {salvando ? "Salvando..." : editando ? "Salvar Alterações" : "Criar Serviço"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default ModalServicoContratado;