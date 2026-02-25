// =============================================
// ARQUIVO: src/hooks/usePerda.js
// FUNÇÃO: Centraliza lógica de dados de RegistrosPerdas
// Padrão idêntico ao useCertificado.js e useServico.js
// =============================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { listarPerdas, deletarPerda } from "../services/api";

export function usePerda() {
  const [perdas,      setPerdas]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deletando,   setDeletando]   = useState(null);
  const [erro,        setErro]        = useState(null);
  const [filtroTipo,  setFiltroTipo]  = useState("Todos");

  const carregarPerdas = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await listarPerdas();
      // registros_perdas.php retorna { success, data }
      if (res?.success) {
        setPerdas(Array.isArray(res.data) ? res.data : []);
      } else {
        setErro("Erro ao carregar registros de perdas.");
        setPerdas([]);
      }
    } catch {
      setErro("Erro de conexão com a API.");
      setPerdas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarPerdas(); }, [carregarPerdas]);

  const handleDeletar = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este registro?")) return;
    setDeletando(id);
    try {
      await deletarPerda(id);
      await carregarPerdas();
    } finally {
      setDeletando(null);
    }
  };

  // useMemo — só recalcula quando perdas ou filtroTipo mudam
  const perdasFiltradas = useMemo(() =>
    filtroTipo === "Todos"
      ? perdas
      : perdas.filter((p) => p.tipo === filtroTipo),
    [perdas, filtroTipo]
  );

  // Total de custo de todos os registros
  const custoTotal = useMemo(() =>
    perdas.reduce((acc, p) => acc + Number(p.custo ?? 0), 0),
    [perdas]
  );

  // Lista de tipos únicos para os filtros dinâmicos
  const tiposUnicos = useMemo(() => {
    const set = new Set(perdas.map((p) => p.tipo).filter(Boolean));
    return Array.from(set).sort();
  }, [perdas]);

  return {
    perdas,
    loading,
    deletando,
    erro,
    filtroTipo,
    setFiltroTipo,
    carregarPerdas,
    handleDeletar,
    perdasFiltradas,
    custoTotal,
    tiposUnicos,
  };
}