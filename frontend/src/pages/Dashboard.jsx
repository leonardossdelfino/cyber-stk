// =============================================================================
// ARQUIVO: src/pages/Dashboard.jsx
// FUNÇÃO: Dashboard com cards, filtro de período, gráficos e alertas
// =============================================================================

import { RefreshCw, Loader2, ShoppingCart, DollarSign, Receipt, Wrench, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';

// -----------------------------------------------------------------------------
// Utilitários
// -----------------------------------------------------------------------------
const formatarMoeda = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const truncar = (str, max = 22) =>
  str?.length > max ? str.substring(0, max) + '…' : (str ?? '');

const formatarData = (iso) => {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
};

const CORES_PERDAS = ['#c2ff05', '#a8d904', '#8eb303', '#748d02', '#5a6802'];

// -----------------------------------------------------------------------------
// Atalhos de período
// -----------------------------------------------------------------------------
function periodoAno() {
  const ano = new Date().getFullYear();
  return { inicio: `${ano}-01-01`, fim: `${ano}-12-31` };
}
function periodoMes() {
  const hoje   = new Date();
  const ano    = hoje.getFullYear();
  const mes    = String(hoje.getMonth() + 1).padStart(2, '0');
  const ultimo = new Date(ano, hoje.getMonth() + 1, 0).getDate();
  return { inicio: `${ano}-${mes}-01`, fim: `${ano}-${mes}-${String(ultimo).padStart(2, '0')}` };
}
function periodo30Dias() {
  const hoje = new Date();
  const ini  = new Date(hoje);
  ini.setDate(ini.getDate() - 29);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { inicio: fmt(ini), fim: fmt(hoje) };
}

// -----------------------------------------------------------------------------
// Tooltips
// -----------------------------------------------------------------------------
function TooltipLinha({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(14,14,14,0.97)', border: '1px solid rgba(255,5,113,0.25)',
      borderRadius: '10px', padding: '10px 14px',
      backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#ff0571', fontSize: '13px', fontWeight: 600 }}>{formatarMoeda(payload[0].value)}</p>
    </div>
  );
}

function TooltipDonut({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: inner } = payload[0];
  return (
    <div style={{
      background: 'rgba(14,14,14,0.97)', border: `1px solid ${inner.cor}44`,
      borderRadius: '10px', padding: '10px 14px',
      backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
    }}>
      <p style={{ color: inner.cor, fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{name}</p>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>{value} OC{value !== 1 ? 's' : ''}</p>
    </div>
  );
}

function TooltipBarra({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(14,14,14,0.97)', border: '1px solid rgba(255,163,0,0.25)',
      borderRadius: '10px', padding: '10px 14px',
      backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#ffa300', fontSize: '13px', fontWeight: 600 }}>{formatarMoeda(item.total)}</p>
      <p style={{ color: 'rgba(255,255,255,0.30)', fontSize: '11px', marginTop: '2px' }}>
        {item.qtd_ocs} OC{item.qtd_ocs !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function TooltipPerdasTipo({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(14,14,14,0.97)', border: '1px solid rgba(194,255,5,0.25)',
      borderRadius: '10px', padding: '10px 14px',
      backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#c2ff05', fontSize: '13px', fontWeight: 600 }}>{formatarMoeda(item.custo_total)}</p>
      <p style={{ color: 'rgba(255,255,255,0.30)', fontSize: '11px', marginTop: '2px' }}>
        {item.quantidade} incidente{item.quantidade !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function TooltipEvolucaoPerdas({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(14,14,14,0.97)', border: '1px solid rgba(194,255,5,0.25)',
      borderRadius: '10px', padding: '10px 14px',
      backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#c2ff05', fontSize: '13px', fontWeight: 600 }}>{formatarMoeda(item.total)}</p>
      <p style={{ color: 'rgba(255,255,255,0.30)', fontSize: '11px', marginTop: '2px' }}>
        {item.qtd} incidente{item.qtd !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Card individual
// -----------------------------------------------------------------------------
function Card({ titulo, valor, subtitulo, icon: Icon, corIcone, tipo = 'moeda' }) {
  const valorFormatado = tipo === 'moeda' ? formatarMoeda(valor) : String(valor);
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${corIcone}` }}>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
             style={{ background: `${corIcone}18` }}>
          <Icon size={16} style={{ color: corIcone }} />
        </div>
        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{titulo}</p>
      </div>
      <p className="text-xl font-bold text-white leading-none">{valorFormatado}</p>
      {subtitulo && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>{subtitulo}</p>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Título de seção
// -----------------------------------------------------------------------------
function SecaoTitulo({ titulo, subtitulo, cor }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: cor }} />
      <div>
        <p className="text-sm font-semibold text-white">{titulo}</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitulo}</p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Container de gráfico reutilizável
// -----------------------------------------------------------------------------
function GraficoContainer({ titulo, subtitulo, cor, children }) {
  return (
    <div className="rounded-xl p-5"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cor }} />
        <p className="text-sm font-semibold text-white">{titulo}</p>
        {subtitulo && (
          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.30)' }}>{subtitulo}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function SemDados() {
  return (
    <div className="flex items-center justify-center py-12"
         style={{ color: 'rgba(255,255,255,0.20)', fontSize: '13px' }}>
      Nenhum dado no período selecionado
    </div>
  );
}

// -----------------------------------------------------------------------------
// Filtro de período
// -----------------------------------------------------------------------------
function FiltroPeriodo({ dataInicio, dataFim, onChangeInicio, onChangeFim, onRecarregar }) {
  const estiloInput = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', color: '#ffffff', padding: '6px 10px',
    fontSize: '13px', outline: 'none', colorScheme: 'dark', cursor: 'pointer',
  };
  const estiloAtalho = (ativo) => ({
    background:   ativo ? 'rgba(255,5,113,0.15)' : 'rgba(255,255,255,0.04)',
    border:       ativo ? '1px solid rgba(255,5,113,0.35)' : '1px solid rgba(255,255,255,0.08)',
    color:        ativo ? '#ff0571' : 'rgba(255,255,255,0.45)',
    borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
    fontWeight: ativo ? 600 : 400, cursor: 'pointer', transition: 'all 150ms',
  });
  const aplicar = ({ inicio, fim }) => { onChangeInicio(inicio); onChangeFim(fim); };
  const mes  = periodoMes();
  const ano  = periodoAno();
  const dias = periodo30Dias();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button style={estiloAtalho(dataInicio === mes.inicio  && dataFim === mes.fim)}  onClick={() => aplicar(mes)}>Este mês</button>
      <button style={estiloAtalho(dataInicio === dias.inicio && dataFim === dias.fim)} onClick={() => aplicar(dias)}>Últimos 30 dias</button>
      <button style={estiloAtalho(dataInicio === ano.inicio  && dataFim === ano.fim)}  onClick={() => aplicar(ano)}>Este ano</button>
      <span style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
      <input type="date" value={dataInicio} onChange={(e) => onChangeInicio(e.target.value)} style={estiloInput}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(255,5,113,0.40)'; }}
        onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }} />
      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>até</span>
      <input type="date" value={dataFim} onChange={(e) => onChangeFim(e.target.value)} style={estiloInput}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(255,5,113,0.40)'; }}
        onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }} />
      <button onClick={onRecarregar} title="Atualizar"
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
        <RefreshCw size={14} />
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Gráfico 1 — Gastos mensais em OCs (linha)
// -----------------------------------------------------------------------------
function GraficoMensalOCs({ dados }) {
  if (!dados?.length) return <SemDados />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dados} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
               axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
        <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
               tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
               axisLine={false} tickLine={false} width={55} />
        <Tooltip content={<TooltipLinha />} />
        <Line type="monotone" dataKey="total" stroke="#ff0571" strokeWidth={2}
              dot={{ fill: '#ff0571', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#ff0571', stroke: 'rgba(255,5,113,0.30)', strokeWidth: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// -----------------------------------------------------------------------------
// Gráfico 2 — OCs por Status (donut)
// -----------------------------------------------------------------------------
function GraficoStatusOCs({ dados }) {
  if (!dados?.length) return <SemDados />;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="rgba(255,255,255,0.85)" textAnchor="middle"
            dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const renderLegenda = ({ payload }) => (
    <div className="flex flex-col gap-2 justify-center" style={{ paddingLeft: '16px' }}>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.payload.cor }} />
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>{entry.value}</span>
          <span style={{ color: 'rgba(255,255,255,0.30)', fontSize: '11px' }}>({entry.payload.value})</span>
        </div>
      ))}
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={dados} cx="40%" cy="50%" innerRadius={70} outerRadius={110}
             dataKey="value" labelLine={false} label={renderLabel}>
          {dados.map((entry, i) => (
            <Cell key={i} fill={entry.cor} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<TooltipDonut />} />
        <Legend layout="vertical" align="right" verticalAlign="middle" content={renderLegenda} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// -----------------------------------------------------------------------------
// Gráfico 3 — Top Fornecedores por Gasto (barras horizontais)
// -----------------------------------------------------------------------------
function GraficoTopFornecedores({ dados }) {
  if (!dados?.length) return <SemDados />;
  const dadosOrdenados = [...dados].reverse();
  const altura = Math.max(200, dadosOrdenados.length * 44 + 20);
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dadosOrdenados} layout="vertical"
                margin={{ top: 0, right: 20, left: 8, bottom: 0 }} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
               tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
               axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
        <YAxis type="category" dataKey="fornecedor" tickFormatter={(v) => truncar(v)}
               tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
               axisLine={false} tickLine={false} width={150} />
        <Tooltip content={<TooltipBarra />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="total" radius={[0, 6, 6, 0]}>
          {dadosOrdenados.map((_, i) => (
            <Cell key={i} fill={`rgba(255,163,0,${0.55 + (i / dadosOrdenados.length) * 0.45})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// -----------------------------------------------------------------------------
// Gráfico 4 — Perdas por Tipo de Incidente (barras verticais)
// -----------------------------------------------------------------------------
function GraficoPerdasPorTipo({ dados }) {
  if (!dados?.length) return <SemDados />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} margin={{ top: 10, right: 20, left: 10, bottom: 40 }} barSize={36}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="tipo" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
               axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false}
               interval={0} angle={-25} textAnchor="end" tickFormatter={(v) => truncar(v, 18)} />
        <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
               tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
               axisLine={false} tickLine={false} width={55} />
        <Tooltip content={<TooltipPerdasTipo />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="custo_total" radius={[6, 6, 0, 0]}>
          {dados.map((_, i) => (
            <Cell key={i} fill={CORES_PERDAS[i % CORES_PERDAS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// -----------------------------------------------------------------------------
// Gráfico 5 — Evolução de Perdas por mês (linha)
// -----------------------------------------------------------------------------
function GraficoEvolucaoPerdas({ dados }) {
  if (!dados?.length) return <SemDados />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dados} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
               axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
        <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
               tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
               axisLine={false} tickLine={false} width={55} />
        <Tooltip content={<TooltipEvolucaoPerdas />} />
        <Line type="monotone" dataKey="total" stroke="#c2ff05" strokeWidth={2}
              dot={{ fill: '#c2ff05', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#c2ff05', stroke: 'rgba(194,255,5,0.30)', strokeWidth: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// -----------------------------------------------------------------------------
// Card de serviço contratado vencendo
// Cor de urgência: vermelho <= 7 dias / laranja <= 15 dias / rosa > 15 dias
// -----------------------------------------------------------------------------
function CardServico({ serv }) {
  const cor = serv.dias_restantes <= 7  ? '#ff0571'
            : serv.dias_restantes <= 15 ? '#ffa300'
            : '#ff0571';

  return (
    <div className="rounded-xl p-4 flex items-center gap-4"
         style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cor}33`, borderLeft: `3px solid ${cor}` }}>
      {/* Ícone + dias */}
      <div className="flex flex-col items-center justify-center flex-shrink-0 w-14 gap-0.5">
        <Wrench size={20} style={{ color: cor }} />
        <span className="text-xs font-bold" style={{ color: cor }}>{serv.dias_restantes}d</span>
      </div>
      {/* Detalhes */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{serv.nome}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
          {serv.fornecedor}{serv.categoria ? ` · ${serv.categoria}` : ''}
        </p>
      </div>
      {/* Valor + data */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-medium" style={{ color: cor }}>{formatarData(serv.data_termino)}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatarMoeda(serv.valor_total)}</p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Seção de alertas de serviços contratados
// -----------------------------------------------------------------------------
function AlertasServicos({ lista }) {
  if (!lista?.length) {
    return (
      <div className="rounded-xl p-5 flex items-center gap-3"
           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Wrench size={16} style={{ color: 'rgba(255,255,255,0.20)' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Nenhum serviço contratado vencendo nos próximos 30 dias.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {lista.map((serv, i) => (
        <CardServico key={i} serv={serv} />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Card de certificado vencendo
// Cor de urgência: vermelho < 15 dias / laranja < 30 dias / amarelo <= 60 dias
// -----------------------------------------------------------------------------
function CardCertificado({ cert }) {
  const cor = cert.dias_restantes <= 15 ? '#ff0571'
            : cert.dias_restantes <= 30 ? '#ffa300'
            : '#c2ff05';

  return (
    <div className="rounded-xl p-4 flex items-center gap-4"
         style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cor}33`, borderLeft: `3px solid ${cor}` }}>
      {/* Ícone + dias */}
      <div className="flex flex-col items-center justify-center flex-shrink-0 w-14 gap-0.5">
        <ShieldAlert size={20} style={{ color: cor }} />
        <span className="text-xs font-bold" style={{ color: cor }}>{cert.dias_restantes}d</span>
      </div>
      {/* Detalhes */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{cert.nome}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
          {cert.tipo}{cert.responsavel ? ` · ${cert.responsavel}` : ''}
        </p>
      </div>
      {/* Data de vencimento */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-medium" style={{ color: cor }}>{formatarData(cert.data_vencimento)}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>vencimento</p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Seção de alertas de certificados
// -----------------------------------------------------------------------------
function AlertasCertificados({ lista }) {
  if (!lista?.length) {
    return (
      <div className="rounded-xl p-5 flex items-center gap-3"
           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <ShieldAlert size={16} style={{ color: 'rgba(255,255,255,0.20)' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Nenhum certificado vencendo nos próximos 60 dias.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {lista.map((cert, i) => (
        <CardCertificado key={i} cert={cert} />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Página principal
// -----------------------------------------------------------------------------
function Dashboard() {
  const {
    dados, loading, erro,
    dataInicio, dataFim,
    setDataInicio, setDataFim,
    recarregar,
  } = useDashboard();

  return (
    <div className="p-6" style={{ background: '#111111', minHeight: '100vh' }}>

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Visão consolidada do sistema financeiro
          </p>
        </div>
        <FiltroPeriodo
          dataInicio={dataInicio} dataFim={dataFim}
          onChangeInicio={setDataInicio} onChangeFim={setDataFim}
          onRecarregar={recarregar}
        />
      </div>

      {/* Erro */}
      {erro && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm"
             style={{ background: 'rgba(255,5,113,0.10)', border: '1px solid rgba(255,5,113,0.25)', color: '#ff0571' }}>
          {erro}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Loader2 size={14} className="animate-spin" style={{ color: '#ff0571' }} />
          <span className="text-xs">Atualizando...</span>
        </div>
      )}

      {/* ── OCs — Cards ─────────────────────────────────────────────────────── */}
      <SecaoTitulo titulo="Ordens de Compra" subtitulo="Filtrado pelo período selecionado" cor="#ff0571" />
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Card titulo="OCs Abertas / Pendentes" valor={dados.ocs_abertas}
              subtitulo={`de ${dados.total_ocs} OC${dados.total_ocs !== 1 ? 's' : ''} no período`}
              icon={ShoppingCart} corIcone="#ff0571" tipo="numero" />
        <Card titulo="Valor Total das OCs Abertas" valor={dados.valor_ocs_abertas}
              subtitulo={`Total geral: ${formatarMoeda(dados.valor_total_ocs)}`}
              icon={DollarSign} corIcone="#ff0571" />
      </div>

      {/* ── Gráficos 1 e 2 lado a lado ─────────────────────────────────────── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <GraficoContainer titulo="Gastos mensais em OCs" subtitulo="por mês no período" cor="#ff0571">
          <GraficoMensalOCs dados={dados.grafico_mensal_ocs ?? []} />
        </GraficoContainer>
        <GraficoContainer titulo="OCs por Status" subtitulo="distribuição no período" cor="#ff0571">
          <GraficoStatusOCs dados={dados.grafico_status_ocs ?? []} />
        </GraficoContainer>
      </div>

      {/* ── Gráfico 3 — Top Fornecedores (largura total) ────────────────────── */}
      <div className="mb-8">
        <GraficoContainer titulo="Top Fornecedores por Gasto" subtitulo="baseado em OCs no período · top 8" cor="#ffa300">
          <GraficoTopFornecedores dados={dados.grafico_top_fornecedores ?? []} />
        </GraficoContainer>
      </div>

      {/* ── Custos Recorrentes — Cards ──────────────────────────────────────── */}
      <SecaoTitulo titulo="Custos Recorrentes" subtitulo="Contas fixas e serviços contratados" cor="#ffa300" />
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Card titulo="Total de Contas Fixas" valor={dados.valor_total_contas_fixas}
              subtitulo={`${dados.total_contas_fixas} conta${dados.total_contas_fixas !== 1 ? 's' : ''} cadastrada${dados.total_contas_fixas !== 1 ? 's' : ''}`}
              icon={Receipt} corIcone="#ffa300" />
        <Card titulo="Serviços Contratados Ativos" valor={dados.valor_servicos_ativos}
              subtitulo={`${dados.qtd_servicos_ativos} serviço${dados.qtd_servicos_ativos !== 1 ? 's' : ''} ativo${dados.qtd_servicos_ativos !== 1 ? 's' : ''}`}
              icon={Wrench} corIcone="#ffa300" />
      </div>

      {/* ── Perdas e Mau Uso — Cards ────────────────────────────────────────── */}
      <SecaoTitulo titulo="Perdas e Mau Uso" subtitulo="Filtrado pelo período selecionado" cor="#c2ff05" />
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Card titulo="Gasto Total com Perdas" valor={dados.gasto_total_perdas}
              subtitulo="Soma dos custos registrados"
              icon={Flame} corIcone="#c2ff05" />
        <Card titulo="Incidentes Registrados" valor={dados.total_incidentes}
              subtitulo="no período selecionado"
              icon={AlertTriangle} corIcone="#c2ff05" tipo="numero" />
      </div>

      {/* ── Gráficos 4 e 5 lado a lado ─────────────────────────────────────── */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <GraficoContainer titulo="Perdas por Tipo de Incidente" subtitulo="custo total por tipo" cor="#c2ff05">
          <GraficoPerdasPorTipo dados={dados.grafico_perdas_por_tipo ?? []} />
        </GraficoContainer>
        <GraficoContainer titulo="Evolução de Perdas" subtitulo="custo mensal no período" cor="#c2ff05">
          <GraficoEvolucaoPerdas dados={dados.grafico_evolucao_perdas ?? []} />
        </GraficoContainer>
      </div>

      {/* ── Alertas — Serviços Contratados Vencendo ─────────────────────────── */}
      <SecaoTitulo
        titulo="Alertas de Serviços Contratados"
        subtitulo="Vencendo nos próximos 30 dias · independente do filtro de período"
        cor="#ff0571"
      />
      <div className="mb-8">
        <AlertasServicos lista={dados.serv_vencendo ?? []} />
      </div>

      {/* ── Alertas — Certificados Vencendo ─────────────────────────────────── */}
      <SecaoTitulo
        titulo="Alertas de Certificados"
        subtitulo="Vencendo nos próximos 60 dias · independente do filtro de período"
        cor="#ffa300"
      />
      <div className="mb-8">
        <AlertasCertificados lista={dados.cert_vencendo ?? []} />
      </div>

    </div>
  );
}

export default Dashboard;