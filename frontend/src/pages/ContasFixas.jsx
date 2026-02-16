// =============================================
// ARQUIVO: src/pages/ContasFixas.jsx
// FUNÇÃO: Gerencia contas fixas recorrentes
// Lógica de dados em useContaFixa.js
// =============================================

import { useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, RefreshCw,
  Receipt, Calendar, CreditCard, Tag, AlertCircle,
  CheckCircle, XCircle, PauseCircle,
} from "lucide-react";
import { useContaFixa } from "../hooks/useContaFixa";
import ModalContaFixa from "../components/ModalContaFixa";

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────
const STATUS_CONFIG = {
  "Ativa":     { cor: "#1eff05", bg: "rgba(30,255,5,0.10)",    icon: CheckCircle },
  "Inativa":   { cor: "#888888", bg: "rgba(136,136,136,0.10)", icon: PauseCircle },
  "Cancelada": { cor: "#ff0571", bg: "rgba(255,5,113,0.10)",   icon: XCircle     },
};

const formatarValor = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─────────────────────────────────────────────
// CARD DE CONTA FIXA
// ─────────────────────────────────────────────
function CardContaFixa({ conta, onEditar, onDeletar, deletando }) {
  const statusCfg  = STATUS_CONFIG[conta.status] ?? STATUS_CONFIG["Inativa"];
  const StatusIcon = statusCfg.icon;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
    >
      {/* Topo */}
      <div className="flex items-start justify-between gap-2">
        <div className="overflow-hidden">
          <p className="font-semibold text-white truncate">{conta.nome}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.40)" }}>
            {conta.fornecedor}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: statusCfg.bg, color: statusCfg.cor }}
          >
            <StatusIcon size={11} />
            {conta.status}
          </span>

          <button onClick={() => onEditar(conta.id)}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,163,0,0.12)"; e.currentTarget.style.borderColor = "rgba(255,163,0,0.30)"; e.currentTarget.style.color = "#ffa300"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
          >
            <Pencil size={13} />
          </button>

          <button onClick={() => onDeletar(conta.id)} disabled={deletando === conta.id}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", cursor: deletando === conta.id ? "wait" : "pointer" }}
            onMouseEnter={(e) => { if (deletando !== conta.id) { e.currentTarget.style.background = "rgba(255,5,113,0.12)"; e.currentTarget.style.borderColor = "rgba(255,5,113,0.30)"; e.currentTarget.style.color = "#ff0571"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
          >
            {deletando === conta.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      {/* Valor */}
      <div>
        <p className="text-2xl font-bold" style={{ color: "#c2ff05" }}>
          {formatarValor(conta.valor)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>por mês</p>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Calendar,   color: "#ff0571", label: "Vencimento",  valor: `Dia ${conta.dia_vencimento}` },
          { icon: Receipt,    color: "#00bfff", label: "Fechamento",  valor: conta.dia_fechamento ? `Dia ${conta.dia_fechamento}` : "—" },
          { icon: CreditCard, color: "#ffa300", label: "Pagamento",   valor: conta.forma_pagamento },
          { icon: Tag,        color: "#b1ff00", label: "Categoria",   valor: conta.categoria },
        ].map(({ icon: Icon, color, label, valor }) => (
          <div key={label}
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Icon size={13} style={{ color, flexShrink: 0 }} />
            <div className="overflow-hidden">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
              <p className="text-sm font-medium text-white truncate">{valor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Observações */}
      {conta.observacoes && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
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
  const {
    contas, loading, deletando,
    filtroStatus, setFiltroStatus,
    carregarContas, handleDeletar,
    contasFiltradas, totalAtivas,
  } = useContaFixa();

  const [modalAberto,    setModalAberto]    = useState(false);
  const [contaEditando,  setContaEditando]  = useState(null);

  const abrirModal  = ()   => { setContaEditando(null); setModalAberto(true); };
  const abrirEdicao = (id) => { setContaEditando(id);   setModalAberto(true); };
  const fecharModal = ()   => { setModalAberto(false); setContaEditando(null); };
  const aoSalvar    = ()   => { fecharModal(); carregarContas(); };

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
          <button onClick={carregarContas}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
          >
            <RefreshCw size={15} />
          </button>

          <button onClick={abrirModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{ background: "#ff0571", color: "#ffffff", border: "1px solid rgba(255,5,113,0.50)", boxShadow: "0 0 20px rgba(255,5,113,0.25)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e0044f"; e.currentTarget.style.boxShadow = "0 0 28px rgba(255,5,113,0.40)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ff0571"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,5,113,0.25)"; }}
          >
            <Plus size={16} />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Card total */}
      <div className="rounded-xl p-5 mb-6 flex items-center justify-between"
        style={{ background: "rgba(194,255,5,0.05)", border: "1px solid rgba(194,255,5,0.15)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(194,255,5,0.60)" }}>
            Total Mensal — Contas Ativas
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#c2ff05" }}>
            {formatarValor(totalAtivas)}
          </p>
        </div>
        <Receipt size={40} style={{ color: "rgba(194,255,5,0.15)" }} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6">
        {["Todos", "Ativa", "Inativa", "Cancelada"].map((s) => {
          const ativo = filtroStatus === s;
          const cfg   = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={{
                background: ativo ? (cfg ? cfg.bg  : "rgba(255,5,113,0.12)") : "rgba(255,255,255,0.04)",
                color:      ativo ? (cfg ? cfg.cor : "#ff0571")               : "rgba(255,255,255,0.40)",
                border:     ativo ? `1px solid ${cfg ? cfg.cor : "#ff0571"}44` : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2">
          <Loader2 size={20} style={{ color: "#ff0571" }} className="animate-spin" />
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Carregando...</span>
        </div>
      ) : contasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl text-center gap-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <Receipt size={36} style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.30)" }}>
            {filtroStatus === "Todos"
              ? "Nenhuma conta cadastrada ainda."
              : `Nenhuma conta com status "${filtroStatus}".`}
          </p>
          {filtroStatus === "Todos" && (
            <button onClick={abrirModal}
              className="text-xs px-4 py-2 rounded-lg transition"
              style={{ background: "rgba(255,5,113,0.12)", color: "#ff0571", border: "1px solid rgba(255,5,113,0.25)" }}>
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