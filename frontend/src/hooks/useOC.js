// src/hooks/useOC.js
import { useState, useEffect } from "react";
import { criarOC, buscarOC, atualizarOC } from "../services/api";

const FORM_INICIAL = {
  oc_numero:          "",
  oc_descricao:       "",
  oc_nome_fornecedor: "",
  oc_valor:           "",
  oc_status:          "OC Aberta",
  oc_forma_pagamento: "Boleto",
  oc_aprovacao:       "Aguardando aprovação",
  oc_data_referencia: "",
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

export function useOC(id = null, onSalvo = null) {
  const [form, setForm]       = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [erro, setErro]       = useState(null);
  const [sucesso, setSucesso] = useState(null);

  useEffect(() => {
    if (id) carregarOC(id);
  }, [id]);

  const carregarOC = async (id) => {
    setLoading(true);
    setErro(null);
    try {
      const resultado = await buscarOC(id);
      if (resultado.success) {
        setForm(resultado.data);
      } else {
        setErro("OC não encontrada.");
      }
    } catch {
      setErro("Erro ao carregar OC.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro(null);
    setSucesso(null);
  };

  const validar = () => {
    if (!form.oc_numero.trim())          return "Número da OC é obrigatório.";
    if (!form.oc_descricao.trim())       return "Descrição é obrigatória.";
    if (!form.oc_nome_fornecedor.trim()) return "Nome do fornecedor é obrigatório.";
    if (!form.oc_valor)                  return "Valor é obrigatório.";
    if (isNaN(form.oc_valor))            return "Valor deve ser um número.";
    if (!form.oc_data_referencia)        return "Data de referência é obrigatória.";
    if (!form.oc_centro_de_custo.trim()) return "Centro de custo é obrigatório.";
    if (!form.oc_solicitante.trim())     return "Solicitante é obrigatório.";
    return null;
  };

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
        // Chama o callback após 1 segundo — fecha o modal e recarrega a lista
        setTimeout(() => {
          if (onSalvo) onSalvo();
        }, 1000);
      } else {
        setErro(resultado.message || "Erro ao salvar OC.");
      }
    } catch {
      setErro("Erro de conexão com a API.");
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