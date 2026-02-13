// =============================================
// ARQUIVO: src/services/api.js
// FUNÇÃO: Centraliza toda comunicação com a API PHP
// Todos os componentes que precisarem de dados
// vão importar as funções daqui
// =============================================

import axios from "axios";

// URL base da API — durante desenvolvimento aponta para o backend local
// Na hora do deploy, troca para a URL da Hostinger
const API_URL = "http://localhost/cyber-stk/backend/api";

// Cria uma instância configurada do axios
// Assim não precisamos repetir a URL base em cada chamada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =============================================
// FUNÇÕES DE ORDENS DE COMPRA
// =============================================

// Busca todas as OCs do banco
export const listarOCs = async () => {
  const response = await api.get("/oc.php");
  return response.data;
};

// Busca uma OC específica pelo ID
export const buscarOC = async (id) => {
  const response = await api.get(`/oc.php?id=${id}`);
  return response.data;
};

// Cria uma nova OC
export const criarOC = async (dados) => {
  const response = await api.post("/oc.php", dados);
  return response.data;
};

// Atualiza uma OC existente
export const atualizarOC = async (id, dados) => {
  const response = await api.put(`/oc.php?id=${id}`, dados);
  return response.data;
};

// Deleta uma OC pelo ID
export const deletarOC = async (id) => {
  const response = await api.delete(`/oc.php?id=${id}`);
  return response.data;
};

export default api;