// =============================================================================
// ARQUIVO: src/hooks/useDashboard.js
// FUNÇÃO: Centraliza toda a lógica e chamadas de dados do Dashboard
// Padrão idêntico ao useOC.js
// =============================================================================

import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost/cyber-stk/backend/api';

// Retorna o primeiro e último dia do mês atual no formato YYYY-MM-DD
function periodoMesAtual() {
  const hoje  = new Date();
  const ano   = hoje.getFullYear();
  const mes   = String(hoje.getMonth() + 1).padStart(2, '0');
  const ultimo = new Date(ano, hoje.getMonth() + 1, 0).getDate();
  return {
    inicio: `${ano}-${mes}-01`,
    fim:    `${ano}-${mes}-${ultimo}`,
  };
}

const DADOS_VAZIOS = {
  ocs_abertas:              0,
  valor_ocs_abertas:        0,
  total_ocs:                0,
  valor_total_ocs:          0,
  total_contas_fixas:       0,
  valor_total_contas_fixas: 0,
  qtd_servicos_ativos:      0,
  valor_servicos_ativos:    0,
  total_incidentes:         0,
  gasto_total_perdas:       0,
  servicos_vencendo:        0,
  certificados_vencendo:    0,
};

export function useDashboard() {
  const periodo = periodoMesAtual();

  const [dados,      setDados]      = useState(DADOS_VAZIOS);
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState(null);
  const [dataInicio, setDataInicio] = useState(periodo.inicio);
  const [dataFim,    setDataFim]    = useState(periodo.fim);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim)    params.append('data_fim',    dataFim);

      const res  = await fetch(`${API_URL}/dashboard.php?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? 'Erro ao carregar dashboard.');
      }

      setDados(json.data);
    } catch (e) {
      setErro(e.message);
      setDados(DADOS_VAZIOS);
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  // Recarrega sempre que as datas mudam
  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    dados,
    loading,
    erro,
    dataInicio,
    dataFim,
    setDataInicio,
    setDataFim,
    recarregar: carregar,
  };
}