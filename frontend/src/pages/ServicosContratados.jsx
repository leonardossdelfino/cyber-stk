// =============================================================================
// Page: ServicosContratados.jsx
// Responsabilidade: Listagem de serviços contratados com cards visuais
// Padrão visual: idêntico ao ContasFixas.jsx
// =============================================================================

import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Loader2, RefreshCw,
  FileText, Calendar, CreditCard, Tag, AlertCircle,
  CheckCircle, XCircle, PauseCircle, RotateCcw, Paperclip,
} from 'lucide-react';
import ModalServicoContratado from '../components/ModalServicoContratado';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost/cyber-stk/backend/api';

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------
const STATUS_CONFIG = {
  'Ativa':        { cor: '#1eff05', bg: 'rgba(30,255,5,0.10)',    icon: CheckCircle  },
  'Inativa':      { cor: '#888888', bg: 'rgba(136,136,136,0.10)', icon: PauseCircle  },
  'Encerrada':    { cor: '#ff0571', bg: 'rgba(255,5,113,0.10)',   icon: XCircle      },
  'Em Renovação': { cor: '#00bfff', bg: 'rgba(0,191,255,0.10)',   icon: RotateCcw    },
  'Cancelada':    { cor: '#ff4444', bg: 'rgba(255,68,68,0.10)',   icon: XCircle      },
};

function formatarValor(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function diasParaVencimento(dataTermino) {
  const hoje    = new Date();
  const termino = new Date(dataTermino);
  hoje.setHours(0, 0, 0, 0);
  termino.setHours(0, 0, 0, 0);
  return Math.round((termino - hoje) / (1000 * 60 * 60 * 24));
}

// -----------------------------------------------------------------------------
// Alerta de vencimento
// -----------------------------------------------------------------------------
function AlertaVencimento({ dataTermino, status }) {
  const statusAtivos = ['Ativa', 'Em Renovação'];
  if (!statusAtivos.includes(status)) return null;
  const dias = diasParaVencimento(dataTermino);
  if (dias < 0) return (
    <p className="text-xs font-semibold mt-0.5" style={{ color: '#ff4444' }}>
      ⚠ Vencido há {Math.abs(dias)} dia{Math.abs(dias) !== 1 ? 's' : ''}
    </p>
  );
  if (dias <= 30) return (
    <p className="text-xs font-semibold mt-0.5" style={{ color: '#ffa300' }}>
      ⚠ Vence em {dias} dia{dias !== 1 ? 's' : ''}
    </p>
  );
  return null;
}

// -----------------------------------------------------------------------------
// Card de serviço
// -----------------------------------------------------------------------------
function CardServico({ servico, onEditar, onDeletar, deletando }) {
  const statusCfg  = STATUS_CONFIG[servico.status] ?? STATUS_CONFIG['Inativa'];
  const StatusIcon = statusCfg.icon;
  const dias       = diasParaVencimento(servico.data_termino);
  const statusAtivos = ['Ativa', 'Em Renovação'];
  const vencido    = statusAtivos.includes(servico.status) && dias < 0;
  const proxVencer = statusAtivos.includes(servico.status) && dias >= 0 && dias <= 30;

  const borderColor = vencido
    ? 'rgba(255,68,68,0.40)'
    : proxVencer
      ? 'rgba(255,163,0,0.40)'
      : 'rgba(255,255,255,0.07)';

  const urlContrato = servico.arquivo_contrato
    ? `${API_URL.replace('/api', '')}/uploads/contratos/${servico.arquivo_contrato}`
    : null;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${borderColor}` }}
      onMouseEnter={e => e.currentTarget.style.borderColor = vencido ? 'rgba(255,68,68,0.60)' : proxVencer ? 'rgba(255,163,0,0.60)' : 'rgba(255,255,255,0.14)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
    >
      {/* Topo */}
      <div className="flex items-start justify-between gap-2">
        <div className="overflow-hidden">
          <p className="font-semibold text-white truncate">{servico.nome}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {servico.fornecedor}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: statusCfg.bg, color: statusCfg.cor }}
          >
            <StatusIcon size={11} />
            {servico.status}
          </span>

          <button onClick={() => onEditar(servico)}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,163,0,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,163,0,0.30)'; e.currentTarget.style.color = '#ffa300'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <Pencil size={13} />
          </button>

          <button onClick={() => onDeletar(servico)} disabled={deletando === servico.id}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', cursor: deletando === servico.id ? 'wait' : 'pointer' }}
            onMouseEnter={e => { if (deletando !== servico.id) { e.currentTarget.style.background = 'rgba(255,5,113,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,5,113,0.30)'; e.currentTarget.style.color = '#ff0571'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            {deletando === servico.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      {/* Valor */}
      <div>
        <p className="text-2xl font-bold" style={{ color: '#c2ff05' }}>
          {formatarValor(servico.valor_total)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>valor total do contrato</p>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Calendar size={13} style={{ color: '#ff0571', flexShrink: 0 }} />
          <div className="overflow-hidden">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Início</p>
            <p className="text-sm font-medium text-white truncate">{formatarData(servico.data_inicio)}</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Calendar size={13} style={{ color: '#ffa300', flexShrink: 0 }} />
          <div className="overflow-hidden">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Término</p>
            <p className="text-sm font-medium text-white truncate">{formatarData(servico.data_termino)}</p>
            <AlertaVencimento dataTermino={servico.data_termino} status={servico.status} />
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <CreditCard size={13} style={{ color: '#00bfff', flexShrink: 0 }} />
          <div className="overflow-hidden">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Pagamento</p>
            <p className="text-sm font-medium text-white truncate">{servico.forma_pagamento || '—'}</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Tag size={13} style={{ color: '#b1ff00', flexShrink: 0 }} />
          <div className="overflow-hidden">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Categoria</p>
            <p className="text-sm font-medium text-white truncate">{servico.categoria || '—'}</p>
          </div>
        </div>
      </div>

      {/* Descrição */}
      {servico.descricao && (
        <div
          className="flex items-start gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <AlertCircle size={13} style={{ color: 'rgba(255,255,255,0.30)', flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.5' }}>
            {servico.descricao}
          </p>
        </div>
      )}

      {/* Contrato anexado */}
      {urlContrato && (
        <a href={urlContrato} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-150"
          style={{ background: 'rgba(0,191,255,0.05)', border: '1px solid rgba(0,191,255,0.15)', color: '#00bfff', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,191,255,0.10)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,191,255,0.05)'}
        >
          <Paperclip size={13} style={{ flexShrink: 0 }} />
          <p className="text-xs font-medium truncate">Ver contrato anexado</p>
        </a>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Página principal
// -----------------------------------------------------------------------------
export default function ServicosContratados() {
  const [servicos, setServicos]               = useState([]);
  const [carregando, setCarregando]           = useState(true);
  const [erro, setErro]                       = useState(null);
  const [deletando, setDeletando]             = useState(null);
  const [modalAberto, setModalAberto]         = useState(false);
  const [servicoEditando, setServicoEditando] = useState(null);
  const [filtroStatus, setFiltroStatus]       = useState('Todos');
  const [confirmDelete, setConfirmDelete]     = useState(null);

  const statusFiltros = ['Todos', 'Ativa', 'Inativa', 'Encerrada', 'Em Renovação', 'Cancelada'];

  async function carregarServicos() {
    try {
      setCarregando(true);
      setErro(null);
      const res  = await fetch(`${API_URL}/servicos_contratados.php`);
      const data = await res.json();
      setServicos(Array.isArray(data) ? data : []);
    } catch {
      setErro('Erro ao carregar serviços contratados.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarServicos(); }, []);

  function abrirModal()         { setServicoEditando(null);    setModalAberto(true); }
  function abrirEdicao(servico) { setServicoEditando(servico); setModalAberto(true); }
  function fecharModal()        { setModalAberto(false); setServicoEditando(null); }
  function aoSalvar()           { fecharModal(); carregarServicos(); }

  async function confirmarDelete() {
    if (!confirmDelete) return;
    try {
      setDeletando(confirmDelete.id);
      await fetch(`${API_URL}/servicos_contratados.php?id=${confirmDelete.id}`, { method: 'DELETE' });
      setConfirmDelete(null);
      carregarServicos();
    } catch {
      alert('Erro ao excluir serviço.');
    } finally {
      setDeletando(null);
    }
  }

  const servicosFiltrados = filtroStatus === 'Todos'
    ? servicos
    : servicos.filter(s => s.status === filtroStatus);

  const totalAlertas = servicos.filter(s => {
    if (!['Ativa', 'Em Renovação'].includes(s.status)) return false;
    return diasParaVencimento(s.data_termino) <= 30;
  }).length;

  const valorTotalAtivos = servicos
    .filter(s => ['Ativa', 'Em Renovação'].includes(s.status))
    .reduce((acc, s) => acc + Number(s.valor_total), 0);

  return (
    <div className="p-6" style={{ background: '#111111', minHeight: '100vh' }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Serviços Contratados</h2>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {servicos.length} serviço{servicos.length !== 1 ? 's' : ''} cadastrado{servicos.length !== 1 ? 's' : ''}
            {totalAlertas > 0 && (
              <span className="ml-2 font-semibold" style={{ color: '#ffa300' }}>
                · {totalAlertas} com alerta de vencimento
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={carregarServicos}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <RefreshCw size={15} />
          </button>

          <button onClick={abrirModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{ background: '#ff0571', color: '#ffffff', border: '1px solid rgba(255,5,113,0.50)', boxShadow: '0 0 20px rgba(255,5,113,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e0044f'; e.currentTarget.style.boxShadow = '0 0 28px rgba(255,5,113,0.40)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ff0571'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,5,113,0.25)'; }}
          >
            <Plus size={16} />
            Novo Serviço
          </button>
        </div>
      </div>

      {/* Card total */}
      <div className="rounded-xl p-5 mb-6 flex items-center justify-between"
        style={{ background: 'rgba(194,255,5,0.05)', border: '1px solid rgba(194,255,5,0.15)' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(194,255,5,0.60)' }}>
            Total em Contratos Ativos
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#c2ff05' }}>
            {formatarValor(valorTotalAtivos)}
          </p>
        </div>
        <FileText size={40} style={{ color: 'rgba(194,255,5,0.15)' }} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {statusFiltros.map(s => {
          const ativo = filtroStatus === s;
          const cfg   = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={{
                background: ativo ? (cfg ? cfg.bg  : 'rgba(255,5,113,0.12)') : 'rgba(255,255,255,0.04)',
                color:      ativo ? (cfg ? cfg.cor : '#ff0571')               : 'rgba(255,255,255,0.40)',
                border:     ativo ? `1px solid ${cfg ? cfg.cor : '#ff0571'}44` : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {s}
              {s !== 'Todos' && (
                <span className="ml-1 opacity-60">
                  ({servicos.filter(sv => sv.status === s).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {carregando ? (
        <div className="flex items-center justify-center py-20 gap-2">
          <Loader2 size={20} style={{ color: '#ff0571' }} className="animate-spin" />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Carregando...</span>
        </div>
      ) : erro ? (
        <div className="text-center py-12" style={{ color: '#ff4444' }}>{erro}</div>
      ) : servicosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl text-center gap-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <FileText size={36} style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>
            {filtroStatus === 'Todos'
              ? 'Nenhum serviço cadastrado ainda.'
              : `Nenhum serviço com status "${filtroStatus}".`}
          </p>
          {filtroStatus === 'Todos' && (
            <button onClick={abrirModal}
              className="text-xs px-4 py-2 rounded-lg transition"
              style={{ background: 'rgba(255,5,113,0.12)', color: '#ff0571', border: '1px solid rgba(255,5,113,0.25)' }}>
              Criar primeiro serviço
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {servicosFiltrados.map(servico => (
            <CardServico
              key={servico.id}
              servico={servico}
              onEditar={abrirEdicao}
              onDeletar={setConfirmDelete}
              deletando={deletando}
            />
          ))}
        </div>
      )}

      {/* Modal criação/edição */}
      {modalAberto && (
        <ModalServicoContratado
          servico={servicoEditando}
          onSucesso={aoSalvar}
          onFechar={fecharModal}
        />
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-xl p-6 w-full max-w-sm mx-4"
            style={{ background: 'rgba(20,20,20,0.97)', border: '1px solid rgba(255,5,113,0.25)', boxShadow: '0 24px 64px rgba(0,0,0,0.70)' }}>
            <h3 className="text-white font-semibold text-lg mb-2">Confirmar exclusão</h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Tem certeza que deseja excluir{' '}
              <strong className="text-white">{confirmDelete.nome}</strong>?
              {confirmDelete.arquivo_contrato && (
                <span className="block mt-1" style={{ color: '#ffa300' }}>
                  O arquivo de contrato anexado também será removido.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}>
                Cancelar
              </button>
              <button onClick={confirmarDelete}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#ff0571', color: '#ffffff', border: '1px solid rgba(255,5,113,0.60)', boxShadow: '0 0 20px rgba(255,5,113,0.30)' }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}