// =============================================
// ARQUIVO: src/pages/ContasFixas.jsx
// FUNÇÃO: Gerencia contas fixas recorrentes
// Layout: cards visuais com modal de criação/edição
// =============================================

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, Loader2, RefreshCw,
  Receipt, Calendar, CreditCard, Tag, AlertCircle,
  CheckCircle, XCircle, PauseCircle,
} from "lucide-react";
import {
  listarContasFixas, criarContaFixa,
  atualizarContaFixa, deletarContaFixa,
  buscarContaFixa, listarConfiguracao,
} from "../services/api";

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

const STATUS_CONFIG = {
  "Ativa":     { cor: "#1eff05", bg: "rgba(30,255,5,0.10)",   icon: CheckCircle  },
  "Inativa":   { cor: "#888888", bg: "rgba(136,136,136,0.10)", icon: PauseCircle  },
  "Cancelada": { cor: "#ff0571", bg: "rgba(255,5,113,0.10)",  icon: XCircle      },
};

const FORMAS_PAGAMENTO = ["Boleto", "Cartão de Crédito", "PIX", "Transferência", "Débito Automático"];
const STATUS_OPCOES    = ["Ativa", "Inativa", "Cancelada"];

const formatarValor = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─────────────────────────────────────────────
// MODAL DE CRIAÇÃO / EDIÇÃO
// ─────────────────────────────────────────────
function ModalContaFixa({ contaId, onFechar, onSalvo }) {
  const [form, setForm] = useState({
    nome:            "",
    fornecedor:      "",
    valor:           "",
    dia_vencimento:  "",
    dia_fechamento:  "",
    forma_pagamento: "Boleto",
    categoria:       "",
    status:          "Ativa",
    observacoes:     "",
  });
  const [categorias, setCategorias] = useState([]);
  const [salvando, setSalvando]     = useState(false);
  const [erro, setErro]             = useState("");

  // Carrega categorias e dados da conta se for edição
  useEffect(() => {
    const carregar = async () => {
      try {
        const cats = await listarConfiguracao("categorias");
        setCategorias(cats);

        if (contaId) {
          const conta = await buscarContaFixa(contaId);
          setForm({
            nome:            conta.nome,
            fornecedor:      conta.fornecedor,
            valor:           conta.valor,
            dia_vencimento:  conta.dia_vencimento,
            dia_fechamento:  conta.dia_fechamento ?? "",
            forma_pagamento: conta.forma_pagamento,
            categoria:       conta.categoria,
            status:          conta.status,
            observacoes:     conta.observacoes ?? "",
          });
        } else if (cats.length > 0) {
          setForm((prev) => ({ ...prev, categoria: cats[0].nome }));
        }
      } catch {
        setErro("Erro ao carregar dados.");
      }
    };
    carregar();
  }, [contaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setErro("");

    // Validações
    if (!form.nome.trim())           return setErro("Nome é obrigatório.");
    if (!form.fornecedor.trim())     return setErro("Fornecedor é obrigatório.");
    if (!form.valor || isNaN(Number(form.valor))) return setErro("Valor inválido.");
    if (!form.dia_vencimento)        return setErro("Dia de vencimento é obrigatório.");
    if (!form.categoria)             return setErro("Categoria é obrigatória.");

    try {
      setSalvando(true);
      if (contaId) {
        await atualizarContaFixa(contaId, form);
      } else {
        await criarContaFixa(form);
      }
      onSalvo();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  // Estilo base dos inputs
  const inputStyle = {
    width:        "100%",
    background:   "rgba(255,255,255,0.04)",
    border:       "1px solid rgba(255,255,255,0.10)",
    borderRadius: "8px",
    padding:      "9px 12px",
    color:        "#ffffff",
    fontSize:     "13px",
    outline:      "none",
  };

  const labelStyle = {
    display:      "block",
    fontSize:     "11px",
    fontWeight:   600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color:        "rgba(255,255,255,0.35)",
    marginBottom: "6px",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 sticky top-0 bg-[#1a1a1a] z-10">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {contaId ? "Editar Conta Fixa" : "Nova Conta Fixa"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Preencha os dados da conta recorrente
            </p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Corpo */}
        <div className="px-6 py-5 space-y-4">

          {erro && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
              {erro}
            </div>
          )}

          {/* Nome + Fornecedor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange}
                placeholder="Ex: Internet Vivo" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fornecedor *</label>
              <input name="fornecedor" value={form.fornecedor} onChange={handleChange}
                placeholder="Ex: Vivo" style={inputStyle} />
            </div>
          </div>

          {/* Valor + Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Valor Mensal (R$) *</label>
              <input name="valor" type="number" step="0.01" min="0"
                value={form.valor} onChange={handleChange}
                placeholder="0,00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Categoria *</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dia Vencimento + Dia Fechamento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Dia de Vencimento *</label>
              <input name="dia_vencimento" type="number" min="1" max="31"
                value={form.dia_vencimento} onChange={handleChange}
                placeholder="Ex: 10" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Dia de Fechamento</label>
              <input name="dia_fechamento" type="number" min="1" max="31"
                value={form.dia_fechamento} onChange={handleChange}
                placeholder="Ex: 5 (opcional)" style={inputStyle} />
            </div>
          </div>

          {/* Forma Pagamento + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Forma de Pagamento *</label>
              <select name="forma_pagamento" value={form.forma_pagamento}
                onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }}>
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {STATUS_OPCOES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label style={labelStyle}>Observações</label>
            <textarea name="observacoes" value={form.observacoes} onChange={handleChange}
              placeholder="Informações adicionais..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 sticky bottom-0 bg-[#1a1a1a]">
          <button
            onClick={onFechar}
            className="px-4 py-2 rounded-lg text-sm transition"
            style={{ color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.05)" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={salvando}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition"
            style={{
              background: salvando ? "rgba(255,5,113,0.5)" : "#ff0571",
              color:      "#ffffff",
              cursor:     salvando ? "wait" : "pointer",
            }}
          >
            {salvando && <Loader2 size={14} className="animate-spin" />}
            {contaId ? "Salvar Alterações" : "Criar Conta"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CARD DE CONTA FIXA
// ─────────────────────────────────────────────
function CardContaFixa({ conta, onEditar, onDeletar, deletando }) {
  const statusCfg = STATUS_CONFIG[conta.status] ?? STATUS_CONFIG["Inativa"];
  const StatusIcon = statusCfg.icon;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{
        background:  "rgba(255,255,255,0.02)",
        border:      "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
    >

      {/* Topo: nome + status + ações */}
      <div className="flex items-start justify-between gap-2">
        <div className="overflow-hidden">
          <p className="font-semibold text-white truncate">{conta.nome}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.40)" }}>
            {conta.fornecedor}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Badge de status */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: statusCfg.bg, color: statusCfg.cor }}
          >
            <StatusIcon size={11} />
            {conta.status}
          </span>

          {/* Editar */}
          <button
            onClick={() => onEditar(conta.id)}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.04)",
              border:     "1px solid rgba(255,255,255,0.08)",
              color:      "rgba(255,255,255,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = "rgba(255,163,0,0.12)";
              e.currentTarget.style.borderColor = "rgba(255,163,0,0.30)";
              e.currentTarget.style.color       = "#ffa300";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color       = "rgba(255,255,255,0.45)";
            }}
          >
            <Pencil size={13} />
          </button>

          {/* Deletar */}
          <button
            onClick={() => onDeletar(conta.id)}
            disabled={deletando === conta.id}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.04)",
              border:     "1px solid rgba(255,255,255,0.08)",
              color:      "rgba(255,255,255,0.45)",
              cursor:     deletando === conta.id ? "wait" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (deletando !== conta.id) {
                e.currentTarget.style.background  = "rgba(255,5,113,0.12)";
                e.currentTarget.style.borderColor = "rgba(255,5,113,0.30)";
                e.currentTarget.style.color       = "#ff0571";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color       = "rgba(255,255,255,0.45)";
            }}
          >
            {deletando === conta.id
              ? <Loader2 size={13} className="animate-spin" />
              : <Trash2 size={13} />
            }
          </button>
        </div>
      </div>

      {/* Valor destaque */}
      <div>
        <p className="text-2xl font-bold" style={{ color: "#c2ff05" }}>
          {formatarValor(conta.valor)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>
          por mês
        </p>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-2 gap-2">

        {/* Vencimento */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Calendar size={13} style={{ color: "#ff0571", flexShrink: 0 }} />
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Vencimento</p>
            <p className="text-sm font-medium text-white">Dia {conta.dia_vencimento}</p>
          </div>
        </div>

        {/* Fechamento */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Receipt size={13} style={{ color: "#00bfff", flexShrink: 0 }} />
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Fechamento</p>
            <p className="text-sm font-medium text-white">
              {conta.dia_fechamento ? `Dia ${conta.dia_fechamento}` : "—"}
            </p>
          </div>
        </div>

        {/* Forma de pagamento */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <CreditCard size={13} style={{ color: "#ffa300", flexShrink: 0 }} />
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Pagamento</p>
            <p className="text-sm font-medium text-white truncate">{conta.forma_pagamento}</p>
          </div>
        </div>

        {/* Categoria */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Tag size={13} style={{ color: "#b1ff00", flexShrink: 0 }} />
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Categoria</p>
            <p className="text-sm font-medium text-white truncate">{conta.categoria}</p>
          </div>
        </div>

      </div>

      {/* Observações */}
      {conta.observacoes && (
        <div
          className="flex items-start gap-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <AlertCircle size={13} style={{ color: "rgba(255,255,255,0.30)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.5" }}>
            {conta.observacoes}
          </p>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────
function ContasFixas() {
  const [contas, setContas]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [deletando, setDeletando]     = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [contaEditando, setContaEditando] = useState(null);
  const [filtroStatus, setFiltroStatus]   = useState("Todos");

  const carregarContas = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await listarContasFixas();
      setContas(Array.isArray(dados) ? dados : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarContas(); }, [carregarContas]);

  const handleDeletar = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover esta conta?")) return;
    setDeletando(id);
    try {
      await deletarContaFixa(id);
      await carregarContas();
    } finally {
      setDeletando(null);
    }
  };

  const abrirModal  = ()    => { setContaEditando(null); setModalAberto(true); };
  const abrirEdicao = (id)  => { setContaEditando(id);   setModalAberto(true); };
  const fecharModal = ()    => { setModalAberto(false); setContaEditando(null); };
  const aoSalvar    = ()    => { fecharModal(); carregarContas(); };

  // Filtragem por status
  const contasFiltradas = filtroStatus === "Todos"
    ? contas
    : contas.filter((c) => c.status === filtroStatus);

  // Totalizador das contas ativas
  const totalAtivas = contas
    .filter((c) => c.status === "Ativa")
    .reduce((acc, c) => acc + Number(c.valor), 0);

  return (
    <div className="p-6" style={{ background: "#111111", minHeight: "100vh" }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Contas Fixas</h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {contas.length} conta{contas.length !== 1 ? "s" : ""} cadastrada{contas.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarContas}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.04)",
              border:     "1px solid rgba(255,255,255,0.08)",
              color:      "rgba(255,255,255,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color      = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color      = "rgba(255,255,255,0.45)";
            }}
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={abrirModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{
              background: "#ff0571",
              color:      "#ffffff",
              border:     "1px solid rgba(255,5,113,0.50)",
              boxShadow:  "0 0 20px rgba(255,5,113,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e0044f";
              e.currentTarget.style.boxShadow  = "0 0 28px rgba(255,5,113,0.40)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ff0571";
              e.currentTarget.style.boxShadow  = "0 0 20px rgba(255,5,113,0.25)";
            }}
          >
            <Plus size={16} />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Card de total */}
      <div
        className="rounded-xl p-5 mb-6 flex items-center justify-between"
        style={{
          background: "rgba(194,255,5,0.05)",
          border:     "1px solid rgba(194,255,5,0.15)",
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(194,255,5,0.60)" }}>
            Total Mensal — Contas Ativas
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#c2ff05" }}>
            {formatarValor(totalAtivas)}
          </p>
        </div>
        <Receipt size={40} style={{ color: "rgba(194,255,5,0.15)" }} />
      </div>

      {/* Filtros de status */}
      <div className="flex items-center gap-2 mb-6">
        {["Todos", "Ativa", "Inativa", "Cancelada"].map((s) => {
          const ativo = filtroStatus === s;
          const cfg   = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={{
                background: ativo ? (cfg ? cfg.bg : "rgba(255,5,113,0.12)") : "rgba(255,255,255,0.04)",
                color:      ativo ? (cfg ? cfg.cor : "#ff0571") : "rgba(255,255,255,0.40)",
                border:     ativo
                  ? `1px solid ${cfg ? cfg.cor : "#ff0571"}44`
                  : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Grid de cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2">
          <Loader2 size={20} style={{ color: "#ff0571" }} className="animate-spin" />
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Carregando...</span>
        </div>
      ) : contasFiltradas.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl text-center gap-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            border:     "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Receipt size={36} style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.30)" }}>
            {filtroStatus === "Todos"
              ? "Nenhuma conta cadastrada ainda."
              : `Nenhuma conta com status "${filtroStatus}".`}
          </p>
          {filtroStatus === "Todos" && (
            <button
              onClick={abrirModal}
              className="text-xs px-4 py-2 rounded-lg transition"
              style={{ background: "rgba(255,5,113,0.12)", color: "#ff0571", border: "1px solid rgba(255,5,113,0.25)" }}
            >
              Criar primeira conta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contasFiltradas.map((conta) => (
            <CardContaFixa
              key={conta.id}
              conta={conta}
              onEditar={abrirEdicao}
              onDeletar={handleDeletar}
              deletando={deletando}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <ModalContaFixa
          contaId={contaEditando}
          onFechar={fecharModal}
          onSalvo={aoSalvar}
        />
      )}

    </div>
  );
}

export default ContasFixas;