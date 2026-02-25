// =============================================================================
// ARQUIVO: src/pages/CertificadosDigitais.jsx
// FUNÇÃO: Listagem de certificados digitais com cards visuais
// Lógica de dados em useCertificado.js
// =============================================================================

import { useState } from "react";
import {
  Plus, Pencil, Trash2, Loader2, RefreshCw,
  ShieldCheck, Calendar, User, Tag,
  CheckCircle, XCircle, RotateCcw, AlertTriangle,
} from "lucide-react";
import { useCertificado } from "../hooks/useCertificado";
import ModalCertificadoDigital from "../components/ModalCertificadoDigital";

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------
const STATUS_CONFIG = {
  "Ativo":    { cor: "#1eff05", bg: "rgba(30,255,5,0.10)",    icon: CheckCircle  },
  "Vencido":  { cor: "#ff0571", bg: "rgba(255,5,113,0.10)",   icon: XCircle      },
  "Revogado": { cor: "#ff4444", bg: "rgba(255,68,68,0.10)",   icon: XCircle      },
  "Renovado": { cor: "#00bfff", bg: "rgba(0,191,255,0.10)",   icon: RotateCcw    },
};

const STATUS_FILTROS = ["Todos", "Ativo", "Vencido", "Revogado", "Renovado"];

const formatarValor = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatarData = (data) => {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
};

const diasParaVencimento = (dataVenc) => {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataVenc); venc.setHours(0, 0, 0, 0);
  return Math.round((venc - hoje) / (1000 * 60 * 60 * 24));
};

// -----------------------------------------------------------------------------
// Alerta de vencimento
// -----------------------------------------------------------------------------
function AlertaVencimento({ dataVencimento, status }) {
  if (status !== "Ativo") return null;
  const dias = diasParaVencimento(dataVencimento);
  if (dias < 0) return (
    <p className="text-xs font-semibold mt-0.5" style={{ color: "#ff4444" }}>
      ⚠ Vencido há {Math.abs(dias)} dia{Math.abs(dias) !== 1 ? "s" : ""}
    </p>
  );
  if (dias <= 60) return (
    <p className="text-xs font-semibold mt-0.5" style={{ color: "#ffa300" }}>
      ⚠ Vence em {dias} dia{dias !== 1 ? "s" : ""}
    </p>
  );
  return null;
}

// -----------------------------------------------------------------------------
// Card de certificado
// -----------------------------------------------------------------------------
function CardCertificado({ cert, onEditar, onDeletar, deletando }) {
  const statusCfg  = STATUS_CONFIG[cert.status] ?? STATUS_CONFIG["Ativo"];
  const StatusIcon = statusCfg.icon;
  const dias       = diasParaVencimento(cert.data_vencimento);
  const vencido    = cert.status === "Ativo" && dias < 0;
  const proxVencer = cert.status === "Ativo" && dias >= 0 && dias <= 60;

  const borderColor = vencido
    ? "rgba(255,68,68,0.40)"
    : proxVencer
      ? "rgba(255,163,0,0.40)"
      : "rgba(255,255,255,0.07)";

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${borderColor}` }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = vencido ? "rgba(255,68,68,0.60)" : proxVencer ? "rgba(255,163,0,0.60)" : "rgba(255,255,255,0.14)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = borderColor}
    >
      {/* Topo */}
      <div className="flex items-start justify-between gap-2">
        <div className="overflow-hidden">
          <p className="font-semibold text-white truncate">{cert.nome}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.40)" }}>
            {cert.tipo}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: statusCfg.bg, color: statusCfg.cor }}
          >
            <StatusIcon size={11} />
            {cert.status}
          </span>
          <button onClick={() => onEditar(cert.id)}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,163,0,0.12)"; e.currentTarget.style.borderColor = "rgba(255,163,0,0.30)"; e.currentTarget.style.color = "#ffa300"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
          >
            <Pencil size={13} />
          </button>
          <button onClick={() => onDeletar(cert.id)} disabled={deletando === cert.id}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", cursor: deletando === cert.id ? "wait" : "pointer" }}
            onMouseEnter={(e) => { if (deletando !== cert.id) { e.currentTarget.style.background = "rgba(255,5,113,0.12)"; e.currentTarget.style.borderColor = "rgba(255,5,113,0.30)"; e.currentTarget.style.color = "#ff0571"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
          >
            {deletando === cert.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      {/* Valor pago */}
      {cert.valor_pago && (
        <div>
          <p className="text-2xl font-bold" style={{ color: "#c2ff05" }}>
            {formatarValor(cert.valor_pago)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>valor pago</p>
        </div>
      )}

      {/* Detalhes */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Calendar, color: "#00bfff", label: "Emissão",    valor: formatarData(cert.data_emissao),    extra: null },
          { icon: Calendar, color: "#ff0571", label: "Vencimento", valor: formatarData(cert.data_vencimento), extra: <AlertaVencimento dataVencimento={cert.data_vencimento} status={cert.status} /> },
          { icon: User,     color: "#ffa300", label: "Responsável", valor: cert.responsavel || "—", extra: null },
          { icon: Tag,      color: "#b1ff00", label: "Área",        valor: cert.area || "—",         extra: null },
        ].map(({ icon: Icon, color, label, valor, extra }) => (
          <div key={label}
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Icon size={13} style={{ color, flexShrink: 0 }} />
            <div className="overflow-hidden">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
              <p className="text-sm font-medium text-white truncate">{valor}</p>
              {extra}
            </div>
          </div>
        ))}
      </div>

      {/* Descrição */}
      {cert.descricao && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <ShieldCheck size={13} style={{ color: "rgba(255,255,255,0.30)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.5" }}>
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
function CertificadosDigitais() {
  const {
    certificados, loading, deletando, erro,
    filtroStatus, setFiltroStatus,
    carregarCertificados, handleDeletar,
    certificadosFiltrados, totalAlertas,
  } = useCertificado();

  const [modalAberto,   setModalAberto]   = useState(false);
  const [certEditando,  setCertEditando]  = useState(null);

  const abrirModal  = ()    => { setCertEditando(null); setModalAberto(true); };
  const abrirEdicao = (id)  => { setCertEditando(id);   setModalAberto(true); };
  const fecharModal = ()    => { setModalAberto(false); setCertEditando(null); };
  const aoSalvar    = ()    => { fecharModal(); carregarCertificados(); };

  return (
    <div className="p-6" style={{ background: "#111111", minHeight: "100vh" }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Certificados Digitais</h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {certificados.length} certificado{certificados.length !== 1 ? "s" : ""} cadastrado{certificados.length !== 1 ? "s" : ""}
            {totalAlertas > 0 && (
              <span className="ml-2 font-semibold" style={{ color: "#ffa300" }}>
                · {totalAlertas} com alerta de vencimento
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={carregarCertificados}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
          >
            <RefreshCw size={15} />
          </button>
          <button onClick={abrirModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{ background: "#ff0571", color: "#ffffff", border: "1px solid rgba(255,5,113,0.50)", boxShadow: "0 0 20px rgba(255,5,113,0.25)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e0044f"; e.currentTarget.style.boxShadow = "0 0 28px rgba(255,5,113,0.40)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ff0571"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,5,113,0.25)"; }}
          >
            <Plus size={16} />
            Novo Certificado
          </button>
        </div>
      </div>

      {/* Card total */}
      <div className="rounded-xl p-5 mb-6 flex items-center justify-between"
        style={{ background: "rgba(194,255,5,0.05)", border: "1px solid rgba(194,255,5,0.15)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(194,255,5,0.60)" }}>
            Certificados Ativos
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#c2ff05" }}>
            {certificados.filter((c) => c.status === "Ativo").length}
          </p>
        </div>
        <ShieldCheck size={40} style={{ color: "rgba(194,255,5,0.15)" }} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {STATUS_FILTROS.map((s) => {
          const ativo = filtroStatus === s;
          const cfg   = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={{
                background: ativo ? (cfg ? cfg.bg  : "rgba(255,5,113,0.12)") : "rgba(255,255,255,0.04)",
                color:      ativo ? (cfg ? cfg.cor : "#ff0571")               : "rgba(255,255,255,0.40)",
                border:     ativo ? `1px solid ${cfg ? cfg.cor : "#ff0571"}44` : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {s}
              {s !== "Todos" && (
                <span className="ml-1 opacity-60">
                  ({certificados.filter((c) => c.status === s).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2">
          <Loader2 size={20} style={{ color: "#ff0571" }} className="animate-spin" />
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Carregando...</span>
        </div>
      ) : erro ? (
        <div className="text-center py-12 text-sm" style={{ color: "#ff4444" }}>{erro}</div>
      ) : certificadosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl text-center gap-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ShieldCheck size={36} style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.30)" }}>
            {filtroStatus === "Todos"
              ? "Nenhum certificado cadastrado ainda."
              : `Nenhum certificado com status "${filtroStatus}".`}
          </p>
          {filtroStatus === "Todos" && (
            <button onClick={abrirModal}
              className="text-xs px-4 py-2 rounded-lg transition"
              style={{ background: "rgba(255,5,113,0.12)", color: "#ff0571", border: "1px solid rgba(255,5,113,0.25)" }}>
              Criar primeiro certificado
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {certificadosFiltrados.map((cert) => (
            <CardCertificado
              key={cert.id}
              cert={cert}
              onEditar={abrirEdicao}
              onDeletar={handleDeletar}
              deletando={deletando}
            />
          ))}
        </div>
      )}

      {modalAberto && (
        <ModalCertificadoDigital
          certId={certEditando}
          onSucesso={aoSalvar}
          onFechar={fecharModal}
        />
      )}

    </div>
  );
}

export default CertificadosDigitais;