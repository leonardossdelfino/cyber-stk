// =============================================================================
// Component: ModalServicoContratado.jsx
// Responsabilidade: Modal de criação e edição de serviços contratados
// =============================================================================

import { useState, useEffect } from 'react';
import {
  estiloOverlay,
  estiloModal,
  estiloHeader,
  estiloFooter,
  estiloBtnFechar,
  estiloBtnCancelar,
  estiloBtnSalvar,
  estiloErro,
} from '../styles/modalStyles';
import { estiloInput, aoFocar, aoDesfocar } from '../styles/inputStyles';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost/cyber-stk/backend/api';

const STATUS_OPCOES = ['Ativa', 'Inativa', 'Encerrada', 'Em Renovação', 'Cancelada'];

function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1 font-medium">{label}</label>
      {children}
    </div>
  );
}

export default function ModalServicoContratado({ servico, onSucesso, onFechar }) {
  const editando = Boolean(servico);

  const [form, setForm] = useState({
    nome:            '',
    fornecedor:      '',
    categoria:       '',
    forma_pagamento: '',
    descricao:       '',
    valor_total:     '',
    data_inicio:     '',
    data_termino:    '',
    status:          'Ativa',
  });

  const [arquivo, setArquivo]                 = useState(null);
  const [fornecedores, setFornecedores]       = useState([]);
  const [categorias, setCategorias]           = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [salvando, setSalvando]               = useState(false);
  const [erro, setErro]                       = useState(null);

  useEffect(() => {
    carregarConfiguracoes();
    if (editando) {
      setForm({
        nome:            servico.nome            ?? '',
        fornecedor:      servico.fornecedor      ?? '',
        categoria:       servico.categoria       ?? '',
        forma_pagamento: servico.forma_pagamento ?? '',
        descricao:       servico.descricao       ?? '',
        valor_total:     servico.valor_total     ?? '',
        data_inicio:     servico.data_inicio     ?? '',
        data_termino:    servico.data_termino    ?? '',
        status:          servico.status          ?? 'Ativa',
      });
    }
  }, []);

  async function carregarConfiguracoes() {
    try {
      const [resForn, resCat, resPag] = await Promise.all([
        fetch(`${API_URL}/configuracoes.php?tabela=fornecedores`),
        fetch(`${API_URL}/configuracoes.php?tabela=categorias`),
        fetch(`${API_URL}/configuracoes.php?tabela=formas_pagamento`),
      ]);

      const fornData = await resForn.json();
      const catData  = await resCat.json();
      const pagData  = await resPag.json();

      if (!resForn.ok) throw new Error(fornData.erro ?? 'Erro fornecedores');
      if (!resCat.ok)  throw new Error(catData.erro  ?? 'Erro categorias');
      if (!resPag.ok)  throw new Error(pagData.erro  ?? 'Erro formas de pagamento');

      setFornecedores(Array.isArray(fornData) ? fornData : []);
      setCategorias(Array.isArray(catData)    ? catData  : []);
      setFormasPagamento(Array.isArray(pagData) ? pagData : []);
    } catch (e) {
      setErro(`Erro ao carregar configurações: ${e.message}`);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    if (!form.nome || !form.fornecedor || !form.data_inicio || !form.data_termino) {
      setErro('Preencha os campos obrigatórios: Nome, Fornecedor, Data de início e Data de término.');
      return;
    }

    if (new Date(form.data_termino) < new Date(form.data_inicio)) {
      setErro('A data de término não pode ser anterior à data de início.');
      return;
    }

    setSalvando(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value ?? '');
      });
      if (arquivo) formData.append('arquivo_contrato', arquivo);

      // PHP não lê multipart/form-data em PUT nativamente
      // Solução: sempre POST, com _method para indicar a intenção
      if (editando) formData.append('_method', 'PUT');

      const url = editando
        ? `${API_URL}/servicos_contratados.php?id=${servico.id}`
        : `${API_URL}/servicos_contratados.php`;

      const res  = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao salvar serviço.');
        return;
      }

      onSucesso();
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={estiloOverlay} onClick={onFechar}>
      <div style={estiloModal('560px')} onClick={e => e.stopPropagation()}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4" style={estiloHeader}>
          <h2 className="text-white text-lg font-semibold">
            {editando ? 'Editar Serviço' : 'Novo Serviço Contratado'}
          </h2>
          <button onClick={onFechar}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm"
                  style={estiloBtnFechar}>
            ✕
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 flex flex-col gap-4">

            <Campo label="Nome do serviço *">
              <input name="nome" value={form.nome} onChange={handleChange}
                     onFocus={aoFocar} onBlur={aoDesfocar}
                     style={{ ...estiloInput }}
                     placeholder="Ex: Suporte técnico mensal" required />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Fornecedor *">
                <select name="fornecedor" value={form.fornecedor} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput }} required>
                  <option value="">Selecione</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.razao_social}>{f.razao_social}</option>
                  ))}
                </select>
              </Campo>

              <Campo label="Categoria">
                <select name="categoria" value={form.categoria} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput }}>
                  <option value="">Selecione</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Forma de pagamento">
                <select name="forma_pagamento" value={form.forma_pagamento} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput }}>
                  <option value="">Selecione</option>
                  {formasPagamento.map(fp => (
                    <option key={fp.id} value={fp.nome}>{fp.nome}</option>
                  ))}
                </select>
              </Campo>

              <Campo label="Status">
                <select name="status" value={form.status} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput }}>
                  {STATUS_OPCOES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo label="Valor total do contrato (R$)">
              <input name="valor_total" type="number" min="0" step="0.01"
                     value={form.valor_total} onChange={handleChange}
                     onFocus={aoFocar} onBlur={aoDesfocar}
                     style={{ ...estiloInput }}
                     placeholder="0,00" />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Data de início *">
                <input name="data_inicio" type="date" value={form.data_inicio}
                       onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }} required />
              </Campo>

              <Campo label="Data de término *">
                <input name="data_termino" type="date" value={form.data_termino}
                       onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }} required />
              </Campo>
            </div>

            <Campo label="Descrição">
              <textarea name="descricao" value={form.descricao} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput, resize: 'vertical', minHeight: '80px' }}
                        placeholder="Detalhes sobre o serviço contratado..." />
            </Campo>

            <Campo label={editando && servico.arquivo_contrato
              ? 'Substituir contrato (opcional)'
              : 'Anexar contrato (opcional)'}>
              {editando && servico.arquivo_contrato && (
                <p className="text-xs text-blue-400 mb-2">
                  📎 Arquivo atual: {servico.arquivo_contrato}
                </p>
              )}
              <input type="file" accept=".pdf,.doc,.docx"
                     onChange={e => setArquivo(e.target.files[0] ?? null)}
                     style={{ ...estiloInput, cursor: 'pointer' }} />
              <p className="text-xs text-gray-500 mt-1">PDF, DOC ou DOCX · Máximo 10MB</p>
            </Campo>

            {erro && (
              <div className="text-sm rounded-lg px-3 py-2" style={estiloErro}>
                {erro}
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="flex gap-3 justify-end px-6 py-4" style={estiloFooter}>
            <button type="button" onClick={onFechar}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={estiloBtnCancelar}>
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
                    className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={estiloBtnSalvar(salvando)}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}