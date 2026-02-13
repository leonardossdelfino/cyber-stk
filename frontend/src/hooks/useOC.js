// =============================================
// ARQUIVO: src/hooks/useOC.js
// FUNÇÃO: Centraliza toda a lógica das OCs
// Separa lógica da interface — boa prática React
// =============================================

import { useState, useEffect, useRef } from "react";
import { criarOC, buscarOC, atualizarOC } from "../services/api";

// -----------------------------------------------
// Retorna a data de hoje no formato YYYY-MM-DD
// Usa getFullYear/getMonth/getDate para evitar
// problemas de fuso horário do toISOString()
// -----------------------------------------------
const dataDeHoje = () => {
  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const mes  = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia  = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const FORM_INICIAL = {
  oc_numero:          "",
  oc_descricao:       "",
  oc_nome_fornecedor: "",
  oc_valor:           "",
  oc_status:          "OC Aberta",
  oc_forma_pagamento: "Boleto",
  oc_aprovacao:       "Aguardando aprovação",
  oc_data_referencia: "", // preenchido dinamicamente no useEffect
  oc_centro_de_custo: "",
  oc_solicitante:     "",
};

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

  // Ref para cancelar o setTimeout se o componente desmontar
  const timerRef = useRef(null);

  useEffect(() => {
    if (id) {
      carregarOC(id);
    } else {
      // Calcula a data no momento em que o hook é montado (não no módulo)
      setForm({ ...FORM_INICIAL, oc_data_referencia: dataDeHoje() });
    }

    // Limpa o timer pendente ao desmontar
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  // carregarOC é estável (definida fora do fluxo de estado) — safe ignorar

  // -----------------------------------------------
  // Carrega OC existente para edição
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
  // Atualiza campo no estado
  // -----------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro(null);
    setSucesso(null);
  };

  // -----------------------------------------------
  // Validação — apenas campos obrigatórios
  // Obrigatórios: número, descrição, fornecedor, valor, pagamento, data
  // Opcionais:    solicitante, centro de custo, status, aprovação
  // -----------------------------------------------
  const validar = () => {
    if (!form.oc_numero.trim())          return "Número da OC é obrigatório.";
    if (!form.oc_descricao.trim())       return "Descrição é obrigatória.";
    if (!form.oc_nome_fornecedor.trim()) return "Nome do fornecedor é obrigatório.";
    if (!form.oc_valor)                  return "Valor é obrigatório.";
    // Number() converte string vazia para 0, isNaN("") seria false sem isso
    if (isNaN(Number(form.oc_valor)))    return "Valor deve ser um número válido.";
    if (Number(form.oc_valor) < 0)       return "Valor não pode ser negativo.";
    if (!form.oc_forma_pagamento)        return "Forma de pagamento é obrigatória.";
    if (!form.oc_data_referencia)        return "Data de abertura é obrigatória.";
    return null;
  };

  // -----------------------------------------------
  // Submete o formulário — cria ou atualiza
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
        // Timer com ref para poder cancelar se o componente desmontar
        timerRef.current = setTimeout(() => {
          if (onSalvo) onSalvo();
        }, 800);
      } else {
        setErro(resultado.message || "Erro ao salvar OC.");
      }
    } catch (err) {
      console.error("Erro ao salvar OC:", err);
      setErro(err.message || "Erro de conexão com a API. Verifique o backend.");
    } finally {
      setSaving(false);
    }
  };

  return { form, loading, saving, erro, sucesso, handleChange, handleSubmit };
}
