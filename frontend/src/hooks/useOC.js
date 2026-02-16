// =============================================
// ARQUIVO: src/hooks/useOC.js
// FUNÇÃO: Centraliza toda a lógica das OCs
// Opções de status, pagamento e aprovação
// são carregadas do banco de dados
// =============================================

import { useState, useEffect, useRef } from "react";
import {
  criarOC,
  buscarOC,
  atualizarOC,
  listarConfiguracao,
  listarFornecedores,
} from "../services/api";

// ─────────────────────────────────────────────
// Retorna a data de hoje no formato YYYY-MM-DD
// ─────────────────────────────────────────────
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
  oc_status:          "",
  oc_forma_pagamento: "",
  oc_aprovacao:       "",
  oc_data_referencia: "",
  oc_centro_de_custo: "",
  oc_solicitante:     "",
};

// =============================================
// HOOK PRINCIPAL
// =============================================
export function useOC(id = null, onSalvo = null) {
  const [form, setForm]       = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [erro, setErro]       = useState(null);
  const [sucesso, setSucesso] = useState(null);

  // Opções carregadas do banco
  const [opcoesStatus,    setOpcoesStatus]    = useState([]);
  const [opcoesPagamento, setOpcoesPagamento] = useState([]);
  const [opcoesAprovacao, setOpcoesAprovacao] = useState([]);
  const [fornecedores,    setFornecedores]    = useState([]);

  const timerRef = useRef(null);

  // ─────────────────────────────────────────
  // Carrega tudo em um único useEffect
  // Evita condição de corrida entre os dois
  // ─────────────────────────────────────────
  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      setErro(null);

      try {
        // 1. Carrega opções do banco e OC (se edição) em paralelo
        const promises = [
          listarConfiguracao("status_oc"),
          listarConfiguracao("formas_pagamento"),
          listarConfiguracao("status_aprovacao"),
          listarFornecedores(),
        ];

        if (id) promises.push(buscarOC(id));

        const resultados = await Promise.all(promises);

        const [status, pagamento, aprovacao, forn, ocResult] = resultados;

        const nomesStatus    = status.map((s) => s.nome);
        const nomesPagamento = pagamento.map((p) => p.nome);
        const nomesAprovacao = aprovacao.map((a) => a.nome);

        setOpcoesStatus(nomesStatus);
        setOpcoesPagamento(nomesPagamento);
        setOpcoesAprovacao(nomesAprovacao);
        setFornecedores(forn);

        if (id) {
          // Modo edição — preenche com dados da OC
          if (ocResult?.success) {
            setForm(ocResult.data);
          } else {
            setErro("OC não encontrada.");
          }
        } else {
          // Modo criação — preenche defaults com primeiro item de cada lista
          setForm({
            ...FORM_INICIAL,
            oc_data_referencia: dataDeHoje(),
            oc_status:          nomesStatus[0]    ?? "",
            oc_forma_pagamento: nomesPagamento[0] ?? "",
            oc_aprovacao:       nomesAprovacao[0] ?? "",
          });
        }
      } catch (err) {
        console.error("Erro ao inicializar formulário:", err);
        setErro("Erro ao carregar dados. Verifique a conexão com a API.");
      } finally {
        setLoading(false);
      }
    };

    inicializar();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────
  // Atualiza campo no estado
  // ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro(null);
    setSucesso(null);
  };

  // Atualiza campo diretamente por nome/valor (autocomplete)
  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro(null);
    setSucesso(null);
  };

  // ─────────────────────────────────────────
  // Validação
  // ─────────────────────────────────────────
  const validar = () => {
    if (!form.oc_numero.trim())          return "Número da OC é obrigatório.";
    if (!form.oc_descricao.trim())       return "Descrição é obrigatória.";
    if (!form.oc_nome_fornecedor.trim()) return "Nome do fornecedor é obrigatório.";
    if (!form.oc_valor)                  return "Valor é obrigatório.";
    if (isNaN(Number(form.oc_valor)))    return "Valor deve ser um número válido.";
    if (Number(form.oc_valor) < 0)       return "Valor não pode ser negativo.";
    if (!form.oc_forma_pagamento)        return "Forma de pagamento é obrigatória.";
    if (!form.oc_data_referencia)        return "Data de abertura é obrigatória.";
    return null;
  };

  // ─────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────
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

  return {
    form,
    loading,
    saving,
    erro,
    sucesso,
    handleChange,
    handleSubmit,
    setField,
    opcoesStatus,
    opcoesPagamento,
    opcoesAprovacao,
    fornecedores,
  };
}