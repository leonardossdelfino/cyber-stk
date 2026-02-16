// =============================================================================
// Page: CertificadosDigitais.jsx
// Responsabilidade: Listagem de certificados digitais com cards visuais
// Padrão visual: idêntico ao ContasFixas.jsx e ServicosContratados.jsx
// =============================================================================

import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Loader2, RefreshCw,
  ShieldCheck, Calendar, User, Building2, AlertCircle,
  CheckCircle, XCircle, RotateCcw, Clock,
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

function diasParaVencimento(dataVencimento) {
  const hoje     = new Date();
  const vencimento = new Date(dataVencimento);
  hoje.setHours(0, 0, 0, 0);
  vencimento.setHours(0, 0, 0, 0);
  return Math.round((vencimento - hoje) / (1000 * 60 * 60 * 24));
}

// -----------------------------------------------------------------------------
// Alerta de vencimento
// -----------------------------------------------------------------------------
function AlertaVencimento({ dataVencimento, status }) {
  if (status !== 'Ativo') return null;
  const dias = diasParaVencimento(dataVencimento);

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

  return (
    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
      {dias} dias restantes
    </p>
  );
}

// -----------------------------------------------------------------------------
// Card de certificado
// -----------------------------------------------------------------------------
function CardCertificado({ cert, onEditar, onDeletar, deletando }) {
  const statusCfg  = STATUS_CONFIG[cert.status] ?? STATUS_CONFIG['Ativo'];
  const StatusIcon = statusCfg.icon;
  const tipoCor    = TIPO_CORES[cert.tipo] ?? '#888888';
  const dias       = diasParaVencimento(cert.data_vencimento);
  const vencido    = cert.status === 'Ativo' && dias < 0;
  const proxVencer = cert.status === 'Ativo' && dias >= 0 && dias <= 30;

  const borderColor = vencido
    ? 'rgba(255,68,68,0.40)'
    : proxVencer
      ? 'rgba(255,163,0,0.40)'
      : 'rgba(255,255,255,0.07)';

  const borderHover = vencido
    ? 'rgba(255,68,68,0.60)'
    : proxVencer
      ? 'rgba(255,163,0,0.60)'
      : 'rgba(255,255,255,0.14)';

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${borderColor}` }}
      onMouseEnter={e => e.currentTarget.style.borderColor = borderHover}
      onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
    >
      {/* Topo */}
      <div className="flex items-start justify-between gap-2">
        <div className="overflow-hidden">
          <p className="font-semibold text-white truncate">{cert.nome}</p>
          <span
            className="inline-block text-xs font-semibold px-2 py-0.5 rounded mt-1"
            style={{ background: `${tipoCor}18`, color: tipoCor, border: `1px solid ${tipoCor}33` }}
          >
            {cert.tipo}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: statusCfg.bg, color: statusCfg.cor }}
          >
            <StatusIcon size={11} />
            {cert.status}
          </span>

          <button onClick={() => onEditar(cert)}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,163,0,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,163,0,0.30)'; e.currentTarget.style.color = '#ffa300'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            <Pencil size={13} />
          </button>

          <button onClick={() => onDeletar(cert)} disabled={deletando === cert.id}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', cursor: deletando === cert.id ? 'wait' : 'pointer' }}
            onMouseEnter={e => { if (deletando !== cert.id) { e.currentTarget.style.background = 'rgba(255,5,113,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,5,113,0.30)'; e.currentTarget.style.color = '#ff0571'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
          >
            {deletando === cert.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-2">
        {cert.data_emissao && (
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Calendar size={13} style={{ color: '#ff0571', flexShrink: 0 }} />
            <div className="overflow-hidden">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Emissão</p>
              <p className="text-sm font-medium text-white truncate">{formatarData(cert.data_emissao)}</p>
            </div>
          </div>
        )}

        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 ${!cert.data_emissao ? 'col-span-2' : ''}`}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Clock size={13} style={{ color: '#ffa300', flexShrink: 0 }} />
          <div className="overflow-hidden">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Vencimento</p>
            <p className="text-sm font-medium text-white truncate">{formatarData(cert.data_vencimento)}</p>
            <AlertaVencimento dataVencimento={cert.data_vencimento} status={cert.status} />
          </div>
        </div>
      </div>

      {/* Responsável e Área */}
      {(cert.responsavel || cert.area) && (
        <div className="grid grid-cols-2 gap-2">
          {cert.responsavel && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <User size={13} style={{ color: '#b1ff00', flexShrink: 0 }} />
              <div className="overflow-hidden">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Responsável</p>
                <p className="text-sm font-medium text-white truncate">{cert.responsavel}</p>
              </div>
            </div>
          )}
          {cert.area && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Building2 size={13} style={{ color: '#00bfff', flexShrink: 0 }} />
              <div className="overflow-hidden">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Área</p>
                <p className="text-sm font-medium text-white truncate">{cert.area}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Descrição */}
      {cert.descricao && (
        <div
          className="flex items-start gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <AlertCircle size={13} style={{ color: 'rgba(255,255,255,0.30)', flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.5' }}>
            {cert.descricao}
          </p>
        </div>
      )}
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

  const certsFiltrados = filtroStatus === 'Todos'
    ? certs
    : certs.filter(c => c.status === filtroStatus);

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
            {filtroStatus === 'Todos'
              ? 'Nenhum certificado cadastrado ainda.'
              : `Nenhum certificado com status "${filtroStatus}".`}
          </p>
          {filtroStatus === 'Todos' && (
            <button onClick={abrirModal}
              className="text-xs px-4 py-2 rounded-lg transition"
              style={{ background: 'rgba(255,5,113,0.12)', color: '#ff0571', border: '1px solid rgba(255,5,113,0.25)' }}>
              Cadastrar primeiro certificado
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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