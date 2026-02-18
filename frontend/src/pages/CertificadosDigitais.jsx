// =============================================================================
// Page: CertificadosDigitais.jsx
// Responsabilidade: Listagem de certificados digitais com cards horizontais
// Sistema de bordas: Verde (válido) | Laranja (30 dias) | Vermelho (vencido) | Cinza (inativo)
// Busca em tempo real por nome, tipo, responsável, área e descrição
// =============================================================================

import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Loader2, RefreshCw, Search,
  ShieldCheck, Calendar, User, Building2, Clock, DollarSign,
  CheckCircle, XCircle, RotateCcw,
} from 'lucide-react';
import ModalCertificadoDigital from '../components/ModalCertificadoDigital';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost/cyber-stk/backend/api';

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------
const STATUS_CONFIG = {
  'Ativo':    { cor: '#1eff05', bg: 'rgba(30,255,5,0.10)',    icon: CheckCircle },
  'Vencido':  { cor: '#ff4444', bg: 'rgba(255,68,68,0.10)',   icon: XCircle     },
  'Revogado': { cor: '#ff0571', bg: 'rgba(255,5,113,0.10)',   icon: XCircle     },
  'Renovado': { cor: '#00bfff', bg: 'rgba(0,191,255,0.10)',   icon: RotateCcw   },
};

const TIPO_CORES = {
  'e-CPF A1':  '#ff9c00',
  'e-CPF A3':  '#ffa300',
  'e-CNPJ A1': '#b1ff00',
  'e-CNPJ A3': '#1eff05',
  'SSL/TLS':   '#00bfff',
  'Outro':     '#888888',
};

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor) {
  if (!valor) return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function diasParaVencimento(dataVencimento) {
  const hoje       = new Date();
  const vencimento = new Date(dataVencimento);
  hoje.setHours(0, 0, 0, 0);
  vencimento.setHours(0, 0, 0, 0);
  return Math.round((vencimento - hoje) / (1000 * 60 * 60 * 24));
}

// -----------------------------------------------------------------------------
// Card de certificado — Layout horizontal
// -----------------------------------------------------------------------------
function CardCertificado({ cert, onEditar, onDeletar, deletando }) {
  const statusCfg  = STATUS_CONFIG[cert.status] ?? STATUS_CONFIG['Ativo'];
  const StatusIcon = statusCfg.icon;
  const tipoCor    = TIPO_CORES[cert.tipo] ?? '#888888';
  const dias       = diasParaVencimento(cert.data_vencimento);

  // Sistema de bordas
  let borderColor = 'rgba(136,136,136,0.30)'; // Cinza padrão (inativo)
  
  if (cert.status === 'Ativo') {
    if (dias < 0) {
      borderColor = 'rgba(255,68,68,0.60)'; // Vermelho (vencido)
    } else if (dias <= 30) {
      borderColor = 'rgba(255,163,0,0.60)'; // Laranja (30 dias)
    } else {
      borderColor = 'rgba(30,255,5,0.60)'; // Verde (válido)
    }
  }

  return (
    <div
      className="rounded-xl p-5 transition-all duration-200"
      style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: `2px solid ${borderColor}`,
      }}
    >
      <div className="flex items-start gap-4">
        
        {/* Coluna esquerda — Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base truncate mb-1">
                {cert.descricao || cert.nome}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: `${tipoCor}18`, color: tipoCor, border: `1px solid ${tipoCor}33` }}
                >
                  {cert.tipo}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: statusCfg.bg, color: statusCfg.cor }}
                >
                  <StatusIcon size={10} />
                  {cert.status}
                </span>
              </div>
            </div>
          </div>

          {/* Grid de informações */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            
            {/* Data de emissão */}
            {cert.data_emissao && (
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color: '#ff0571', flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Emissão</p>
                  <p className="text-sm text-white truncate">{formatarData(cert.data_emissao)}</p>
                </div>
              </div>
            )}

            {/* Data de vencimento */}
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: '#ffa300', flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Vencimento</p>
                <p className="text-sm text-white truncate">{formatarData(cert.data_vencimento)}</p>
                {cert.status === 'Ativo' && dias < 0 && (
                  <p className="text-xs font-semibold" style={{ color: '#ff4444' }}>
                    Vencido há {Math.abs(dias)} dia{Math.abs(dias) !== 1 ? 's' : ''}
                  </p>
                )}
                {cert.status === 'Ativo' && dias >= 0 && dias <= 30 && (
                  <p className="text-xs font-semibold" style={{ color: '#ffa300' }}>
                    Vence em {dias} dia{dias !== 1 ? 's' : ''}
                  </p>
                )}
                {cert.status === 'Ativo' && dias > 30 && (
                  <p className="text-xs" style={{ color: 'rgba(30,255,5,0.60)' }}>
                    {dias} dias restantes
                  </p>
                )}
              </div>
            </div>

            {/* Responsável */}
            {cert.responsavel && (
              <div className="flex items-center gap-2">
                <User size={14} style={{ color: '#b1ff00', flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Responsável</p>
                  <p className="text-sm text-white truncate">{cert.responsavel}</p>
                </div>
              </div>
            )}

            {/* Área */}
            {cert.area && (
              <div className="flex items-center gap-2">
                <Building2 size={14} style={{ color: '#00bfff', flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Área</p>
                  <p className="text-sm text-white truncate">{cert.area}</p>
                </div>
              </div>
            )}

            {/* Nome (fornecedor/razão social) */}
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} style={{ color: '#ff9c00', flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Titular</p>
                <p className="text-sm text-white truncate">{cert.nome}</p>
              </div>
            </div>

            {/* Valor pago */}
            {cert.valor_pago && (
              <div className="flex items-center gap-2">
                <DollarSign size={14} style={{ color: '#c2ff05', flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Valor pago</p>
                  <p className="text-sm font-medium" style={{ color: '#c2ff05' }}>{formatarMoeda(cert.valor_pago)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita — Ações */}
        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={() => onEditar(cert)}
            className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,163,0,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,163,0,0.30)'; e.currentTarget.style.color = '#ffa300'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <Pencil size={14} />
          </button>

          <button onClick={() => onDeletar(cert)} disabled={deletando === cert.id}
            className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', cursor: deletando === cert.id ? 'wait' : 'pointer' }}
            onMouseEnter={e => { if (deletando !== cert.id) { e.currentTarget.style.background = 'rgba(255,5,113,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,5,113,0.30)'; e.currentTarget.style.color = '#ff0571'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            {deletando === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Página principal
// -----------------------------------------------------------------------------
export default function CertificadosDigitais() {
  const [certs, setCerts]                   = useState([]);
  const [carregando, setCarregando]         = useState(true);
  const [erro, setErro]                     = useState(null);
  const [deletando, setDeletando]           = useState(null);
  const [modalAberto, setModalAberto]       = useState(false);
  const [certEditando, setCertEditando]     = useState(null);
  const [filtroStatus, setFiltroStatus]     = useState('Todos');
  const [busca, setBusca]                   = useState('');
  const [confirmDelete, setConfirmDelete]   = useState(null);

  const statusFiltros = ['Todos', 'Ativo', 'Vencido', 'Revogado', 'Renovado'];

  async function carregarCerts() {
    try {
      setCarregando(true);
      setErro(null);
      const res  = await fetch(`${API_URL}/certificados_digitais.php`);
      const data = await res.json();
      setCerts(Array.isArray(data) ? data : []);
    } catch {
      setErro('Erro ao carregar certificados digitais.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarCerts(); }, []);

  function abrirModal()      { setCertEditando(null); setModalAberto(true); }
  function abrirEdicao(cert) { setCertEditando(cert); setModalAberto(true); }
  function fecharModal()     { setModalAberto(false); setCertEditando(null); }
  function aoSalvar()        { fecharModal(); carregarCerts(); }

  async function confirmarDelete() {
    if (!confirmDelete) return;
    try {
      setDeletando(confirmDelete.id);
      await fetch(`${API_URL}/certificados_digitais.php?id=${confirmDelete.id}`, { method: 'DELETE' });
      setConfirmDelete(null);
      carregarCerts();
    } catch {
      alert('Erro ao excluir certificado.');
    } finally {
      setDeletando(null);
    }
  }

  // Filtragem por busca e status
  const certsFiltrados = certs.filter(c => {
    // Filtro de status
    const passaStatus = filtroStatus === 'Todos' || c.status === filtroStatus;
    if (!passaStatus) return false;

    // Filtro de busca
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      c.nome?.toLowerCase().includes(q)        ||
      c.tipo?.toLowerCase().includes(q)        ||
      c.responsavel?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q)        ||
      c.descricao?.toLowerCase().includes(q)
    );
  });

  const totalAlertas = certs.filter(c => {
    if (c.status !== 'Ativo') return false;
    return diasParaVencimento(c.data_vencimento) <= 30;
  }).length;

  return (
    <div className="p-6" style={{ background: '#111111', minHeight: '100vh' }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Certificados Digitais</h2>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {certs.length} certificado{certs.length !== 1 ? 's' : ''} cadastrado{certs.length !== 1 ? 's' : ''}
            {totalAlertas > 0 && (
              <span className="ml-2 font-semibold" style={{ color: '#ffa300' }}>
                · {totalAlertas} com alerta de vencimento
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* Campo de busca */}
          <div className="relative">
            <Search size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.30)' }}
            />
            <input
              type="text"
              placeholder="Buscar certificado..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.08)',
                color:      '#ffffff',
                width:      '220px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255,5,113,0.40)';
                e.target.style.boxShadow   = '0 0 0 3px rgba(255,5,113,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                e.target.style.boxShadow   = 'none';
              }}
            />
          </div>

          <button onClick={carregarCerts}
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
            Novo Certificado
          </button>
        </div>
      </div>

      {/* Card resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',    valor: certs.length,                                          cor: '#ffffff' },
          { label: 'Ativos',   valor: certs.filter(c => c.status === 'Ativo').length,         cor: '#1eff05' },
          { label: 'Vencidos', valor: certs.filter(c => c.status === 'Vencido').length,       cor: '#ff4444' },
          { label: 'Alertas',  valor: totalAlertas,                                           cor: '#ffa300' },
        ].map(({ label, valor, cor }) => (
          <div key={label}
            className="rounded-xl px-4 py-3 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: cor }}>{valor}</p>
          </div>
        ))}
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
                  ({certs.filter(c => c.status === s).length})
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
      ) : certsFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl text-center gap-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ShieldCheck size={36} style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>
            {busca
              ? 'Nenhum certificado encontrado com os filtros aplicados.'
              : filtroStatus === 'Todos'
                ? 'Nenhum certificado cadastrado ainda.'
                : `Nenhum certificado com status "${filtroStatus}".`
            }
          </p>
          {filtroStatus === 'Todos' && !busca && (
            <button onClick={abrirModal}
              className="text-xs px-4 py-2 rounded-lg transition"
              style={{ background: 'rgba(255,5,113,0.12)', color: '#ff0571', border: '1px solid rgba(255,5,113,0.25)' }}>
              Cadastrar primeiro certificado
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {certsFiltrados.map(cert => (
            <CardCertificado
              key={cert.id}
              cert={cert}
              onEditar={abrirEdicao}
              onDeletar={setConfirmDelete}
              deletando={deletando}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <ModalCertificadoDigital
          cert={certEditando}
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
              Tem certeza que deseja excluir o certificado{' '}
              <strong className="text-white">{confirmDelete.nome}</strong>?
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