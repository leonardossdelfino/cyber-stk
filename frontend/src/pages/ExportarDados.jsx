// =============================================================================
// Page: ExportarDados.jsx
// Responsabilidade: Página centralizada para exportação de dados em CSV
// =============================================================================

import { useState } from 'react';
import {
  Download, FileText, DollarSign, Shield, AlertTriangle,
  Receipt, CheckCircle, Loader2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost/cyber-stk/backend/api';

// -----------------------------------------------------------------------------
// Dados das exportações disponíveis
// -----------------------------------------------------------------------------
const EXPORTACOES = [
  {
    id:          'ordens_compra',
    titulo:      'Ordens de Compra',
    descricao:   'Exporta todas as OCs com fornecedor, valor, status e aprovação',
    icone:       FileText,
    cor:         '#ff0571',
    endpoint:    'exp_ordens_compra.php',
  },
  {
    id:          'contas_fixas',
    titulo:      'Contas Fixas',
    descricao:   'Exporta contas recorrentes com vencimento e categoria',
    icone:       Receipt,
    cor:         '#ffa300',
    endpoint:    'exp_contas_fixas.php',
  },
  {
    id:          'servicos_contratados',
    titulo:      'Serviços Contratados',
    descricao:   'Exporta serviços ativos com datas e responsáveis',
    icone:       DollarSign,
    cor:         '#00bfff',
    endpoint:    'exp_servicos_contratados.php',
  },
  {
    id:          'certificados_digitais',
    titulo:      'Certificados Digitais',
    descricao:   'Exporta certificados com tipo, titular e vencimento',
    icone:       Shield,
    cor:         '#1eff05',
    endpoint:    'exp_certificados_digitais.php',
  },
  {
    id:          'registros_perdas',
    titulo:      'Registros de Perdas',
    descricao:   'Exporta incidentes com tipo, pessoa, custo e ação tomada',
    icone:       AlertTriangle,
    cor:         '#c2ff05',
    endpoint:    'exp_registros_perdas.php',
  },
];

// -----------------------------------------------------------------------------
// Card de exportação
// -----------------------------------------------------------------------------
function CardExportacao({ exportacao, exportando, onExportar }) {
  const Icone = exportacao.icone;
  const estaExportando = exportando === exportacao.id;

  return (
    <div
      className="rounded-xl p-5 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,0.07)`,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: `${exportacao.cor}15`,
            border: `1px solid ${exportacao.cor}33`,
          }}
        >
          <Icone size={24} style={{ color: exportacao.cor }} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base mb-1">
            {exportacao.titulo}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {exportacao.descricao}
          </p>
        </div>

        {/* Botão */}
        <button
          onClick={() => onExportar(exportacao)}
          disabled={estaExportando}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 flex-shrink-0"
          style={{
            background: estaExportando ? 'rgba(255,255,255,0.04)' : `${exportacao.cor}15`,
            color: estaExportando ? 'rgba(255,255,255,0.35)' : exportacao.cor,
            border: `1px solid ${estaExportando ? 'rgba(255,255,255,0.08)' : exportacao.cor + '33'}`,
            cursor: estaExportando ? 'wait' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!estaExportando) {
              e.currentTarget.style.background = `${exportacao.cor}25`;
            }
          }}
          onMouseLeave={(e) => {
            if (!estaExportando) {
              e.currentTarget.style.background = `${exportacao.cor}15`;
            }
          }}
        >
          {estaExportando ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download size={16} />
              Exportar CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Página principal
// -----------------------------------------------------------------------------
export default function ExportarDados() {
  const [exportando, setExportando] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  async function handleExportar(exportacao) {
    setExportando(exportacao.id);
    setSucesso(null);

    try {
      // Faz requisição para o endpoint PHP
      const url = `${API_URL}/${exportacao.endpoint}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

      // Pega o blob do CSV
      const blob = await response.blob();
      
      // Cria um link de download temporário
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${exportacao.id}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Mostra mensagem de sucesso
      setSucesso(exportacao.id);
      setTimeout(() => setSucesso(null), 3000);

    } catch (error) {
      alert('Erro ao exportar dados. Tente novamente.');
      console.error('Erro na exportação:', error);
    } finally {
      setExportando(null);
    }
  }

  return (
    <div className="p-6" style={{ background: '#111111', minHeight: '100vh' }}>

      {/* Cabeçalho */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Exportar Dados</h2>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Exporte seus dados em formato CSV para análise externa
        </p>
      </div>

      {/* Mensagem de sucesso */}
      {sucesso && (
        <div
          className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse"
          style={{
            background: 'rgba(30,255,5,0.10)',
            border: '1px solid rgba(30,255,5,0.30)',
          }}
        >
          <CheckCircle size={20} style={{ color: '#1eff05' }} />
          <span className="text-sm font-medium" style={{ color: '#1eff05' }}>
            Arquivo exportado com sucesso!
          </span>
        </div>
      )}

      {/* Cards de exportação */}
      <div className="space-y-3">
        {EXPORTACOES.map((exp) => (
          <CardExportacao
            key={exp.id}
            exportacao={exp}
            exportando={exportando}
            onExportar={handleExportar}
          />
        ))}
      </div>

      {/* Informações adicionais */}
      <div
        className="mt-6 rounded-xl p-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <h3 className="text-white font-semibold text-sm mb-2">
          ℹ️ Sobre as exportações
        </h3>
        <ul className="space-y-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <li>• Os arquivos são gerados em tempo real com os dados atuais do sistema</li>
          <li>• Formato CSV com separador ponto-e-vírgula (;) compatível com Excel</li>
          <li>• Codificação UTF-8 para suporte completo de acentuação</li>
          <li>• Nome do arquivo inclui data e hora da exportação</li>
        </ul>
      </div>
    </div>
  );
}