// =============================================
// ARQUIVO: src/services/api.js
// FUNÇÃO: Centraliza toda comunicação com a API PHP
// =============================================

import axios from "axios";

// URL da API via variável de ambiente
// Desenvolvimento: defina VITE_API_URL no arquivo .env
// Produção:        defina VITE_API_URL no painel da Hostinger
// Fallback local para não quebrar sem .env configurado
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost/cyber-stk/backend/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10s — evita requisições travadas indefinidamente
});

// Interceptor global de resposta
// Trata erros de rede antes de chegarem nos componentes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Sem resposta = servidor offline ou problema de rede
      return Promise.reject(new Error("Sem conexão com o servidor."));
    }
    // Repassa o erro HTTP normalmente para o componente tratar
    return Promise.reject(error);
  }
);

// =============================================
// FUNÇÕES DE ORDENS DE COMPRA
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

export default api;
