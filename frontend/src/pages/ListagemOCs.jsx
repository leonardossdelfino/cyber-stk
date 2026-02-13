// =============================================
// ARQUIVO: src/pages/ListagemOCs.jsx
// FUNÇÃO: Lista OCs em dois grupos:
//   1. Em Andamento — status ativo (não Finalizado, não Cancelado)
//   2. Histórico     — todas as OCs ordenadas por data
// Paleta v3 — fundo #111111
// Cores de status conforme definição do projeto
// =============================================

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Pencil, Trash2,
  Loader2, RefreshCw, ChevronDown,
} from "lucide-react";
import { listarOCs, deletarOC, atualizarOC } from "../services/api";
import ModalOC from "../components/ModalOC";

// ─────────────────────────────────────────────
// CONSTANTES — status e cores
// ─────────────────────────────────────────────

const STATUS_ATIVOS = [
  "OC Aberta",
  "Aguardando faturar",
  "Aguardando cartão",
  "Aguardando financeiro",
  "Aguardando jurídico",
  "Em transporte",
];

const TODOS_STATUS = [
  ...STATUS_ATIVOS,
  "Finalizado",
  "Cancelado",
];

// Cores dos badges e seletores inline por status
// Conforme especificação do projeto
const COR_STATUS = {
  "OC Aberta":             { bg: "rgba(30, 255, 5, 0.12)",   color: "#1eff05",  dot: "#1eff05"  },
  "Aguardando faturar":    { bg: "rgba(1, 196, 231, 0.12)",  color: "#01c4e7",  dot: "#01c4e7"  },
  "Aguardando cartão":     { bg: "rgba(255, 5, 113, 0.12)",  color: "#ff0571",  dot: "#ff0571"  },
  "Aguardando financeiro": { bg: "rgba(18, 0, 82, 0.50)",    color: "#a07fff",  dot: "#120052"  },
  "Aguardando jurídico":   { bg: "rgba(19, 168, 254, 0.12)", color: "#13a8fe",  dot: "#13a8fe"  },
  "Em transporte":         { bg: "rgba(30, 30, 28, 0.60)",   color: "#888888",  dot: "#111010"  },
  "Finalizado":            { bg: "rgba(75, 83, 32, 0.35)",   color: "#a8b832",  dot: "#4b5320"  },
  "Cancelado":             { bg: "rgba(220, 20, 60, 0.12)",  color: "#dc143c",  dot: "#dc143c"  },
};

const COR_APROVACAO = {
  "Sim":                  { bg: "rgba(194, 255, 5, 0.10)",  color: "#c2ff05" },
  "Não":                  { bg: "rgba(255, 5, 113, 0.10)",  color: "#ff0571" },
  "Aguardando CEO":       { bg: "rgba(255, 163, 0, 0.10)",  color: "#ffa300" },
  "Aguardando Head":      { bg: "rgba(255, 163, 0, 0.10)",  color: "#ffa300" },
  "Aguardando aprovação": { bg: "rgba(255, 255, 255, 0.06)", color: "rgba(255,255,255,0.45)" },
};

// ─────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────

const formatarValor = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatarData = (data) => {
  if (!data) return "—";
  // Aceita "YYYY-MM-DD" (MySQL) — exibe dd/mm/yyyy
  // Usa split direto para evitar problemas de timezone do new Date()
  const partes = data.split("-");
  const ano = partes[0];
  const mes = partes[1];
  const dia = partes[2] ?? "01";
  if (!ano || !mes) return "—";
  return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${ano}`;
};

// ─────────────────────────────────────────────
// BADGE DE STATUS — com bolinha colorida
// ─────────────────────────────────────────────
function BadgeStatus({ status }) {
  const cor = COR_STATUS[status] ?? { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", dot: "#666" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: cor.bg, color: cor.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cor.color }}
      />
      {status}
    </span>
  );
}

// Badge de aprovação
// ─────────────────────────────────────────────
// SELETOR INLINE DE APROVAÇÃO — mesmo padrão do SeletorStatus
// Dropdown fixo via getBoundingClientRect para não ser cortado
// ─────────────────────────────────────────────
const TODAS_APROVACOES = [
  "Sim",
  "Não",
  "Aguardando CEO",
  "Aguardando Head",
  "Aguardando aprovação",
];

function SeletorAprovacao({ oc, onAtualizado }) {
  const [aberto, setAberto]     = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [posicao, setPosicao]   = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const cor = COR_APROVACAO[oc.oc_aprovacao] ?? COR_APROVACAO["Aguardando aprovação"];

  const abrirDropdown = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPosicao({
        top:  rect.bottom + window.scrollY + 4,
        left: rect.left   + window.scrollX,
      });
    }
    setAberto(true);
  };

  const selecionar = async (novaAprovacao) => {
    if (novaAprovacao === oc.oc_aprovacao) { setAberto(false); return; }
    setSalvando(true);
    try {
      await atualizarOC(oc.id, { ...oc, oc_aprovacao: novaAprovacao });
      onAtualizado();
    } finally {
      setSalvando(false);
      setAberto(false);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={abrirDropdown}
        disabled={salvando}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150"
        style={{
          background: cor.bg,
          color:      cor.color,
          border:     `1px solid ${cor.color}33`,
          cursor:     salvando ? "wait" : "pointer",
          opacity:    salvando ? 0.7 : 1,
        }}
      >
        {salvando
          ? <Loader2 size={10} className="animate-spin" />
          : <ChevronDown size={10} style={{ opacity: 0.6 }} />
        }
        {oc.oc_aprovacao}
      </button>

      {aberto && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setAberto(false)}
          />
          <div
            style={{
              position:   "fixed",
              top:        posicao.top,
              left:       posicao.left,
              zIndex:     50,
              minWidth:   "210px",
              padding:    "4px 0",
              borderRadius: "10px",
              background: "rgba(14, 14, 14, 0.98)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border:     "1px solid rgba(194, 255, 5, 0.20)",
              boxShadow:  "0 8px 32px rgba(0,0,0,0.70), 0 0 20px rgba(194,255,5,0.06)",
            }}
          >
            {TODAS_APROVACOES.map((ap) => {
              const c     = COR_APROVACAO[ap] ?? COR_APROVACAO["Aguardando aprovação"];
              const ativo = ap === oc.oc_aprovacao;
              return (
                <button
                  key={ap}
                  onClick={() => selecionar(ap)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-all duration-100"
                  style={{
                    color:      ativo ? c.color : "rgba(255,255,255,0.60)",
                    background: ativo ? `${c.color}18` : "transparent",
                    fontWeight: ativo ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!ativo) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!ativo) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: c.color }}
                  />
                  {ap}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// SELETOR INLINE DE STATUS (dropdown na linha)
// Usa position: fixed com coordenadas via getBoundingClientRect
// para escapar do overflow da tabela sem ser cortado
// ─────────────────────────────────────────────
function SeletorStatus({ oc, onAtualizado }) {
  const [aberto, setAberto]     = useState(false);
  const [salvando, setSalvando] = useState(false);
  // Posição calculada do dropdown no viewport
  const [posicao, setPosicao]   = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const cor = COR_STATUS[oc.oc_status] ?? { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" };

  // Calcula a posição exata do botão no viewport ao abrir
  const abrirDropdown = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPosicao({
        top:  rect.bottom + window.scrollY + 4,  // 4px abaixo do botão
        left: rect.left   + window.scrollX,
      });
    }
    setAberto(true);
  };

  const selecionar = async (novoStatus) => {
    if (novoStatus === oc.oc_status) { setAberto(false); return; }
    setSalvando(true);
    try {
      await atualizarOC(oc.id, { ...oc, oc_status: novoStatus });
      onAtualizado();
    } finally {
      setSalvando(false);
      setAberto(false);
    }
  };

  return (
    <>
      {/* Botão de trigger */}
      <button
        ref={btnRef}
        onClick={abrirDropdown}
        disabled={salvando}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150"
        style={{
          background: cor.bg,
          color:      cor.color,
          border:     `1px solid ${cor.color}33`,
          cursor:     salvando ? "wait" : "pointer",
          opacity:    salvando ? 0.7 : 1,
        }}
      >
        {salvando ? (
          <Loader2 size={10} className="animate-spin" />
        ) : (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: cor.color }}
          />
        )}
        {oc.oc_status}
        <ChevronDown size={10} style={{ opacity: 0.6 }} />
      </button>

      {/* Dropdown — renderizado via portal em position: fixed
          Fica fora da tabela, nunca é cortado pelo overflow */}
      {aberto && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setAberto(false)}
          />

          <div
            style={{
              position:   "fixed",
              top:        posicao.top,
              left:       posicao.left,
              zIndex:     50,
              minWidth:   "210px",
              padding:    "4px 0",
              borderRadius: "10px",
              background: "rgba(14, 14, 14, 0.98)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border:     "1px solid rgba(255, 5, 113, 0.22)",
              boxShadow:  "0 8px 32px rgba(0,0,0,0.70), 0 0 20px rgba(255,5,113,0.07)",
            }}
          >
            {TODOS_STATUS.map((st) => {
              const c    = COR_STATUS[st] ?? { color: "rgba(255,255,255,0.45)" };
              const ativo = st === oc.oc_status;
              return (
                <button
                  key={st}
                  onClick={() => selecionar(st)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-all duration-100"
                  style={{
                    color:      ativo ? c.color : "rgba(255,255,255,0.60)",
                    background: ativo ? `${c.color}18` : "transparent",
                    fontWeight: ativo ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!ativo) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!ativo) e.currentTarget.style.background = ativo ? `${c.color}18` : "transparent";
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: c.color }}
                  />
                  {st}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// CABEÇALHO DE SEÇÃO
// ─────────────────────────────────────────────
function SecaoTitulo({ titulo, subtitulo, cor }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className="w-1 h-5 rounded-full flex-shrink-0"
        style={{ background: cor }}
      />
      <div>
        <p className="text-sm font-semibold text-white">{titulo}</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{subtitulo}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TABELA DE OCs
// ─────────────────────────────────────────────
function TabelaOCs({ ocs, loading, onEditar, onDeletar, onStatusAtualizado, deletando }) {

  // Estilo base das células
  const tdBase = {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
    verticalAlign: "middle",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <Loader2 size={18} style={{ color: "#ff0571" }} className="animate-spin" />
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Carregando...</span>
      </div>
    );
  }

  if (ocs.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-12 rounded-xl text-sm"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.25)",
        }}
      >
        Nenhuma ordem encontrada
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>

        {/* Cabeçalho */}
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["OC", "Descrição", "Fornecedor", "Valor", "Referência", "Status", "Aprovação", ""].map((col) => (
              <th
                key={col}
                style={{
                  padding: "11px 16px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.30)",
                  whiteSpace: "nowrap",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* Linhas */}
        <tbody>
          {ocs.map((oc) => (
            <tr
              key={oc.id}
              style={{ transition: "background 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {/* Número OC */}
              <td style={{ ...tdBase, fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap" }}>
                {oc.oc_numero}
              </td>

              {/* Descrição */}
              <td style={{ ...tdBase, maxWidth: "200px" }}>
                <span
                  className="block overflow-hidden"
                  style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={oc.oc_descricao}
                >
                  {oc.oc_descricao}
                </span>
              </td>

              {/* Fornecedor */}
              <td style={{ ...tdBase, whiteSpace: "nowrap" }}>{oc.oc_nome_fornecedor}</td>

              {/* Valor */}
              <td style={{ ...tdBase, fontWeight: 600, color: "#c2ff05", whiteSpace: "nowrap" }}>
                {formatarValor(oc.oc_valor)}
              </td>

              {/* Referência */}
              <td style={{ ...tdBase, whiteSpace: "nowrap", color: "rgba(255,255,255,0.45)" }}>
                {formatarData(oc.oc_data_referencia)}
              </td>

              {/* Status — seletor inline */}
              <td style={{ ...tdBase }}>
                <SeletorStatus oc={oc} onAtualizado={onStatusAtualizado} />
              </td>

              {/* Aprovação — seletor inline */}
              <td style={{ ...tdBase }}>
                <SeletorAprovacao oc={oc} onAtualizado={onStatusAtualizado} />
              </td>

              {/* Ações */}
              <td style={{ ...tdBase, whiteSpace: "nowrap" }}>
                <div className="flex items-center gap-2">

                  {/* Editar */}
                  <button
                    onClick={() => onEditar(oc.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                    title="Editar OC"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.45)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 163, 0, 0.12)";
                      e.currentTarget.style.borderColor = "rgba(255, 163, 0, 0.30)";
                      e.currentTarget.style.color = "#ffa300";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                    }}
                  >
                    <Pencil size={13} />
                  </button>

                  {/* Deletar */}
                  <button
                    onClick={() => onDeletar(oc.id)}
                    disabled={deletando === oc.id}
                    className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                    title="Deletar OC"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.45)",
                      cursor: deletando === oc.id ? "wait" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (deletando !== oc.id) {
                        e.currentTarget.style.background = "rgba(255, 5, 113, 0.12)";
                        e.currentTarget.style.borderColor = "rgba(255, 5, 113, 0.30)";
                        e.currentTarget.style.color = "#ff0571";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                    }}
                  >
                    {deletando === oc.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL — ListagemOCs
// ─────────────────────────────────────────────
function ListagemOCs() {
  const [ocs, setOcs]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busca, setBusca]           = useState("");
  const [deletando, setDeletando]   = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [ocEditando, setOcEditando] = useState(null);

  // ── Carrega OCs da API
  const carregarOCs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarOCs();
      if (res.success) setOcs(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarOCs(); }, [carregarOCs]);

  // ── Deletar OC
  const handleDeletar = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar esta OC?")) return;
    setDeletando(id);
    try {
      await deletarOC(id);
      await carregarOCs();
    } finally {
      setDeletando(null);
    }
  };

  // ── Abrir modal para nova OC ou edição
  const abrirModal    = ()    => { setOcEditando(null); setModalAberto(true); };
  const abrirEdicao   = (id) => { setOcEditando(id);   setModalAberto(true); };
  const fecharModal   = ()    => { setModalAberto(false); setOcEditando(null); };
  const aoSalvar      = ()    => { fecharModal(); carregarOCs(); };

  // ── Filtragem por busca
  const ocsFiltradas = ocs.filter((oc) => {
    const q = busca.toLowerCase();
    return (
      oc.oc_numero?.toLowerCase().includes(q)           ||
      oc.oc_descricao?.toLowerCase().includes(q)        ||
      oc.oc_nome_fornecedor?.toLowerCase().includes(q)  ||
      oc.oc_status?.toLowerCase().includes(q)
    );
  });

  // ── Separação em seções
  const ocsAndamento = ocsFiltradas.filter((oc) => STATUS_ATIVOS.includes(oc.oc_status));
  const ocsHistorico  = ocsFiltradas; // todas, ordenadas por data (o backend já ordena)

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="p-6" style={{ background: "#111111", minHeight: "100vh" }}>

      {/* ── Cabeçalho da página ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Ordens de Compra</h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {ocs.length} ordem{ocs.length !== 1 ? "s" : ""} no total
          </p>
        </div>

        {/* Controles: busca + botões */}
        <div className="flex items-center gap-3">

          {/* Campo de busca */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(255,255,255,0.30)" }}
            />
            <input
              type="text"
              placeholder="Buscar OC..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
                width: "220px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,5,113,0.40)";
                e.target.style.boxShadow = "0 0 0 3px rgba(255,5,113,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Atualizar */}
          <button
            onClick={carregarOCs}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150"
            title="Atualizar"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            }}
          >
            <RefreshCw size={15} />
          </button>

          {/* Nova OC — botão principal */}
          <button
            onClick={abrirModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{
              background: "#ff0571",
              color: "#ffffff",
              border: "1px solid rgba(255,5,113,0.50)",
              boxShadow: "0 0 20px rgba(255,5,113,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e0044f";
              e.currentTarget.style.boxShadow = "0 0 28px rgba(255,5,113,0.40)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ff0571";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255,5,113,0.25)";
            }}
          >
            <Plus size={16} />
            Nova OC
          </button>

        </div>
      </div>

      {/* ── Seção 1: Em Andamento ── */}
      <div className="mb-8">
        <SecaoTitulo
          titulo="Em Andamento"
          subtitulo={`${ocsAndamento.length} ordem${ocsAndamento.length !== 1 ? "s" : ""} ativa${ocsAndamento.length !== 1 ? "s" : ""}`}
          cor="#ff0571"
        />
        <TabelaOCs
          ocs={ocsAndamento}
          loading={loading}
          onEditar={abrirEdicao}
          onDeletar={handleDeletar}
          onStatusAtualizado={carregarOCs}
          deletando={deletando}
        />
      </div>

      {/* Divisor */}
      <div
        className="my-6"
        style={{ height: "1px", background: "rgba(255,255,255,0.05)" }}
      />

      {/* ── Seção 2: Histórico Completo ── */}
      <div>
        <SecaoTitulo
          titulo="Histórico Completo"
          subtitulo={`${ocsHistorico.length} ordem${ocsHistorico.length !== 1 ? "s" : ""} no total · ordenado por data`}
          cor="#c2ff05"
        />
        <TabelaOCs
          ocs={ocsHistorico}
          loading={loading}
          onEditar={abrirEdicao}
          onDeletar={handleDeletar}
          onStatusAtualizado={carregarOCs}
          deletando={deletando}
        />
      </div>

      {/* ── Modal ── */}
      {modalAberto && (
        <ModalOC
          ocId={ocEditando}
          onFechar={fecharModal}
          onSalvo={aoSalvar}
        />
      )}

    </div>
  );
}

export default ListagemOCs;