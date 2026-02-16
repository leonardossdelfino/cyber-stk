// =============================================
// ARQUIVO: src/components/ModalDocumentos.jsx
// =============================================

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Trash2, X, ExternalLink, Paperclip, Loader2 } from "lucide-react";
import { listarDocumentos, uploadDocumento, deletarDocumento } from "../services/api";
import {
  estiloOverlay, estiloModal, estiloHeader, estiloErro, estiloSucesso,
  estiloBtnFechar, estiloBtnFecharHover,
} from "../styles/modalStyles";

function ModalDocumentos({ oc, onFechar, onContadorAtualizado }) {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando,   setEnviando]   = useState(false);
  const [erro,       setErro]       = useState("");
  const [sucesso,    setSucesso]    = useState("");
  const inputRef = useRef(null);

  useEffect(() => { carregarDocumentos(); }, [oc.id]);

  const carregarDocumentos = async () => {
    try {
      setCarregando(true);
      const dados = await listarDocumentos(oc.id);
      setDocumentos(dados);
      onContadorAtualizado(oc.id, dados.length);
    } catch {
      setErro("Erro ao carregar documentos.");
    } finally {
      setCarregando(false);
    }
  };

  const handleUpload = async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    if (arquivo.type !== "application/pdf") return setErro("Apenas arquivos PDF são permitidos.");
    if (arquivo.size > 5 * 1024 * 1024)     return setErro("O arquivo deve ter no máximo 5MB.");
    try {
      setErro(""); setSucesso(""); setEnviando(true);
      await uploadDocumento(oc.id, arquivo);
      setSucesso("Documento anexado com sucesso!");
      await carregarDocumentos();
      inputRef.current.value = "";
    } catch {
      setErro("Erro ao enviar o documento.");
    } finally {
      setEnviando(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!confirm("Remover este documento?")) return;
    try {
      setErro(""); setSucesso("");
      await deletarDocumento(id);
      setSucesso("Documento removido.");
      await carregarDocumentos();
    } catch {
      setErro("Erro ao remover o documento.");
    }
  };

  const formatarData = (dataStr) =>
    new Date(dataStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div onClick={(e) => e.target === e.currentTarget && onFechar()} style={estiloOverlay}>
      <div style={estiloModal("520px")}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5" style={estiloHeader}>
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Paperclip size={16} style={{ color: "#00bfff" }} />
              Documentos da OC
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              #{oc.oc_numero} — {oc.oc_nome_fornecedor}
            </p>
          </div>
          <button onClick={onFechar}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={estiloBtnFechar}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, estiloBtnFecharHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, estiloBtnFechar)}>
            <X size={16} />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6">

          {erro    && <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={estiloErro}>{erro}</div>}
          {sucesso && <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={estiloSucesso}>{sucesso}</div>}

          {/* Lista */}
          {carregando ? (
            <div className="flex items-center justify-center py-10 gap-2">
              <Loader2 size={18} style={{ color: "#ff0571" }} className="animate-spin" />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Carregando...</span>
            </div>
          ) : documentos.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
              Nenhum documento anexado ainda.
            </p>
          ) : (
            <ul className="mb-4 space-y-2">
              {documentos.map((doc) => (
                <li key={doc.id}
                  className="flex items-center justify-between rounded-lg px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={16} style={{ color: "#00bfff", flexShrink: 0 }} />
                    <div className="overflow-hidden">
                      <p className="truncate text-sm text-white">{doc.nome_arquivo}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {formatarData(doc.criado_em)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-1">
                    <button onClick={() => window.open(doc.url, "_blank")}
                      className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.40)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#00bfff"; e.currentTarget.style.borderColor = "rgba(0,191,255,0.30)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.40)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                      title="Abrir documento">
                      <ExternalLink size={13} />
                    </button>
                    <button onClick={() => handleDeletar(doc.id)}
                      className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.40)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#ff0571"; e.currentTarget.style.borderColor = "rgba(255,5,113,0.30)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.40)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                      title="Remover documento">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Upload */}
          <input ref={inputRef} type="file" accept="application/pdf"
            className="hidden" onChange={handleUpload} />
          <button onClick={() => inputRef.current.click()} disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition-all duration-150"
            style={{
              background:  "rgba(255,255,255,0.03)",
              border:      "1px dashed rgba(255,255,255,0.15)",
              color:       "rgba(255,255,255,0.45)",
              cursor:      enviando ? "not-allowed" : "pointer",
              opacity:     enviando ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!enviando) { e.currentTarget.style.borderColor = "rgba(0,191,255,0.40)"; e.currentTarget.style.color = "#00bfff"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
            <Upload size={15} />
            {enviando ? "Enviando..." : "Adicionar documento PDF"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default ModalDocumentos;