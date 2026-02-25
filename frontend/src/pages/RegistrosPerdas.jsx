// =============================================================================
// ARQUIVO: src/pages/RegistrosPerdas.jsx
// FUNÇÃO: Listagem de registros de perdas e mau uso em tabela
// Lógica de dados em usePerda.js
// =============================================================================

import { useState, useMemo } from "react";
import {
  Plus, Pencil, Trash2, Loader2, RefreshCw, Search, AlertTriangle,
} from "lucide-react";
import { usePerda } from "../hooks/usePerda";
import ModalRegistroPerda from "../components/ModalRegistroPerda";

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------
const TIPO_CONFIG = {
  "Perda":   { cor: "#ffa300", bg: "rgba(255,163,0,0.12)"   },
  "Roubo":   { cor: "#ff4444", bg: "rgba(255,68,68,0.12)"   },
  "Mau uso": { cor: "#ff0571", bg: "rgba(255,5,113,0.12)"   },
  "Quebra":  { cor: "#888888", bg: "rgba(136,136,136,0.12)" },
  "Outros":  { cor: "#00bfff", bg: "rgba(0,191,255,0.12)"   },
};

const ACAO_CONFIG = {
  "Troca":            { cor: "#1eff05", bg: "rgba(30,255,5,0.10)"    },
  "Reparo":           { cor: "#00bfff", bg: "rgba(0,191,255,0.10)"   },
  "Sem substituição": { cor: "#888888", bg: "rgba(136,136,136,0.10)" },
};

// Tipos fixos para cards de resumo — tipos dinâmicos são usados nos filtros
const TIPOS_RESUMO = ["Perda", "Roubo", "Mau uso", "Quebra", "Outros"];

const formatarData = (data) => {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
};

const formatarCusto = (custo) =>
  custo ? `R$ ${parseFloat(custo).toFixed(2)}` : null;

function BadgeTipo({ tipo }) {
  const cfg = TIPO_CONFIG[tipo] ?? { cor: "#888888", bg: "rgba(136,136,136,0.12)" };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.cor }}>
      {tipo}
    </span>
  );
}

function BadgeAcao({ acao }) {
  const cfg = ACAO_CONFIG[acao] ?? { cor: "#888888", bg: "rgba(136,136,136,0.10)" };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.cor }}>
      {acao}
    </span>
  );
}

// -----------------------------------------------------------------------------
// Página principal
// -----------------------------------------------------------------------------
function RegistrosPerdas() {
  const {
    perdas, loading, deletando, erro,
    filtroTipo, setFiltroTipo,
    carregarPerdas, handleDeletar,
    perdasFiltradas, custoTotal, tiposUnicos,
  } = usePerda();

  const [modalAberto,      setModalAberto]      = useState(false);
  const [perdaEditando,    setPerdaEditando]     = useState(null);
  const [busca,            setBusca]             = useState("");

  const abrirModal  = ()     => { setPerdaEditando(null); setModalAberto(true); };
  const abrirEdicao = (reg)  => { setPerdaEditando(reg.id); setModalAberto(true); };
  const fecharModal = ()     => { setModalAberto(false); setPerdaEditando(null); };
  const aoSalvar    = ()     => { fecharModal(); carregarPerdas(); };

  // Filtros de tipo para exibição: tipos fixos + dinâmicos do banco não mapeados
  const tiposFiltro = useMemo(() => {
    const extras = tiposUnicos.filter((t) => !TIPOS_RESUMO.includes(t));
    return ["Todos", ...TIPOS_RESUMO, ...extras];
  }, [tiposUnicos]);

  // Aplica busca em cima do que o hook já filtrou por tipo
  const registrosVisiveis = useMemo(() => {
    if (!busca.trim()) return perdasFiltradas;
    const q = busca.toLowerCase();
    return perdasFiltradas.filter((r) =>
      r.tipo?.toLowerCase().includes(q)        ||
      r.nome_pessoa?.toLowerCase().includes(q) ||
      r.area?.toLowerCase().includes(q)        ||
      r.chamado_os?.toLowerCase().includes(q)  ||
      r.periferico?.toLowerCase().includes(q)
    );
  }, [perdasFiltradas, busca]);

  return (
    <div className="p-6" style={{ background: "#111111", minHeight: "100vh" }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Registro de Perdas e Mau Uso</h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {perdas.length} registro{perdas.length !== 1 ? "s" : ""} cadastrado{perdas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Campo de busca */}
          <div className="relative">
            <Search size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(255,255,255,0.30)" }}
            />
            <input
              type="text"
              placeholder="Buscar registro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border:     "1px solid rgba(255,255,255,0.08)",
                color:      "#ffffff",
                width:      "220px",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,5,113,0.40)"; e.target.style.boxShadow = "0 0 0 3px rgba(255,5,113,0.08)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <button onClick={carregarPerdas}
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
            Novo Registro
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {TIPOS_RESUMO.map((tipo) => {
          const cfg = TIPO_CONFIG[tipo];
          return (
            <div key={tipo} className="rounded-xl px-4 py-3 flex flex-col"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{tipo}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: cfg.cor }}>
                {perdas.filter((r) => r.tipo === tipo).length}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filtros por tipo */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tiposFiltro.map((tipo) => {
          const ativo = filtroTipo === tipo;
          const cfg   = TIPO_CONFIG[tipo];
          return (
            <button key={tipo} onClick={() => setFiltroTipo(tipo)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={{
                background: ativo ? (cfg ? cfg.bg  : "rgba(255,5,113,0.12)") : "rgba(255,255,255,0.04)",
                color:      ativo ? (cfg ? cfg.cor : "#ff0571")               : "rgba(255,255,255,0.40)",
                border:     ativo ? `1px solid ${cfg ? cfg.cor : "#ff0571"}44` : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {tipo}
              {tipo !== "Todos" && (
                <span className="ml-1 opacity-60">
                  ({perdas.filter((r) => r.tipo === tipo).length})
                </span>
              )}
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
      ) : erro ? (
        <div className="text-center py-12 text-sm" style={{ color: "#ff4444" }}>{erro}</div>
      ) : registrosVisiveis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl text-center gap-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <AlertTriangle size={36} style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.30)" }}>
            {busca
              ? "Nenhum registro encontrado com os filtros aplicados."
              : filtroTipo === "Todos"
                ? "Nenhum registro cadastrado ainda."
                : `Nenhum registro do tipo "${filtroTipo}".`}
          </p>
          {filtroTipo === "Todos" && !busca && (
            <button onClick={abrirModal}
              className="text-xs px-4 py-2 rounded-lg transition"
              style={{ background: "rgba(255,5,113,0.12)", color: "#ff0571", border: "1px solid rgba(255,5,113,0.25)" }}>
              Criar primeiro registro
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Data", "Tipo", "Pessoa", "Área", "Chamado/OS", "Periférico", "Custo", "Ação", ""].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.35)" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrosVisiveis.map((reg, idx) => (
                <tr key={reg.id}
                  style={{
                    background:   idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"}
                >
                  <td className="px-4 py-3 text-white whitespace-nowrap">{formatarData(reg.data_incidente)}</td>
                  <td className="px-4 py-3"><BadgeTipo tipo={reg.tipo} /></td>
                  <td className="px-4 py-3 text-white">{reg.nome_pessoa}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.55)" }}>{reg.area}</td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {reg.chamado_os || <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {reg.periferico || <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {formatarCusto(reg.custo) || <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>}
                  </td>
                  <td className="px-4 py-3"><BadgeAcao acao={reg.acao_tomada} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => abrirEdicao(reg)}
                        className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,163,0,0.12)"; e.currentTarget.style.borderColor = "rgba(255,163,0,0.30)"; e.currentTarget.style.color = "#ffa300"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDeletar(reg.id)} disabled={deletando === reg.id}
                        className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", cursor: deletando === reg.id ? "wait" : "pointer" }}
                        onMouseEnter={(e) => { if (deletando !== reg.id) { e.currentTarget.style.background = "rgba(255,5,113,0.12)"; e.currentTarget.style.borderColor = "rgba(255,5,113,0.30)"; e.currentTarget.style.color = "#ff0571"; }}}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                      >
                        {deletando === reg.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <ModalRegistroPerda
          perdaId={perdaEditando}
          onSucesso={aoSalvar}
          onFechar={fecharModal}
        />
      )}

    </div>
  );
}

export default RegistrosPerdas;