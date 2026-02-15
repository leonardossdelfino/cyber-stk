// =============================================
// COMPONENTE: ModalDocumentos
// FUNÇÃO: Gerencia documentos anexados a uma OC
// =============================================

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Trash2, X, ExternalLink, Paperclip } from "lucide-react";
import { listarDocumentos, uploadDocumento, deletarDocumento } from "../services/api";

const ModalDocumentos = ({ oc, onFechar, onContadorAtualizado }) => {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando]     = useState(false);
  const [erro, setErro]             = useState("");
  const [sucesso, setSucesso]       = useState("");
  const inputRef                    = useRef(null);

  useEffect(() => {
    carregarDocumentos();
  }, [oc.id]);

  const carregarDocumentos = async () => {
    try {
      setCarregando(true);
      const dados = await listarDocumentos(oc.id);
      setDocumentos(dados);
      onContadorAtualizado(oc.id, dados.length);
    } catch (err) {
      setErro("Erro ao carregar documentos.");
    } finally {
      setCarregando(false);
    }
  };

  const handleUpload = async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    if (arquivo.type !== "application/pdf") {
      setErro("Apenas arquivos PDF são permitidos.");
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("O arquivo deve ter no máximo 5MB.");
      return;
    }

    try {
      setErro("");
      setSucesso("");
      setEnviando(true);
      await uploadDocumento(oc.id, arquivo);
      setSucesso("Documento anexado com sucesso!");
      await carregarDocumentos();
      inputRef.current.value = "";
    } catch (err) {
      setErro("Erro ao enviar o documento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!confirm("Remover este documento?")) return;

    try {
      setErro("");
      setSucesso("");
      await deletarDocumento(id);
      setSucesso("Documento removido.");
      await carregarDocumentos();
    } catch (err) {
      setErro("Erro ao remover o documento.");
    }
  };

  const formatarData = (dataStr) => {
    const data = new Date(dataStr);
    return data.toLocaleDateString("pt-BR", {
      day:    "2-digit",
      month:  "2-digit",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Paperclip size={18} className="text-[#00bfff]" />
              Documentos da OC
            </h2>
            <p className="mt-0.5 text-sm text-white/40">
              #{oc.oc_numero} — {oc.oc_nome_fornecedor}
            </p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo */}
        <div className="px-6 py-4">

          {/* Mensagens de feedback */}
          {erro && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-400">
              {sucesso}
            </div>
          )}

          {/* Lista de documentos */}
          {carregando ? (
            <p className="py-6 text-center text-sm text-white/40">Carregando...</p>
          ) : documentos.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">
              Nenhum documento anexado ainda.
            </p>
          ) : (
            <ul className="mb-4 space-y-2">
              {documentos.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                >
                  {/* Ícone + nome do arquivo */}
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={18} className="shrink-0 text-[#00bfff]" />
                    <div className="overflow-hidden">
                      <p className="truncate text-sm text-white">
                        {doc.nome_arquivo}
                      </p>
                      <p className="text-xs text-white/40">
                        {formatarData(doc.criado_em)}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => window.open(doc.url, '_blank')}
                      className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-[#00bfff]"
                      title="Abrir documento"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletar(doc.id)}
                      className="rounded-lg p-1.5 text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
                      title="Remover documento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Botão de upload */}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => inputRef.current.click()}
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-white/60 transition hover:border-[#00bfff]/50 hover:bg-[#00bfff]/5 hover:text-[#00bfff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={16} />
            {enviando ? "Enviando..." : "Adicionar documento PDF"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ModalDocumentos;