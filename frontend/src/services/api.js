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

export const buscarFornecedoresPorNome = async (termo) => {
  const response = await api.get(`/fornecedores.php?busca=${encodeURIComponent(termo)}`);
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

/**
 * Lista todos os documentos anexados a uma OC
 */
export const listarDocumentos = async (oc_id) => {
  const response = await api.get(`/notafiscal.php?oc_id=${oc_id}`);
  return response.data;
};

/**
 * Faz upload de um PDF para uma OC
 * Usa FormData pois envia arquivo binário
 */
export const uploadDocumento = async (oc_id, arquivo) => {
  const formData = new FormData();
  formData.append('oc_id', oc_id);
  formData.append('arquivo', arquivo);

  const response = await api.post('/notafiscal.php', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Remove um documento pelo ID
 */
export const deletarDocumento = async (id) => {
  const response = await api.delete(`/notafiscal.php?id=${id}`);
  return response.data;
};