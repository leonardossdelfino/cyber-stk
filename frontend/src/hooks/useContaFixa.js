// =============================================
// ARQUIVO: src/hooks/useContaFixa.js
// FUNÇÃO: Centraliza lógica de dados de ContasFixas
// Padrão idêntico ao useOC.js
// =============================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { listarContasFixas, deletarContaFixa } from "../services/api";

export function useContaFixa() {
  const [contas,       setContas]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [deletando,    setDeletando]    = useState(null);
  const [erro,         setErro]         = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const carregarContas = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await listarContasFixas();
      // contas_fixas.php agora retorna { success, data }
      if (res?.success) {
        setContas(Array.isArray(res.data) ? res.data : []);
      } else {
        setErro("Erro ao carregar contas fixas.");
        setContas([]);
      }
    } catch {
      setErro("Erro de conexão com a API.");
      setContas([]);
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

  // useMemo — só recalcula quando contas ou filtroStatus mudam
  const contasFiltradas = useMemo(() =>
    filtroStatus === "Todos"
      ? contas
      : contas.filter((c) => c.status === filtroStatus),
    [contas, filtroStatus]
  );

  const totalAtivas = useMemo(() =>
    contas
      .filter((c) => c.status === "Ativa")
      .reduce((acc, c) => acc + Number(c.valor), 0),
    [contas]
  );

  return {
    contas,
    loading,
    deletando,
    erro,
    filtroStatus,
    setFiltroStatus,
    carregarContas,
    handleDeletar,
    contasFiltradas,
    totalAtivas,
  };
}