// =============================================================================
// Component: ModalRegistroPerda.jsx
// Responsabilidade: Modal de criação e edição de registros de perdas e mau uso
// Tipos de incidente e ações puxados do banco de dados via configurações
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

function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1 font-medium">{label}</label>
      {children}
    </div>
  );
}

export default function ModalRegistroPerda({ registro, onSucesso, onFechar }) {
  const editando = Boolean(registro);
  const hoje     = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    tipo:           '',
    nome_pessoa:    '',
    area:           '',
    periferico:     '',
    descricao:      '',
    acao_tomada:    '',
    data_incidente: hoje,
  });

  const [tiposIncidente, setTiposIncidente] = useState([]);
  const [perifericos, setPerifericos]       = useState([]);
  const [acoesIncidente, setAcoesIncidente] = useState([]);
  const [salvando, setSalvando]             = useState(false);
  const [erro, setErro]                     = useState(null);

  useEffect(() => {
    carregarConfiguracoes();
    if (editando) {
      setForm({
        tipo:           registro.tipo           ?? '',
        nome_pessoa:    registro.nome_pessoa    ?? '',
        area:           registro.area           ?? '',
        periferico:     registro.periferico     ?? '',
        descricao:      registro.descricao      ?? '',
        acao_tomada:    registro.acao_tomada    ?? '',
        data_incidente: registro.data_incidente ?? hoje,
      });
    }
  }, []);

  async function carregarConfiguracoes() {
    try {
      const [resTipos, resPeri, resAcoes] = await Promise.all([
        fetch(`${API_URL}/configuracoes.php?tabela=incidentes`),
        fetch(`${API_URL}/configuracoes.php?tabela=perifericos`),
        fetch(`${API_URL}/configuracoes.php?tabela=acoes_incidente`),
      ]);

      const tiposData  = await resTipos.json();
      const periData   = await resPeri.json();
      const acoesData  = await resAcoes.json();

      const tipos  = Array.isArray(tiposData)  ? tiposData  : [];
      const peri   = Array.isArray(periData)   ? periData   : [];
      const acoes  = Array.isArray(acoesData)  ? acoesData  : [];

      setTiposIncidente(tipos);
      setPerifericos(peri);
      setAcoesIncidente(acoes);

      // Define valores padrão após carregar se não está editando
      if (!editando) {
        setForm(prev => ({
          ...prev,
          tipo:        tipos.length  > 0 ? tipos[0].descricao  : '',
          acao_tomada: acoes.length  > 0 ? acoes[0].nome       : '',
        }));
      }
    } catch {
      setErro('Erro ao carregar configurações.');
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    if (!form.tipo || !form.nome_pessoa || !form.area ||
        !form.acao_tomada || !form.data_incidente) {
      setErro('Preencha os campos obrigatórios: Tipo, Nome, Área, Ação tomada e Data.');
      return;
    }

    setSalvando(true);

    try {
      const url    = editando
        ? `${API_URL}/registros_perdas.php?id=${registro.id}`
        : `${API_URL}/registros_perdas.php`;
      const method = editando ? 'PUT' : 'POST';

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao salvar registro.');
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
            {editando ? 'Editar Registro' : 'Novo Registro de Perda'}
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

            {/* Tipo + Data */}
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Tipo do incidente *">
                <select name="tipo" value={form.tipo} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput }} required>
                  <option value="">Selecione</option>
                  {tiposIncidente.map(t => (
                    <option key={t.id} value={t.descricao}>{t.descricao}</option>
                  ))}
                </select>
              </Campo>

              <Campo label="Data do incidente *">
                <input name="data_incidente" type="date" value={form.data_incidente}
                       onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }} required />
              </Campo>
            </div>

            {/* Nome + Área */}
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Nome da pessoa *">
                <input name="nome_pessoa" value={form.nome_pessoa} onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }}
                       placeholder="Ex: João Silva" required />
              </Campo>

              <Campo label="Área / Setor *">
                <input name="area" value={form.area} onChange={handleChange}
                       onFocus={aoFocar} onBlur={aoDesfocar}
                       style={{ ...estiloInput }}
                       placeholder="Ex: Financeiro" required />
              </Campo>
            </div>

            {/* Periférico + Ação */}
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Periférico entregue">
                <select name="periferico" value={form.periferico} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput }}>
                  <option value="">Nenhum</option>
                  {perifericos.map(p => (
                    <option key={p.id} value={p.descricao}>
                      {p.descricao}{p.marca ? ` — ${p.marca}` : ''}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Ação tomada *">
                <select name="acao_tomada" value={form.acao_tomada} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput }} required>
                  <option value="">Selecione</option>
                  {acoesIncidente.map(a => (
                    <option key={a.id} value={a.nome}>{a.nome}</option>
                  ))}
                </select>
              </Campo>
            </div>

            {/* Descrição */}
            <Campo label="Descrição do ocorrido">
              <textarea name="descricao" value={form.descricao} onChange={handleChange}
                        onFocus={aoFocar} onBlur={aoDesfocar}
                        style={{ ...estiloInput, resize: 'vertical', minHeight: '90px' }}
                        placeholder="Descreva o que aconteceu..." />
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
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}