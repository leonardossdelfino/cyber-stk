// =============================================
// ARQUIVO: src/services/api.js
// FUNÇÃO: Centraliza toda comunicação com a API PHP
// =============================================

import axios from "axios";

const API_URL = "http://localhost/cyber-stk/backend/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// =============================================
// ORDENS DE COMPRA
// =============================================

export const listarOCs = async () => {
  const response = await api.get("/oc.php");
  return response.data;
};

export const buscarOC = async (id) => {
  const response = await api.get(`/oc.php?id=${id}`);
  return response.data;
};

export const criarOC = async (dados) => {
  const response = await api.post("/oc.php", dados);
  return response.data;
};

export const atualizarOC = async (id, dados) => {
  const response = await api.put(`/oc.php?id=${id}`, dados);
  return response.data;
};

export const deletarOC = async (id) => {
  const response = await api.delete(`/oc.php?id=${id}`);
  return response.data;
};

// =============================================
// CONFIGURAÇÕES SIMPLES
// (categorias, formas_pagamento, status_aprovacao,
//  status_oc, perifericos)
// =============================================

export const listarConfiguracao = async (tabela) => {
  const response = await api.get(`/configuracoes.php?tabela=${tabela}`);
  return response.data;
};

export const criarConfiguracao = async (tabela, dados) => {
  const response = await api.post(`/configuracoes.php?tabela=${tabela}`, dados);
  return response.data;
};

export const atualizarConfiguracao = async (tabela, id, dados) => {
  const response = await api.put(`/configuracoes.php?tabela=${tabela}&id=${id}`, dados);
  return response.data;
};

export const deletarConfiguracao = async (tabela, id) => {
  const response = await api.delete(`/configuracoes.php?tabela=${tabela}&id=${id}`);
  return response.data;
};

// =============================================
// FORNECEDORES
// =============================================

export const listarFornecedores = async () => {
  const response = await api.get("/fornecedores.php");
  return response.data;
};

export const criarFornecedor = async (dados) => {
  const response = await api.post("/fornecedores.php", dados);
  return response.data;
};

export const atualizarFornecedor = async (id, dados) => {
  const response = await api.put(`/fornecedores.php?id=${id}`, dados);
  return response.data;
};

export const deletarFornecedor = async (id) => {
  const response = await api.delete(`/fornecedores.php?id=${id}`);
  return response.data;
};

// =============================================
// NOTA FISCAL / DOCUMENTOS
// =============================================

/** Lista todos os documentos anexados a uma OC */
export const listarDocumentos = async (oc_id) => {
  const response = await api.get(`/notafiscal.php?oc_id=${oc_id}`);
  return response.data;
};

/** Faz upload de um PDF para uma OC — usa FormData pois envia arquivo binário */
export const uploadDocumento = async (oc_id, arquivo) => {
  const formData = new FormData();
  formData.append("oc_id", oc_id);
  formData.append("arquivo", arquivo);
  const response = await api.post("/notafiscal.php", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/** Remove um documento pelo ID */
export const deletarDocumento = async (id) => {
  const response = await api.delete(`/notafiscal.php?id=${id}`);
  return response.data;
};

// =============================================
// CONTAS FIXAS
// =============================================

export const listarContasFixas = async () => {
  const response = await api.get("/contas_fixas.php");
  return response.data;
};

export const buscarContaFixa = async (id) => {
  const response = await api.get(`/contas_fixas.php?id=${id}`);
  return response.data;
};

export const criarContaFixa = async (dados) => {
  const response = await api.post("/contas_fixas.php", dados);
  return response.data;
};

export const atualizarContaFixa = async (id, dados) => {
  const response = await api.put(`/contas_fixas.php?id=${id}`, dados);
  return response.data;
};

export const deletarContaFixa = async (id) => {
  const response = await api.delete(`/contas_fixas.php?id=${id}`);
  return response.data;
};

// =============================================
// SERVIÇOS CONTRATADOS
// Upload usa FormData — PHP não lê multipart em PUT nativo,
// então PUT é simulado via POST + _method=PUT no FormData
// =============================================

export const listarServicos = async () => {
  const response = await api.get("/servicos_contratados.php");
  return response.data;
};

export const buscarServico = async (id) => {
  const response = await api.get(`/servicos_contratados.php?id=${id}`);
  return response.data;
};

/**
 * Cria um novo serviço — usa FormData para suportar upload de contrato
 */
export const criarServico = async (dados, arquivo = null) => {
  const formData = new FormData();
  Object.entries(dados).forEach(([key, value]) => {
    formData.append(key, value ?? "");
  });
  if (arquivo) formData.append("arquivo_contrato", arquivo);
  const response = await api.post("/servicos_contratados.php", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Atualiza serviço — PHP não suporta multipart em PUT nativo,
 * por isso usamos POST com _method=PUT no FormData
 */
export const atualizarServico = async (id, dados, arquivo = null) => {
  const formData = new FormData();
  formData.append("_method", "PUT");
  Object.entries(dados).forEach(([key, value]) => {
    formData.append(key, value ?? "");
  });
  if (arquivo) formData.append("arquivo_contrato", arquivo);
  const response = await api.post(`/servicos_contratados.php?id=${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deletarServico = async (id) => {
  const response = await api.delete(`/servicos_contratados.php?id=${id}`);
  return response.data;
};

// =============================================
// CERTIFICADOS DIGITAIS
// =============================================

export const listarCertificados = async () => {
  const response = await api.get("/certificados_digitais.php");
  return response.data;
};

export const buscarCertificado = async (id) => {
  const response = await api.get(`/certificados_digitais.php?id=${id}`);
  return response.data;
};

export const criarCertificado = async (dados) => {
  const response = await api.post("/certificados_digitais.php", dados);
  return response.data;
};

export const atualizarCertificado = async (id, dados) => {
  const response = await api.put(`/certificados_digitais.php?id=${id}`, dados);
  return response.data;
};

export const deletarCertificado = async (id) => {
  const response = await api.delete(`/certificados_digitais.php?id=${id}`);
  return response.data;
};

// =============================================
// REGISTROS DE PERDAS
// =============================================

export const listarPerdas = async () => {
  const response = await api.get("/registros_perdas.php");
  return response.data;
};

export const buscarPerda = async (id) => {
  const response = await api.get(`/registros_perdas.php?id=${id}`);
  return response.data;
};

export const criarPerda = async (dados) => {
  const response = await api.post("/registros_perdas.php", dados);
  return response.data;
};

export const atualizarPerda = async (id, dados) => {
  const response = await api.put(`/registros_perdas.php?id=${id}`, dados);
  return response.data;
};

export const deletarPerda = async (id) => {
  const response = await api.delete(`/registros_perdas.php?id=${id}`);
  return response.data;
};