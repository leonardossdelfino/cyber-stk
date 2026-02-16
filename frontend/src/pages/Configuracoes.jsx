// =============================================
// ARQUIVO: src/pages/Configuracoes.jsx
// FUNÇÃO: Página de configurações com abas
// =============================================

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus, Pencil, Trash2, Loader2,
  Save, X, Users, Tag, CreditCard,
  CheckSquare, ClipboardList, Cpu, AlertTriangle,
} from "lucide-react";
import {
  listarConfiguracao,
  criarConfiguracao,
  atualizarConfiguracao,
  deletarConfiguracao,
  listarFornecedores,
  deletarFornecedor,
} from "../services/api";
import ModalFornecedor from "../components/ModalFornecedor";

// ── Tabelas que usam 'descricao' como campo principal
const TABELAS_DESCRICAO = ["perifericos", "incidentes"];

// ── Tabelas que usam cor — tratamento visual idêntico
const TABELAS_COM_COR = ["status_oc", "status_aprovacao"];

// ── Definição das abas
const ABAS = [
  { id: "fornecedores",     label: "Fornecedores",        icon: Users,         tipo: "modal" },
  { id: "categorias",       label: "Categorias",          icon: Tag,           tipo: "lista" },
  { id: "formas_pagamento", label: "Formas de Pagamento", icon: CreditCard,    tipo: "lista" },
  { id: "status_aprovacao", label: "Status de Aprovação", icon: CheckSquare,   tipo: "cor"   }, // ← tipo cor
  { id: "status_oc",        label: "Status da OC",        icon: ClipboardList, tipo: "cor"   },
  { id: "perifericos",      label: "Periféricos",         icon: Cpu,           tipo: "periferico" },
  { id: "incidentes",       label: "Incidentes",          icon: AlertTriangle, tipo: "lista" },
];

const FORM_LISTA      = { nome: "" };
const FORM_DESCRICAO  = { descricao: "" };
const FORM_COR        = { nome: "", cor: "#ff0571" };
const FORM_PERIFERICO = { descricao: "", marca: "", valor_medio: "", obs: "" };

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border:     "1px solid rgba(255,255,255,0.1)",
};
const inputFocus = (e) => (e.target.style.borderColor = "rgba(255,5,113,0.5)");
const inputBlur  = (e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)");

const campoPrincipal = (abaId) =>
  TABELAS_DESCRICAO.includes(abaId) ? "descricao" : "nome";

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
function Configuracoes() {
  const [searchParams] = useSearchParams();
  const abaParam       = searchParams.get("aba") ?? "fornecedores";
  const abaAtiva       = ABAS.find((a) => a.id === abaParam)?.id ?? "fornecedores";
  const abaInfo        = ABAS.find((a) => a.id === abaAtiva);

  const [itens,       setItens]       = useState([]);
  const [carregando,  setCarregando]  = useState(false);
  const [editandoId,  setEditandoId]  = useState(null);
  const [formEdicao,  setFormEdicao]  = useState({});
  const [novoForm,    setNovoForm]    = useState({});
  const [adicionando, setAdicionando] = useState(false);
  const [salvando,    setSalvando]    = useState(false);
  const [erro,        setErro]        = useState("");

  const [modalFornAberto, setModalFornAberto] = useState(false);
  const [fornEdicao,      setFornEdicao]      = useState(null);

  function formInicial(tipo) {
    if (tipo === "cor")        return { ...FORM_COR };
    if (tipo === "periferico") return { ...FORM_PERIFERICO };
    if (TABELAS_DESCRICAO.includes(abaAtiva)) return { ...FORM_DESCRICAO };
    return { ...FORM_LISTA };
  }

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    setEditandoId(null);
    setAdicionando(false);
    try {
      if (abaAtiva === "fornecedores") {
        setItens(await listarFornecedores());
      } else {
        setItens(await listarConfiguracao(abaAtiva));
      }
    } catch {
      setErro("Erro ao carregar dados.");
    } finally {
      setCarregando(false);
    }
  }, [abaAtiva]);

  useEffect(() => {
    carregar();
    setNovoForm(formInicial(abaInfo?.tipo));
  }, [carregar]);

  const iniciarEdicao  = (item) => { setEditandoId(item.id); setFormEdicao({ ...item }); };
  const cancelarEdicao = ()     => { setEditandoId(null); setFormEdicao({}); };

  const salvarEdicao = async (id) => {
    setSalvando(true);
    try {
      await atualizarConfiguracao(abaAtiva, id, formEdicao);
      await carregar();
    } catch {
      setErro("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const salvarNovo = async () => {
    const campo = campoPrincipal(abaAtiva);
    if (!novoForm[campo]?.trim()) {
      setErro(`Campo ${campo} é obrigatório.`);
      return;
    }
    setSalvando(true);
    try {
      await criarConfiguracao(abaAtiva, novoForm);
      setAdicionando(false);
      setNovoForm(formInicial(abaInfo?.tipo));
      await carregar();
    } catch {
      setErro("Erro ao adicionar.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (id) => {
    if (!confirm("Deseja remover este item?")) return;
    try {
      if (abaAtiva === "fornecedores") {
        await deletarFornecedor(id);
      } else {
        await deletarConfiguracao(abaAtiva, id);
      }
      await carregar();
    } catch {
      setErro("Erro ao remover.");
    }
  };

  const abrirModalFornecedor = (fornecedor = null) => {
    setFornEdicao(fornecedor);
    setModalFornAberto(true);
  };

  // =============================================
  // RENDER — Visualização de um item
  // =============================================
  const renderVisualizacao = (item) => {
    if (abaAtiva === "fornecedores") {
      return (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-white truncate">{item.razao_social}</span>
          <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
            {[item.cnpj, item.contato, item.email].filter(Boolean).join(" · ")}
          </span>
        </div>
      );
    }

    // Status OC e Status Aprovação — mesmo visual com bolinha colorida
    if (TABELAS_COM_COR.includes(abaAtiva)) {
      return (
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: item.cor ?? "#555" }}
          />
          <span className="text-sm text-white">{item.nome}</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{item.cor}</span>
        </div>
      );
    }

    if (abaAtiva === "perifericos") {
      return (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-white">{item.descricao}</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {[item.marca, item.valor_medio ? `R$ ${parseFloat(item.valor_medio).toFixed(2)}` : null]
              .filter(Boolean).join(" · ")}
          </span>
        </div>
      );
    }

    return (
      <span className="text-sm text-white">
        {item.descricao ?? item.nome}
      </span>
    );
  };

  // =============================================
  // RENDER — Campos de edição inline
  // =============================================
  const renderCamposEdicao = () => {
    // Status OC e Status Aprovação — mesmo formulário com nome + color picker
    if (TABELAS_COM_COR.includes(abaAtiva)) {
      return (
        <div className="flex items-center gap-3 flex-1">
          <input
            value={formEdicao.nome ?? ""}
            onChange={e => setFormEdicao(p => ({ ...p, nome: e.target.value }))}
            className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
          />
          <input
            type="color"
            value={formEdicao.cor ?? "#ff0571"}
            onChange={e => setFormEdicao(p => ({ ...p, cor: e.target.value }))}
            className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        </div>
      );
    }

    if (abaAtiva === "perifericos") {
      return (
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <input
            placeholder="Descrição"
            value={formEdicao.descricao ?? ""}
            onChange={e => setFormEdicao(p => ({ ...p, descricao: e.target.value }))}
            className="flex-1 min-w-32 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
          />
          <input
            placeholder="Marca"
            value={formEdicao.marca ?? ""}
            onChange={e => setFormEdicao(p => ({ ...p, marca: e.target.value }))}
            className="w-28 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
          />
          <input
            placeholder="Valor médio"
            type="number"
            value={formEdicao.valor_medio ?? ""}
            onChange={e => setFormEdicao(p => ({ ...p, valor_medio: e.target.value }))}
            className="w-28 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
          />
        </div>
      );
    }

    const campo = campoPrincipal(abaAtiva);
    return (
      <input
        value={formEdicao[campo] ?? ""}
        onChange={e => setFormEdicao(p => ({ ...p, [campo]: e.target.value }))}
        className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
        style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
      />
    );
  };

  // =============================================
  // RENDER — Linha de item
  // =============================================
  const renderLinha = (item) => {
    const emEdicao = editandoId === item.id;
    return (
      <div
        key={item.id}
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
        style={{
          background: emEdicao ? "rgba(255,5,113,0.06)" : "rgba(255,255,255,0.02)",
          border:     emEdicao ? "1px solid rgba(255,5,113,0.2)" : "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {emEdicao ? (
          <>
            {renderCamposEdicao()}
            <div className="flex gap-2 ml-auto flex-shrink-0">
              <button
                onClick={() => salvarEdicao(item.id)}
                disabled={salvando}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: "#ff0571", color: "#fff" }}
              >
                {salvando ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Salvar
              </button>
              <button
                onClick={cancelarEdicao}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            {renderVisualizacao(item)}
            <div className="flex gap-2 ml-auto flex-shrink-0">
              <button
                onClick={() => abaAtiva === "fornecedores" ? abrirModalFornecedor(item) : iniciarEdicao(item)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#ffa300"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => deletar(item.id)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#ff0571"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // =============================================
  // RENDER — Linha de adicionar novo item
  // =============================================
  const renderLinhaAdicionar = () => {
    if (abaAtiva === "fornecedores") return null;

    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{
          background: "rgba(194,255,5,0.04)",
          border:     "1px solid rgba(194,255,5,0.15)",
        }}
      >
        {/* Status OC e Status Aprovação — nome + color picker */}
        {TABELAS_COM_COR.includes(abaAtiva) && (
          <div className="flex items-center gap-3 flex-1">
            <input
              placeholder="Nome do status"
              value={novoForm.nome ?? ""}
              onChange={e => setNovoForm(p => ({ ...p, nome: e.target.value }))}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            />
            <input
              type="color"
              value={novoForm.cor ?? "#ff0571"}
              onChange={e => setNovoForm(p => ({ ...p, cor: e.target.value }))}
              className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>
        )}

        {/* Periféricos */}
        {abaAtiva === "perifericos" && (
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <input
              placeholder="Descrição *"
              value={novoForm.descricao ?? ""}
              onChange={e => setNovoForm(p => ({ ...p, descricao: e.target.value }))}
              className="flex-1 min-w-32 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            />
            <input
              placeholder="Marca"
              value={novoForm.marca ?? ""}
              onChange={e => setNovoForm(p => ({ ...p, marca: e.target.value }))}
              className="w-28 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            />
            <input
              placeholder="Valor médio"
              type="number"
              value={novoForm.valor_medio ?? ""}
              onChange={e => setNovoForm(p => ({ ...p, valor_medio: e.target.value }))}
              className="w-28 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>
        )}

        {/* Genérico — nome ou descricao */}
        {!TABELAS_COM_COR.includes(abaAtiva) && abaAtiva !== "perifericos" && (() => {
          const campo = campoPrincipal(abaAtiva);
          return (
            <input
              placeholder={campo === "descricao" ? "Descrição *" : "Nome *"}
              value={novoForm[campo] ?? ""}
              onChange={e => setNovoForm(p => ({ ...p, [campo]: e.target.value }))}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            />
          );
        })()}

        <div className="flex gap-2 ml-auto flex-shrink-0">
          <button
            onClick={salvarNovo}
            disabled={salvando}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: "#c2ff05", color: "#111111" }}
          >
            {salvando ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Salvar
          </button>
          <button
            onClick={() => { setAdicionando(false); setErro(""); }}
            className="px-3 py-1.5 rounded-lg text-xs"
            style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  // =============================================
  // RENDER PRINCIPAL
  // =============================================
  return (
    <div className="p-6 min-h-screen" style={{ background: "#111111" }}>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          Gerencie as listas e opções do sistema
        </p>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.02)",
          border:     "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">{abaInfo?.label}</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {itens.length} {itens.length === 1 ? "registro" : "registros"}
            </p>
          </div>
          <button
            onClick={() => abaAtiva === "fornecedores" ? abrirModalFornecedor() : setAdicionando(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={{
              background: "rgba(194,255,5,0.1)",
              color:      "#c2ff05",
              border:     "1px solid rgba(194,255,5,0.2)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(194,255,5,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(194,255,5,0.1)"}
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>

        {erro && (
          <div
            className="mb-4 px-4 py-2.5 rounded-lg text-sm"
            style={{ color: "#ff0571", background: "rgba(255,5,113,0.08)", border: "1px solid rgba(255,5,113,0.2)" }}
          >
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin" style={{ color: "#ff0571" }} />
          </div>
        ) : (
          <div className="space-y-2">
            {adicionando && renderLinhaAdicionar()}
            {itens.length === 0 && !adicionando ? (
              <p className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
                Nenhum registro encontrado. Clique em Adicionar para começar.
              </p>
            ) : (
              itens.map(renderLinha)
            )}
          </div>
        )}
      </div>

      <ModalFornecedor
        aberto={modalFornAberto}
        onFechar={() => { setModalFornAberto(false); setFornEdicao(null); }}
        onSalvo={carregar}
        fornecedorEdicao={fornEdicao}
      />

    </div>
  );
}

export default Configuracoes;