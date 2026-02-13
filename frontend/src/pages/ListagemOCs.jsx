// =============================================
// ARQUIVO: src/pages/ListagemOCs.jsx
// FUNÇÃO: Lista OCs em dois grupos:
//   1. Em Andamento — status != Finalizado e != Cancelado
//   2. Histórico Completo — todas as OCs por data
// Seletor de status inline em ambas as listas
// =============================================

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Pencil, Trash2,
  Loader2, RefreshCw, ChevronDown
} from "lucide-react";
import { listarOCs, deletarOC, atualizarOC } from "../services/api";
import ModalOC from "../components/ModalOC";

// -----------------------------------------------
// Constantes
// -----------------------------------------------
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

const COR_STATUS = {
  "OC Aberta":             { bg: "rgba(1,161,255,0.12)",   color: "#01a1ff" },
  "Aguardando faturar":    { bg: "rgba(255,156,0,0.12)",   color: "#ff9c00" },
  "Aguardando cartão":     { bg: "rgba(255,156,0,0.12)",   color: "#ff9c00" },
  "Aguardando financeiro": { bg: "rgba(255,156,0,0.12)",   color: "#ff9c00" },
  "Aguardando jurídico":   { bg: "rgba(255,156,0,0.12)",   color: "#ff9c00" },
  "Em transporte":         { bg: "rgba(177,255,0,0.12)",   color: "#b1ff00" },
  "Finalizado":            { bg: "rgba(77,255,0,0.12)",    color: "#4dff00" },
  "Cancelado":             { bg: "rgba(100,100,100,0.15)", color: "#767676" },
};

const COR_APROVACAO = {
  "Sim":                  { bg: "rgba(77,255,0,0.12)",   color: "#4dff00" },
  "Não":                  { bg: "rgba(255,50,50,0.12)",  color: "#ff5555" },
  "Aguardando CEO":       { bg: "rgba(255,156,0,0.12)",  color: "#ff9c00" },
  "Aguardando Head":      { bg: "rgba(255,156,0,0.12)",  color: "#ff9c00" },
  "Aguardando aprovação": { bg: "rgba(177,255,0,0.12)",  color: "#b1ff00" },
};

// -----------------------------------------------
// Utilitários
// -----------------------------------------------
const formatarValor = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatarData = (data) => {
  if (!data) return "-";
  const [ano, mes] = data.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${meses[parseInt(mes) - 1]}/${ano}`;
};

// -----------------------------------------------
// Badge de aprovação
// -----------------------------------------------
function Badge({ texto, mapa }) {
  const estilo = mapa[texto] || { bg: "rgba(100,100,100,0.15)", color: "#767676" };
  return (
    <span
      className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: estilo.bg, color: estilo.color }}
    >
      {texto}
    </span>
  );
}

// -----------------------------------------------
// Seletor de status inline
// colorScheme: "dark" força fundo escuro no dropdown nativo
// -----------------------------------------------
function SeletorStatus({ ocId, statusAtual, onAtualizado }) {
  const [salvando, setSalvando] = useState(false);
  const estilo = COR_STATUS[statusAtual] || { bg: "rgba(100,100,100,0.15)", color: "#767676" };

  const handleChange = async (e) => {
    const novoStatus = e.target.value;
    setSalvando(true);
    try {
      await atualizarOC(ocId, { oc_status: novoStatus, _patch: true });
      onAtualizado();
    } catch {
      console.error("Erro ao atualizar status");
    } finally {
      setSalvando(false);
    }
  };

  if (salvando) {
    return <Loader2 size={14} className="animate-spin" style={{ color: estilo.color }} />;
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={statusAtual}
        onChange={handleChange}
        className="appearance-none pr-6 pl-2.5 py-1 rounded-full text-xs font-medium cursor-pointer focus:outline-none transition-all"
        style={{
          background: estilo.bg,
          color: estilo.color,
          border: `1px solid ${estilo.color}40`,
          colorScheme: "dark", // força fundo escuro no dropdown do sistema
        }}
      >
        {TODOS_STATUS.map((s) => (
          <option
            key={s}
            value={s}
            style={{ background: "#272727", color: "#ffffff" }}
          >
            {s}
          </option>
        ))}
      </select>
      <ChevronDown
        size={10}
        className="absolute right-1.5 pointer-events-none"
        style={{ color: estilo.color }}
      />
    </div>
  );
}

// -----------------------------------------------
// Título de seção com barra colorida lateral
// -----------------------------------------------
function SecaoTitulo({ titulo, subtitulo, cor = "#b1ff00" }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 rounded-full" style={{ background: cor }} />
      <div>
        <h2 className="text-base font-bold text-white">{titulo}</h2>
        <p className="text-xs text-carbon-700">{subtitulo}</p>
      </div>
    </div>
  );
}

// -----------------------------------------------
// Tabela reutilizável
// -----------------------------------------------
function TabelaOCs({ ocs, loading, onEditar, onDeletar, onStatusAtualizado, deletando }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid rgba(177,255,0,0.12)",
        boxShadow: "0 0 40px rgba(0,0,0,0.4)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Cabeçalho */}
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(177,255,0,0.08)" }}>
              {["Nº OC","Fornecedor","Descrição","Valor","Status","Aprovação","Referência","Ações"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-carbon-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Corpo */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto" size={28} style={{ color: "#ff9c00" }} />
                </td>
              </tr>
            ) : ocs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-carbon-700 text-sm">
                  Nenhuma OC encontrada.
                </td>
              </tr>
            ) : (
              ocs.map((oc) => (
                <tr
                  key={oc.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {/* Nº OC */}
                  <td className="px-4 py-3 text-sm font-mono font-semibold whitespace-nowrap" style={{ color: "#ff9c00" }}>
                    {oc.oc_numero}
                  </td>

                  {/* Fornecedor */}
                  <td className="px-4 py-3 text-sm text-white font-medium whitespace-nowrap">
                    {oc.oc_nome_fornecedor}
                  </td>

                  {/* Descrição */}
                  <td className="px-4 py-3 text-sm text-carbon-800 max-w-xs">
                    <span className="block truncate max-w-[220px]" title={oc.oc_descricao}>
                      {oc.oc_descricao}
                    </span>
                  </td>

                  {/* Valor */}
                  <td className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">
                    {formatarValor(oc.oc_valor)}
                  </td>

                  {/* Status — seletor inline */}
                  <td className="px-4 py-3">
                    <SeletorStatus
                      ocId={oc.id}
                      statusAtual={oc.oc_status}
                      onAtualizado={onStatusAtualizado}
                    />
                  </td>

                  {/* Aprovação */}
                  <td className="px-4 py-3">
                    <Badge texto={oc.oc_aprovacao} mapa={COR_APROVACAO} />
                  </td>

                  {/* Referência */}
                  <td className="px-4 py-3 text-sm text-carbon-700 whitespace-nowrap">
                    {formatarData(oc.oc_data_referencia)}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">

                      {/* Editar */}
                      <button
                        onClick={() => onEditar(oc.id)}
                        title="Editar OC"
                        className="p-1.5 rounded-lg transition-all text-carbon-700"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(177,255,0,0.1)";
                          e.currentTarget.style.color = "#b1ff00";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#767676";
                        }}
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Deletar */}
                      <button
                        onClick={() => onDeletar(oc.id, oc.oc_numero)}
                        disabled={deletando === oc.id}
                        title="Excluir OC"
                        className="p-1.5 rounded-lg transition-all text-carbon-700 disabled:opacity-40"
                        onMouseEnter={(e) => {
                          if (deletando !== oc.id) {
                            e.currentTarget.style.background = "rgba(255,50,50,0.1)";
                            e.currentTarget.style.color = "#ff5555";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#767676";
                        }}
                      >
                        {deletando === oc.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
function ListagemOCs() {
  const [ocs, setOcs]                   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busca, setBusca]               = useState("");
  const [modalAberto, setModalAberto]   = useState(false);
  const [ocEditando, setOcEditando]     = useState(null);
  const [deletando, setDeletando]       = useState(null);

  // Carrega todas as OCs da API
  const carregarOCs = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await listarOCs();
      if (resultado.success) setOcs(resultado.data);
    } catch {
      console.error("Erro ao carregar OCs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarOCs(); }, [carregarOCs]);

  // -----------------------------------------------
  // Aplica busca e filtro de status em uma lista
  // -----------------------------------------------
  const aplicarFiltros = (lista) => {
    let resultado = [...lista];

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter((oc) =>
        oc.oc_numero.toLowerCase().includes(termo)          ||
        oc.oc_descricao.toLowerCase().includes(termo)       ||
        oc.oc_nome_fornecedor.toLowerCase().includes(termo) ||
        oc.oc_solicitante.toLowerCase().includes(termo)
      );
    }

    return resultado;
  };

  // Lista 1 — apenas OCs ativas (sem Finalizado e Cancelado)
  const ocsAndamento = aplicarFiltros(
    ocs.filter((oc) => !["Finalizado", "Cancelado"].includes(oc.oc_status))
  );

  // Lista 2 — todas as OCs ordenadas por data de referência (mais recente primeiro)
  const ocsHistorico = aplicarFiltros(
    [...ocs].sort((a, b) =>
      new Date(b.oc_data_referencia) - new Date(a.oc_data_referencia)
    )
  );

  // -----------------------------------------------
  // Handlers de modal e deleção
  // -----------------------------------------------
  const abrirNova   = () => { setOcEditando(null); setModalAberto(true); };
  const abrirEdicao = (id) => { setOcEditando(id); setModalAberto(true); };
  const fecharModal = () => { setModalAberto(false); setOcEditando(null); };
  const aoSalvar    = () => { fecharModal(); carregarOCs(); };

  const handleDeletar = async (id, numero) => {
    if (!confirm(`Deseja realmente excluir a OC #${numero}?`)) return;
    setDeletando(id);
    try {
      await deletarOC(id);
      carregarOCs();
    } catch {
      console.error("Erro ao deletar OC");
    } finally {
      setDeletando(null);
    }
  };

  const totalAndamento = ocs.filter(
    (oc) => !["Finalizado", "Cancelado"].includes(oc.oc_status)
  ).length;

  return (
    <div className="min-h-screen bg-carbon p-6 space-y-8">

      {/* ===== CABEÇALHO ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ordens de Compra</h1>
          <p className="text-carbon-800 text-sm mt-1">
            {totalAndamento} em andamento · {ocs.length} no total
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Recarregar */}
          <button
            onClick={carregarOCs}
            title="Recarregar"
            className="p-2.5 rounded-lg border border-carbon-600 text-carbon-700 hover:bg-carbon-600 hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>

          {/* Nova OC */}
          <button
            onClick={abrirNova}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-carbon-100 text-sm font-semibold transition-all"
            style={{
              background: "#ff9c00",
              boxShadow: "0 0 20px rgba(255,156,0,0.25)",
            }}
          >
            <Plus size={18} />
            Nova OC
          </button>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="flex gap-3">
        {/* Campo de busca */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-carbon-700" />
          <input
            type="text"
            placeholder="Buscar por número, fornecedor, descrição, solicitante..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full border border-carbon-600 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-carbon-700 focus:outline-none focus:border-lime transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", colorScheme: "dark" }}
          />
        </div>
      </div>

      {/* ===== LISTA 1: EM ANDAMENTO ===== */}
      <div>
        <SecaoTitulo
          titulo="Em Andamento"
          subtitulo={`${ocsAndamento.length} ordem${ocsAndamento.length !== 1 ? "s" : ""} ativa${ocsAndamento.length !== 1 ? "s" : ""}`}
          cor="#ff9c00"
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

      {/* ===== LISTA 2: HISTÓRICO COMPLETO ===== */}
      <div>
        <SecaoTitulo
          titulo="Histórico Completo"
          subtitulo={`${ocsHistorico.length} ordem${ocsHistorico.length !== 1 ? "s" : ""} no total · ordenado por data`}
          cor="#b1ff00"
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

      {/* ===== MODAL ===== */}
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