// =============================================
// ARQUIVO: src/pages/ListagemOCs.jsx
// FUNÇÃO: Lista OCs em dois grupos:
//   1. Em Andamento — status ativo
//   2. Histórico    — todas as OCs
// Status e aprovação carregados do banco com cores
// =============================================

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Pencil, Trash2,
  Loader2, RefreshCw, ChevronDown, Paperclip,
} from "lucide-react";
import {
  listarOCs, deletarOC, atualizarOC,
  listarConfiguracao, buscarOC,
} from "../services/api";
import ModalOC from "../components/ModalOC";
import ModalDocumentos from "../components/ModalDocumentos";

// ─────────────────────────────────────────────
// CORES DE STATUS — fallback enquanto banco carrega
// ─────────────────────────────────────────────
const COR_STATUS_PADRAO = {
  "OC Aberta":             { bg: "rgba(30, 255, 5, 0.12)",   color: "#1eff05" },
  "Aguardando faturar":    { bg: "rgba(1, 196, 231, 0.12)",  color: "#01c4e7" },
  "Aguardando cartão":     { bg: "rgba(255, 5, 113, 0.12)",  color: "#ff0571" },
  "Aguardando financeiro": { bg: "rgba(18, 0, 82, 0.50)",    color: "#a07fff" },
  "Aguardando jurídico":   { bg: "rgba(19, 168, 254, 0.12)", color: "#13a8fe" },
  "Em transporte":         { bg: "rgba(30, 30, 28, 0.60)",   color: "#888888" },
  "Finalizado":            { bg: "rgba(75, 83, 32, 0.35)",   color: "#a8b832" },
  "Cancelado":             { bg: "rgba(220, 20, 60, 0.12)",  color: "#dc143c" },
};

// Fallback de aprovação — usado até o banco responder
const APROVACAO_FALLBACK = ["Não", "Pendente", "Sim"];

// Cor fallback para aprovação sem cor mapeada no banco
const COR_APROVACAO_FALLBACK = {
  bg:     "rgba(255, 5, 113, 0.10)",
  color:  "#ff0571",
  border: "rgba(255, 5, 113, 0.33)",
};

// Gera objeto de cor a partir de hex vindo do banco
const corDinamica = (hex) => ({
  bg:     `${hex}22`,
  color:  hex,
  border: `${hex}55`,
});

// ─────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────
const formatarValor = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatarData = (data) => {
  if (!data) return "—";
  const [ano, mes, dia = "01"] = data.split("-");
  if (!ano || !mes) return "—";
  return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${ano}`;
};

// ─────────────────────────────────────────────
// CABEÇALHO DE SEÇÃO
// ─────────────────────────────────────────────
function SecaoTitulo({ titulo, subtitulo, cor }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: cor }} />
      <div>
        <p className="text-sm font-semibold text-white">{titulo}</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{subtitulo}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SELETOR INLINE DE STATUS
// ─────────────────────────────────────────────
function SeletorStatus({ oc, onAtualizado, todosStatus, corStatus }) {
  const [aberto, setAberto]         = useState(false);
  const [salvando, setSalvando]     = useState(false);
  const [valorAtual, setValorAtual] = useState(oc.oc_status);
  const [posicao, setPosicao]       = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  useEffect(() => { setValorAtual(oc.oc_status); }, [oc.oc_status]);

  const cor = corStatus[valorAtual] ?? corDinamica("#888888");

  const abrirDropdown = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPosicao({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    setAberto(true);
  };

  const selecionar = async (novoStatus) => {
    if (novoStatus === valorAtual) { setAberto(false); return; }
    setValorAtual(novoStatus);
    setAberto(false);
    setSalvando(true);
    try {
      const res = await buscarOC(oc.id);
      if (!res.success) throw new Error("OC não encontrada");
      await atualizarOC(oc.id, { ...res.data, oc_status: novoStatus });
      onAtualizado();
    } catch {
      setValorAtual(oc.oc_status);
    } finally {
      setSalvando(false);
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
          : <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cor.color }} />
        }
        {valorAtual || "—"}
        <ChevronDown size={10} style={{ opacity: 0.6 }} />
      </button>

      {aberto && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setAberto(false)} />
          <div style={{
            position: "fixed", top: posicao.top, left: posicao.left, zIndex: 50,
            minWidth: "210px", padding: "4px 0", borderRadius: "10px",
            background: "rgba(14,14,14,0.98)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,5,113,0.22)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.70)",
          }}>
            {todosStatus.map((st) => {
              const c     = corStatus[st] ?? corDinamica("#888888");
              const ativo = st === valorAtual;
              return (
                <button key={st} onClick={() => selecionar(st)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-all duration-100"
                  style={{
                    color:      ativo ? c.color : "rgba(255,255,255,0.60)",
                    background: ativo ? `${c.color}18` : "transparent",
                    fontWeight: ativo ? 600 : 400,
                  }}
                  onMouseEnter={(e) => { if (!ativo) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { if (!ativo) e.currentTarget.style.background = "transparent"; }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
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
// SELETOR INLINE DE APROVAÇÃO
// Cor dinâmica vinda do banco via mapaCorAprovacao
// ─────────────────────────────────────────────
function SeletorAprovacao({ oc, onAtualizado, todasAprovacoes, mapaCorAprovacao }) {
  const [aberto, setAberto]         = useState(false);
  const [salvando, setSalvando]     = useState(false);
  const [valorAtual, setValorAtual] = useState(oc.oc_aprovacao);
  const [posicao, setPosicao]       = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  useEffect(() => { setValorAtual(oc.oc_aprovacao); }, [oc.oc_aprovacao]);

  // Usa cor do banco se disponível, senão fallback rosa
  const cor = mapaCorAprovacao[valorAtual] ?? COR_APROVACAO_FALLBACK;

  const abrirDropdown = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPosicao({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    setAberto(true);
  };

  const selecionar = async (novaAprovacao) => {
    if (novaAprovacao === valorAtual) { setAberto(false); return; }
    setValorAtual(novaAprovacao);
    setAberto(false);
    setSalvando(true);
    try {
      const res = await buscarOC(oc.id);
      if (!res.success) throw new Error("OC não encontrada");
      await atualizarOC(oc.id, { ...res.data, oc_aprovacao: novaAprovacao });
      onAtualizado();
    } catch {
      setValorAtual(oc.oc_aprovacao);
    } finally {
      setSalvando(false);
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
          border:     `1px solid ${cor.border}`,
          cursor:     salvando ? "wait" : "pointer",
          opacity:    salvando ? 0.7 : 1,
        }}
      >
        {salvando
          ? <Loader2 size={10} className="animate-spin" />
          : <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cor.color }} />
        }
        {valorAtual || "—"}
        <ChevronDown size={10} style={{ opacity: 0.6 }} />
      </button>

      {aberto && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setAberto(false)} />
          <div style={{
            position: "fixed", top: posicao.top, left: posicao.left, zIndex: 50,
            minWidth: "180px", padding: "4px 0", borderRadius: "10px",
            background: "rgba(14,14,14,0.98)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,5,113,0.22)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.70)",
          }}>
            {todasAprovacoes.map((ap) => {
              const c     = mapaCorAprovacao[ap] ?? COR_APROVACAO_FALLBACK;
              const ativo = ap === valorAtual;
              return (
                <button key={ap} onClick={() => selecionar(ap)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-all duration-100"
                  style={{
                    color:      ativo ? c.color : "rgba(255,255,255,0.60)",
                    background: ativo ? c.bg    : "transparent",
                    fontWeight: ativo ? 600     : 400,
                  }}
                  onMouseEnter={(e) => { if (!ativo) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { if (!ativo) e.currentTarget.style.background = "transparent"; }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: ativo ? c.color : "rgba(255,255,255,0.30)" }} />
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
// TABELA DE OCs
// ─────────────────────────────────────────────
function TabelaOCs({
  ocs, loading, onEditar, onDeletar, onStatusAtualizado,
  onAbrirDocumentos, contadorDocs, deletando,
  todosStatus, todasAprovacoes, corStatus, mapaCorAprovacao,
}) {
  const tdBase = {
    padding:       "12px 16px",
    borderBottom:  "1px solid rgba(255,255,255,0.04)",
    fontSize:      "13px",
    color:         "rgba(255,255,255,0.75)",
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
      <div className="flex items-center justify-center py-12 rounded-xl text-sm"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}>
        Nenhuma ordem encontrada
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl"
      style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["OC", "Descrição", "Fornecedor", "Valor", "Pagamento", "Referência", "Status", "Aprovação", ""].map((col) => (
              <th key={col} style={{
                padding: "11px 16px", textAlign: "left", fontSize: "11px",
                fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.30)", whiteSpace: "nowrap",
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ocs.map((oc) => {
            const totalDocs = contadorDocs[oc.id] ?? 0;
            const temDocs   = totalDocs > 0;
            return (
              <tr key={oc.id}
                style={{ transition: "background 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ ...tdBase, fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap" }}>
                  {oc.oc_numero}
                </td>
                <td style={{ ...tdBase, maxWidth: "200px" }}>
                  <span className="block overflow-hidden"
                    style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={oc.oc_descricao}>
                    {oc.oc_descricao}
                  </span>
                </td>
                <td style={{ ...tdBase, whiteSpace: "nowrap" }}>
                  {oc.oc_nome_fornecedor}
                </td>
                <td style={{ ...tdBase, fontWeight: 600, color: "#c2ff05", whiteSpace: "nowrap" }}>
                  {formatarValor(oc.oc_valor)}
                </td>
                <td style={{ ...tdBase, whiteSpace: "nowrap", color: "rgba(255,255,255,0.55)" }}>
                  {oc.oc_forma_pagamento || "—"}
                </td>
                <td style={{ ...tdBase, whiteSpace: "nowrap", color: "rgba(255,255,255,0.45)" }}>
                  {formatarData(oc.oc_data_referencia)}
                </td>
                <td style={tdBase}>
                  <SeletorStatus
                    oc={oc}
                    onAtualizado={onStatusAtualizado}
                    todosStatus={todosStatus}
                    corStatus={corStatus}
                  />
                </td>
                <td style={tdBase}>
                  <SeletorAprovacao
                    oc={oc}
                    onAtualizado={onStatusAtualizado}
                    todasAprovacoes={todasAprovacoes}
                    mapaCorAprovacao={mapaCorAprovacao}
                  />
                </td>
                <td style={{ ...tdBase, whiteSpace: "nowrap" }}>
                  <div className="flex items-center gap-2">

                    {/* Documentos */}
                    <button onClick={() => onAbrirDocumentos(oc)}
                      className="relative flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                      title={temDocs ? `${totalDocs} documento(s)` : "Anexar documento"}
                      style={{
                        background: temDocs ? "rgba(0,191,255,0.10)" : "rgba(255,255,255,0.04)",
                        border:     temDocs ? "1px solid rgba(0,191,255,0.30)" : "1px solid rgba(255,255,255,0.08)",
                        color:      temDocs ? "#00bfff" : "rgba(255,255,255,0.35)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background  = "rgba(0,191,255,0.15)";
                        e.currentTarget.style.borderColor = "rgba(0,191,255,0.40)";
                        e.currentTarget.style.color       = "#00bfff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background  = temDocs ? "rgba(0,191,255,0.10)" : "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = temDocs ? "rgba(0,191,255,0.30)" : "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color       = temDocs ? "#00bfff" : "rgba(255,255,255,0.35)";
                      }}
                    >
                      <Paperclip size={13} />
                      {temDocs && (
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-white font-bold"
                          style={{ fontSize: "9px", minWidth: "14px", height: "14px", background: "#00bfff", padding: "0 3px" }}>
                          {totalDocs}
                        </span>
                      )}
                    </button>

                    {/* Editar */}
                    <button onClick={() => onEditar(oc.id)}
                      className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                      title="Editar OC"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
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
                    <button onClick={() => onDeletar(oc.id)}
                      disabled={deletando === oc.id}
                      className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                      title="Deletar OC"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border:     "1px solid rgba(255,255,255,0.08)",
                        color:      "rgba(255,255,255,0.45)",
                        cursor:     deletando === oc.id ? "wait" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (deletando !== oc.id) {
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
                      {deletando === oc.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Trash2 size={13} />
                      }
                    </button>

                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────
function ListagemOCs() {
  const [ocs, setOcs]                   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busca, setBusca]               = useState("");
  const [deletando, setDeletando]       = useState(null);
  const [modalAberto, setModalAberto]   = useState(false);
  const [ocEditando, setOcEditando]     = useState(null);
  const [ocDocumentos, setOcDocumentos] = useState(null);
  const [contadorDocs, setContadorDocs] = useState({});

  // Status OC
  const [todosStatus,  setTodosStatus]  = useState(Object.keys(COR_STATUS_PADRAO));
  const [statusAtivos, setStatusAtivos] = useState(
    Object.keys(COR_STATUS_PADRAO).filter((s) => s !== "Finalizado" && s !== "Cancelado")
  );
  const [corStatus, setCorStatus] = useState(COR_STATUS_PADRAO);

  // Aprovação — fallback garante que seletores nunca fiquem vazios
  const [todasAprovacoes,  setTodasAprovacoes]  = useState(APROVACAO_FALLBACK);
  const [mapaCorAprovacao, setMapaCorAprovacao] = useState({});

  // Carrega opções do banco uma vez ao montar
  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const [statusOC, aprovacao] = await Promise.all([
          listarConfiguracao("status_oc"),
          listarConfiguracao("status_aprovacao"),
        ]);

        // ── Status OC
        const novaCorStatus = { ...COR_STATUS_PADRAO };
        const nomesStatus   = statusOC.map((s) => {
          if (s.cor && !novaCorStatus[s.nome]) {
            novaCorStatus[s.nome] = corDinamica(s.cor);
          }
          return s.nome;
        });
        setCorStatus(novaCorStatus);
        setTodosStatus(nomesStatus);
        setStatusAtivos(nomesStatus.filter((n) => n !== "Finalizado" && n !== "Cancelado"));

        // ── Aprovação — substitui fallback e monta mapa de cores
        const nomesAprovacao = aprovacao.map((a) => a.nome);
        if (nomesAprovacao.length > 0) {
          setTodasAprovacoes(nomesAprovacao);

          // Monta { "Sim": { bg, color, border }, "Não": {...}, ... }
          // Inclui fallback rosa para itens sem cor cadastrada no banco
          const mapa = {};
          aprovacao.forEach((a) => {
            mapa[a.nome] = a.cor
              ? corDinamica(a.cor)
              : COR_APROVACAO_FALLBACK;
          });
          setMapaCorAprovacao(mapa);
        }
      } catch {
        // Em erro de rede mantém os valores fallback
      }
    };
    carregarOpcoes();
  }, []);

  // Carrega lista de OCs
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

  // Deletar OC
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

  // Modal OC
  const abrirModal  = ()   => { setOcEditando(null); setModalAberto(true); };
  const abrirEdicao = (id) => { setOcEditando(id);   setModalAberto(true); };
  const fecharModal = ()   => { setModalAberto(false); setOcEditando(null); };
  const aoSalvar    = ()   => { fecharModal(); carregarOCs(); };

  // Modal Documentos
  const abrirDocumentos   = (oc)           => setOcDocumentos(oc);
  const fecharDocumentos  = ()             => setOcDocumentos(null);
  // useCallback estabiliza a referência — sem isso o ModalDocumentos
  // entra em loop infinito pois a função é recriada a cada render
  const atualizarContador = useCallback((oc_id, total) =>
    setContadorDocs((prev) => ({ ...prev, [oc_id]: total }))
  , []);

  // Filtragem por busca
  const ocsFiltradas = ocs.filter((oc) => {
    const q = busca.toLowerCase();
    return (
      oc.oc_numero?.toLowerCase().includes(q)          ||
      oc.oc_descricao?.toLowerCase().includes(q)       ||
      oc.oc_nome_fornecedor?.toLowerCase().includes(q) ||
      oc.oc_status?.toLowerCase().includes(q)
    );
  });

  const ocsAndamento = ocsFiltradas.filter((oc) => statusAtivos.includes(oc.oc_status));
  const ocsHistorico = ocsFiltradas;

  const propsTabela = {
    loading,
    onEditar:           abrirEdicao,
    onDeletar:          handleDeletar,
    onStatusAtualizado: carregarOCs,
    onAbrirDocumentos:  abrirDocumentos,
    contadorDocs,
    deletando,
    todosStatus,
    todasAprovacoes,
    corStatus,
    mapaCorAprovacao,
  };

  return (
    <div className="p-6" style={{ background: "#111111", minHeight: "100vh" }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Ordens de Compra</h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {ocs.length} ordem{ocs.length !== 1 ? "s" : ""} no total
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="relative">
            <Search size={14}
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
                border:     "1px solid rgba(255,255,255,0.08)",
                color:      "#ffffff",
                width:      "220px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,5,113,0.40)";
                e.target.style.boxShadow   = "0 0 0 3px rgba(255,5,113,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                e.target.style.boxShadow   = "none";
              }}
            />
          </div>

          <button onClick={carregarOCs}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150"
            title="Atualizar"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
          >
            <RefreshCw size={15} />
          </button>

          <button onClick={abrirModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{
              background: "#ff0571",
              color:      "#ffffff",
              border:     "1px solid rgba(255,5,113,0.50)",
              boxShadow:  "0 0 20px rgba(255,5,113,0.25)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e0044f"; e.currentTarget.style.boxShadow = "0 0 28px rgba(255,5,113,0.40)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ff0571"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,5,113,0.25)"; }}
          >
            <Plus size={16} />
            Nova OC
          </button>

        </div>
      </div>

      {/* Seção 1 — Em Andamento */}
      <div className="mb-8">
        <SecaoTitulo
          titulo="Em Andamento"
          subtitulo={`${ocsAndamento.length} ordem${ocsAndamento.length !== 1 ? "s" : ""} ativa${ocsAndamento.length !== 1 ? "s" : ""}`}
          cor="#ff0571"
        />
        <TabelaOCs ocs={ocsAndamento} {...propsTabela} />
      </div>

      <div className="my-6" style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

      {/* Seção 2 — Histórico */}
      <div>
        <SecaoTitulo
          titulo="Histórico Completo"
          subtitulo={`${ocsHistorico.length} ordem${ocsHistorico.length !== 1 ? "s" : ""} no total · ordenado por data`}
          cor="#c2ff05"
        />
        <TabelaOCs ocs={ocsHistorico} {...propsTabela} />
      </div>

      {modalAberto && (
        <ModalOC ocId={ocEditando} onFechar={fecharModal} onSalvo={aoSalvar} />
      )}

      {ocDocumentos && (
        <ModalDocumentos
          oc={ocDocumentos}
          onFechar={fecharDocumentos}
          onContadorAtualizado={atualizarContador}
        />
      )}

    </div>
  );
}

export default ListagemOCs;