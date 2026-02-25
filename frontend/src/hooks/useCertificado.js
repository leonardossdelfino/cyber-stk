// =============================================
// ARQUIVO: src/hooks/useCertificado.js
// FUNÇÃO: Centraliza lógica de dados de CertificadosDigitais
// Padrão idêntico ao useServico.js e useContaFixa.js
// =============================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { listarCertificados, deletarCertificado } from "../services/api";

export function useCertificado() {
  const [certificados, setCertificados] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [deletando,    setDeletando]    = useState(null);
  const [erro,         setErro]         = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const carregarCertificados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await listarCertificados();
      // certificados_digitais.php retorna { success, data }
      if (res?.success) {
        setCertificados(Array.isArray(res.data) ? res.data : []);
      } else {
        setErro("Erro ao carregar certificados digitais.");
        setCertificados([]);
      }
    } catch {
      setErro("Erro de conexão com a API.");
      setCertificados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarCertificados(); }, [carregarCertificados]);

  const handleDeletar = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este certificado?")) return;
    setDeletando(id);
    try {
      await deletarCertificado(id);
      await carregarCertificados();
    } finally {
      setDeletando(null);
    }
  };

  // useMemo — só recalcula quando certificados ou filtroStatus mudam
  const certificadosFiltrados = useMemo(() =>
    filtroStatus === "Todos"
      ? certificados
      : certificados.filter((c) => c.status === filtroStatus),
    [certificados, filtroStatus]
  );

  // Certificados com vencimento em até 60 dias (status Ativo)
  const totalAlertas = useMemo(() =>
    certificados.filter((c) => {
      if (c.status !== "Ativo") return false;
      const hoje     = new Date(); hoje.setHours(0, 0, 0, 0);
      const vencimento = new Date(c.data_vencimento); vencimento.setHours(0, 0, 0, 0);
      const dias     = Math.round((vencimento - hoje) / (1000 * 60 * 60 * 24));
      return dias <= 60;
    }).length,
    [certificados]
  );

  return {
    certificados,
    loading,
    deletando,
    erro,
    filtroStatus,
    setFiltroStatus,
    carregarCertificados,
    handleDeletar,
    certificadosFiltrados,
    totalAlertas,
  };
}