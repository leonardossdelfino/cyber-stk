// =============================================
// ARQUIVO: src/hooks/useServico.js
// FUNÇÃO: Centraliza lógica de dados de ServicosContratados
// Padrão idêntico ao useContaFixa.js
// =============================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { listarServicos, deletarServico } from "../services/api";

export function useServico() {
  const [servicos,     setServicos]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [deletando,    setDeletando]    = useState(null);
  const [erro,         setErro]         = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const carregarServicos = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await listarServicos();
      // servicos_contratados.php retorna { success, data }
      if (res?.success) {
        setServicos(Array.isArray(res.data) ? res.data : []);
      } else {
        setErro("Erro ao carregar serviços contratados.");
        setServicos([]);
      }
    } catch {
      setErro("Erro de conexão com a API.");
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarServicos(); }, [carregarServicos]);

  const handleDeletar = async (servico) => {
    if (!window.confirm(
      `Tem certeza que deseja excluir "${servico.nome}"?` +
      (servico.arquivo_contrato ? "\nO arquivo de contrato anexado também será removido." : "")
    )) return;

    setDeletando(servico.id);
    try {
      await deletarServico(servico.id);
      await carregarServicos();
    } finally {
      setDeletando(null);
    }
  };

  // useMemo — só recalcula quando servicos ou filtroStatus mudam
  const servicosFiltrados = useMemo(() =>
    filtroStatus === "Todos"
      ? servicos
      : servicos.filter((s) => s.status === filtroStatus),
    [servicos, filtroStatus]
  );

  const valorTotalAtivos = useMemo(() =>
    servicos
      .filter((s) => ["Ativa", "Em Renovação"].includes(s.status))
      .reduce((acc, s) => acc + Number(s.valor_total), 0),
    [servicos]
  );

  const totalAlertas = useMemo(() =>
    servicos.filter((s) => {
      if (!["Ativa", "Em Renovação"].includes(s.status)) return false;
      const hoje    = new Date(); hoje.setHours(0, 0, 0, 0);
      const termino = new Date(s.data_termino); termino.setHours(0, 0, 0, 0);
      const dias    = Math.round((termino - hoje) / (1000 * 60 * 60 * 24));
      return dias <= 30;
    }).length,
    [servicos]
  );

  return {
    servicos,
    loading,
    deletando,
    erro,
    filtroStatus,
    setFiltroStatus,
    carregarServicos,
    handleDeletar,
    servicosFiltrados,
    valorTotalAtivos,
    totalAlertas,
  };
}