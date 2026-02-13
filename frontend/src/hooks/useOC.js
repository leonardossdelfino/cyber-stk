// =============================================
// ARQUIVO: src/hooks/useOC.js
// FUNÇÃO: Centraliza toda a lógica das OCs
// Separa lógica da interface — boa prática React
// =============================================

import { useState, useEffect } from "react";
import { criarOC, buscarOC, atualizarOC } from "../services/api";

// -----------------------------------------------
// Retorna a data de hoje no formato YYYY-MM-DD
// que é o formato aceito pelo input type="date"
// Usa toLocaleDateString com locale pt-BR invertido
// para evitar problemas de fuso horário com toISOString()
// -----------------------------------------------
const dataDeHoje = () => {
  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const mes  = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia  = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`; // ex: "2026-02-13"
};

// -----------------------------------------------
// Valores iniciais do formulário
// Espelha as colunas do banco de dados
// -----------------------------------------------
const FORM_INICIAL = {
  oc_numero:          "",
  oc_descricao:       "",
  oc_nome_fornecedor: "",
  oc_valor:           "",
  oc_status:          "OC Aberta",
  oc_forma_pagamento: "Boleto",
  oc_aprovacao:       "Aguardando aprovação",
  oc_data_referencia: dataDeHoje(), // ← preenche com hoje automaticamente
  oc_centro_de_custo: "",
  oc_solicitante:     "",
};

// -----------------------------------------------
// Opções dos campos ENUM
// Espelham exatamente os valores do banco MySQL
// -----------------------------------------------
export const OPCOES_STATUS = [
  "OC Aberta",
  "Aguardando faturar",
  "Aguardando cartão",
  "Aguardando financeiro",
  "Aguardando jurídico",
  "Em transporte",
  "Finalizado",
  "Cancelado",
];

export const OPCOES_PAGAMENTO = [
  "Boleto",
  "Cartão de crédito",
  "Transferência",
  "Pix",
  "Outro",
];

export const OPCOES_APROVACAO = [
  "Sim",
  "Não",
  "Aguardando CEO",
  "Aguardando Head",
  "Aguardando aprovação",
];

// =============================================
// HOOK PRINCIPAL
// =============================================
export function useOC(id = null, onSalvo = null) {
  const [form, setForm]       = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [erro, setErro]       = useState(null);
  const [sucesso, setSucesso] = useState(null);

  // Se recebeu um ID, carrega os dados da OC para edição
  // Se não recebeu ID (nova OC), mantém o FORM_INICIAL com a data de hoje
  useEffect(() => {
    if (id) {
      carregarOC(id);
    } else {
      // Garante que ao reabrir o modal de nova OC a data seja sempre hoje
      setForm({ ...FORM_INICIAL, oc_data_referencia: dataDeHoje() });
    }
  }, [id]);

  // -----------------------------------------------
  // Carrega uma OC existente pelo ID (modo edição)
  // -----------------------------------------------
  const carregarOC = async (ocId) => {
    setLoading(true);
    setErro(null);
    try {
      const resultado = await buscarOC(ocId);
      if (resultado.success) {
        setForm(resultado.data);
      } else {
        setErro("OC não encontrada.");
      }
    } catch {
      setErro("Erro ao carregar OC. Verifique a conexão com a API.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // Atualiza um campo específico do formulário
  // -----------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpa mensagens de erro/sucesso ao digitar
    setErro(null);
    setSucesso(null);
  };

  // -----------------------------------------------
  // Valida apenas os campos obrigatórios antes de salvar
  // Obrigatórios: número, descrição, fornecedor, valor,
  //               forma de pagamento, data de abertura
  // Opcionais:    solicitante, centro de custo, status, aprovação
  // -----------------------------------------------
  const validar = () => {
    if (!form.oc_numero.trim())          return "Número da OC é obrigatório.";
    if (!form.oc_descricao.trim())       return "Descrição é obrigatória.";
    if (!form.oc_nome_fornecedor.trim()) return "Nome do fornecedor é obrigatório.";
    if (!form.oc_valor)                  return "Valor é obrigatório.";
    if (isNaN(form.oc_valor))            return "Valor deve ser um número.";
    if (!form.oc_forma_pagamento)        return "Forma de pagamento é obrigatória.";
    if (!form.oc_data_referencia)        return "Data de abertura é obrigatória.";
    return null; // null = sem erros
  };

  // -----------------------------------------------
  // Submete o formulário — cria ou atualiza a OC
  // -----------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSaving(true);
    setErro(null);
    setSucesso(null);

    try {
      const resultado = id
        ? await atualizarOC(id, form)
        : await criarOC(form);

      if (resultado.success) {
        setSucesso(id ? "OC atualizada com sucesso!" : "OC criada com sucesso!");
        setTimeout(() => {
          if (onSalvo) onSalvo();
        }, 800);
      } else {
        setErro(resultado.message || "Erro ao salvar OC.");
      }
    } catch (err) {
      // Mostra o erro real no console para facilitar o debug
      console.error("Erro ao salvar OC:", err);
      setErro("Erro de conexão com a API. Verifique o backend.");
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    loading,
    saving,
    erro,
    sucesso,
    handleChange,
    handleSubmit,
  };
}