// =============================================================================
// Component: ModalCertificadoDigital.jsx
// Responsabilidade: Modal de criação e edição de certificados digitais
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

const TIPOS_OPCOES   = ['e-CPF A1', 'e-CPF A3', 'e-CNPJ A1', 'e-CNPJ A3', 'SSL/TLS', 'Outro'];
const STATUS_OPCOES  = ['Ativo', 'Vencido', 'Revogado', 'Renovado'];

function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1 font-medium">{label}</label>
      {children}
    </div>
  );
}

export default function ModalCertificadoDigital({ cert, onSucesso, onFechar }) {
  const editando = Boolean(cert);

  const [form, setForm] = useState({
    nome:            '',
    tipo:            'e-CNPJ A1',
    responsavel:     '',
    area:            '',
    descricao:       '',
    data_emissao:    '',
    data_vencimento: '',
    status:          'Ativo',
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]         = useState(null);

  useEffect(() => {
    if (editando) {
      setForm({
        nome:            cert.nome            ?? '',
        tipo:            cert.tipo            ?? 'e-CNPJ A1',
        responsavel:     cert.responsavel     ?? '',
        area:            cert.area            ?? '',
        descricao:       cert.descricao       ?? '',
        data_emissao:    cert.data_emissao    ?? '',
        data_vencimento: cert.data_vencimento ?? '',
        status:          cert.status          ?? 'Ativo',
      });
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    if (!form.nome || !form.tipo || !form.data_vencimento) {
      setErro('Preencha os campos obrigatórios: Nome, Tipo e Data de vencimento.');
      return;
    }

    if (form.data_emissao && form.data_vencimento) {
      if (new Date(form.data_vencimento) < new Date(form.data_emissao)) {
        setErro('A data de vencimento não pode ser anterior à data de emissão.');
        return;
      }
    }

    setSalvando(true);

    try {
      const url    = editando
        ? `${API_URL}/certificados_digitais.php?id=${cert.id}`
        : `${API_URL}/certificados_digitais.php`;
      const method = editando ? 'PUT' : 'POST';

      // Envia como JSON puro (sem arquivo)
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao salvar certificado.');
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
      <div style={estiloModal('520px')} onClick={e => e.stopPropagation()}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4" style={estiloHeader}>
          <h2 className="text-white text-lg font-semibold">
            {editando ? 'Editar Certificado' : 'Novo Certificado Digital'}
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

            {/* Nome */}
            <Campo label="Nome / Razão Social *">
              <input name="nome" value={form.nome} onChange={handleChange}
                     onFocus={aoFocar} onBlur={aoDesfocar}
                     style={{ ...estiloInput }}
                     placeholder="Ex: Empresa LTDA" required />
            </Campo>

            {/* Tipo + Status */}
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Tipo *">
                <select name="tipo" value={form.tipo} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput }} required>
                  {TIPOS_OPCOES.map(t => (
                    <option key={t} value={t}>{t}</option>
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

            {/* Responsável + Área */}
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Responsável">
                <input name="responsavel" value={form.responsavel} onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }}
                       placeholder="Ex: João Silva" />
              </Campo>

              <Campo label="Área / Setor">
                <input name="area" value={form.area} onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }}
                       placeholder="Ex: Financeiro" />
              </Campo>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Data de emissão">
                <input name="data_emissao" type="date" value={form.data_emissao}
                       onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }} />
              </Campo>

              <Campo label="Data de vencimento *">
                <input name="data_vencimento" type="date" value={form.data_vencimento}
                       onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }} required />
              </Campo>
            </div>

            {/* Descrição */}
            <Campo label="Descrição do uso">
              <textarea name="descricao" value={form.descricao} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput, resize: 'vertical', minHeight: '80px' }}
                        placeholder="Ex: Utilizado para assinatura de NF-e e contratos..." />
            </Campo>

            {/* Erro */}
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
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar certificado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}