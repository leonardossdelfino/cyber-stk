// =============================================
// ARQUIVO: src/pages/FormularioOC.jsx
// FUNÇÃO: Formulário de criação e edição de OC
// Detecta automaticamente se é criação (sem ID)
// ou edição (com ID na URL)
// =============================================

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  useOC,
  OPCOES_STATUS,
  OPCOES_PAGAMENTO,
  OPCOES_APROVACAO,
} from "../hooks/useOC";

function FormularioOC() {
  // Pega o ID da URL se existir (modo edição)
  const { id }     = useParams();
  const navigate   = useNavigate();
  const {
    form,
    loading,
    saving,
    erro,
    sucesso,
    handleChange,
    handleSubmit,
  } = useOC(id);

  // Exibe loader enquanto carrega dados para edição
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-onyx">
        <Loader2 className="animate-spin text-amaranth" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onyx p-6">

      {/* ===== CABEÇALHO ===== */}
      <div className="flex items-center gap-4 mb-8">
        {/* Botão voltar */}
        <button
          onClick={() => navigate("/ordens")}
          className="flex items-center gap-2 text-onyx-900 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-white">
            {id ? "Editar Ordem de Compra" : "Nova Ordem de Compra"}
          </h1>
          <p className="text-onyx-900 text-sm mt-1">
            {id ? `Editando OC #${id}` : "Preencha os dados da nova OC"}
          </p>
        </div>
      </div>

      {/* ===== MENSAGENS DE FEEDBACK ===== */}
      {erro && (
        <div className="mb-6 p-4 bg-tomato-100 border border-tomato text-tomato rounded-lg text-sm">
          ⚠️ {erro}
        </div>
      )}
      {sucesso && (
        <div className="mb-6 p-4 bg-pacific_blue-100 border border-pacific_blue text-pacific_blue rounded-lg text-sm">
          ✅ {sucesso}
        </div>
      )}

      {/* ===== FORMULÁRIO ===== */}
      <form onSubmit={handleSubmit}>
        <div className="bg-onyx border border-onyx-600 rounded-xl p-6 space-y-6">

          {/* --- SEÇÃO 1: Identificação --- */}
          <div>
            <h2 className="text-sm font-semibold text-amaranth uppercase tracking-wider mb-4">
              Identificação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Número da OC */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Número da OC <span className="text-amaranth">*</span>
                </label>
                <input
                  type="text"
                  name="oc_numero"
                  value={form.oc_numero}
                  onChange={handleChange}
                  placeholder="Ex: 1284065821"
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white placeholder-onyx-700 focus:outline-none focus:border-amaranth transition-colors"
                />
              </div>

              {/* Fornecedor */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Nome do Fornecedor <span className="text-amaranth">*</span>
                </label>
                <input
                  type="text"
                  name="oc_nome_fornecedor"
                  value={form.oc_nome_fornecedor}
                  onChange={handleChange}
                  placeholder="Ex: Apple, Worldzone..."
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white placeholder-onyx-700 focus:outline-none focus:border-amaranth transition-colors"
                />
              </div>

              {/* Descrição — ocupa as duas colunas */}
              <div className="md:col-span-2">
                <label className="block text-sm text-onyx-900 mb-1">
                  Descrição <span className="text-amaranth">*</span>
                </label>
                <textarea
                  name="oc_descricao"
                  value={form.oc_descricao}
                  onChange={handleChange}
                  placeholder="Descreva o que está sendo comprado..."
                  rows={3}
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white placeholder-onyx-700 focus:outline-none focus:border-amaranth transition-colors resize-none"
                />
              </div>

            </div>
          </div>

          {/* --- SEÇÃO 2: Valores e Pagamento --- */}
          <div>
            <h2 className="text-sm font-semibold text-amaranth uppercase tracking-wider mb-4">
              Valores e Pagamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Valor */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Valor (R$) <span className="text-amaranth">*</span>
                </label>
                <input
                  type="number"
                  name="oc_valor"
                  value={form.oc_valor}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white placeholder-onyx-700 focus:outline-none focus:border-amaranth transition-colors"
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Forma de Pagamento <span className="text-amaranth">*</span>
                </label>
                <select
                  name="oc_forma_pagamento"
                  value={form.oc_forma_pagamento}
                  onChange={handleChange}
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amaranth transition-colors"
                >
                  {OPCOES_PAGAMENTO.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              {/* Data de Referência */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Data de Referência <span className="text-amaranth">*</span>
                </label>
                <input
                  type="date"
                  name="oc_data_referencia"
                  value={form.oc_data_referencia}
                  onChange={handleChange}
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amaranth transition-colors"
                />
              </div>

            </div>
          </div>

          {/* --- SEÇÃO 3: Status e Aprovação --- */}
          <div>
            <h2 className="text-sm font-semibold text-amaranth uppercase tracking-wider mb-4">
              Status e Aprovação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Status */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Status <span className="text-amaranth">*</span>
                </label>
                <select
                  name="oc_status"
                  value={form.oc_status}
                  onChange={handleChange}
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amaranth transition-colors"
                >
                  {OPCOES_STATUS.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              {/* Aprovação */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Aprovação <span className="text-amaranth">*</span>
                </label>
                <select
                  name="oc_aprovacao"
                  value={form.oc_aprovacao}
                  onChange={handleChange}
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amaranth transition-colors"
                >
                  {OPCOES_APROVACAO.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* --- SEÇÃO 4: Responsável --- */}
          <div>
            <h2 className="text-sm font-semibold text-amaranth uppercase tracking-wider mb-4">
              Responsável
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Centro de Custo */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Centro de Custo <span className="text-amaranth">*</span>
                </label>
                <input
                  type="text"
                  name="oc_centro_de_custo"
                  value={form.oc_centro_de_custo}
                  onChange={handleChange}
                  placeholder="Ex: TI, Marketing, RH..."
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white placeholder-onyx-700 focus:outline-none focus:border-amaranth transition-colors"
                />
              </div>

              {/* Solicitante */}
              <div>
                <label className="block text-sm text-onyx-900 mb-1">
                  Solicitante <span className="text-amaranth">*</span>
                </label>
                <input
                  type="text"
                  name="oc_solicitante"
                  value={form.oc_solicitante}
                  onChange={handleChange}
                  placeholder="Nome de quem solicitou"
                  className="w-full bg-onyx-400 border border-onyx-600 rounded-lg px-4 py-2.5 text-white placeholder-onyx-700 focus:outline-none focus:border-amaranth transition-colors"
                />
              </div>

            </div>
          </div>

        </div>

        {/* ===== BOTÕES DE AÇÃO ===== */}
        <div className="flex items-center justify-end gap-3 mt-6">

          {/* Cancelar */}
          <button
            type="button"
            onClick={() => navigate("/ordens")}
            className="px-6 py-2.5 rounded-lg border border-onyx-600 text-onyx-900 hover:bg-onyx-600 hover:text-white transition-colors text-sm font-medium"
          >
            Cancelar
          </button>

          {/* Salvar */}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amaranth hover:bg-amaranth-400 text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Salvando..." : "Salvar OC"}
          </button>

        </div>

      </form>
    </div>
  );
}

export default FormularioOC;