// =============================================================================
// ARQUIVO: src/components/ModalRegistroPerda.jsx
// FUNÇÃO: Modal de criação e edição de registros de perdas e mau uso
// =============================================================================

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import {
  buscarPerda, criarPerda, atualizarPerda,
  listarConfiguracao,
} from "../services/api";
import Campo from "./CampoFormulario";
import { estiloInput, aoFocar, aoDesfocar } from "../styles/inputStyles";
import {
  estiloOverlay, estiloModal, estiloHeader, estiloFooter,
  estiloBtnFechar, estiloBtnFecharHover,
  estiloBtnCancelar, estiloBtnSalvar, estiloErro,
} from "../styles/modalStyles";

const HOJE = new Date().toISOString().split("T")[0];

const FORM_INICIAL = {
  tipo: "", nome_pessoa: "", area: "", chamado_os: "",
  periferico: "", descricao: "", custo: "",
  acao_tomada: "", data_incidente: HOJE,
};

function ModalRegistroPerda({ perdaId, onSucesso, onFechar }) {
  const editando = Boolean(perdaId);

  const [form,           setForm]           = useState(FORM_INICIAL);
  const [tiposIncidente, setTiposIncidente] = useState([]);
  const [perifericos,    setPerifericos]    = useState([]);
  const [acoesIncidente, setAcoesIncidente] = useState([]);
  const [salvando,       setSalvando]       = useState(false);
  const [carregando,     setCarregando]     = useState(false);
  const [erro,           setErro]           = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro("");

        const [tipos, peri, acoes, perdaRes] = await Promise.all([
          listarConfiguracao("incidentes"),
          listarConfiguracao("perifericos"),
          listarConfiguracao("acoes_incidente"),
          editando ? buscarPerda(perdaId) : Promise.resolve(null),
        ]);

        setTiposIncidente(Array.isArray(tipos) ? tipos : []);
        setPerifericos(Array.isArray(peri) ? peri : []);
        setAcoesIncidente(Array.isArray(acoes) ? acoes : []);

        if (editando) {
          if (!perdaRes?.success) {
            setErro("Registro não encontrado.");
            return;
          }
          const r = perdaRes.data;
          setForm({
            tipo:           r.tipo           ?? "",
            nome_pessoa:    r.nome_pessoa    ?? "",
            area:           r.area           ?? "",
            chamado_os:     r.chamado_os     ?? "",
            periferico:     r.periferico     ?? "",
            descricao:      r.descricao      ?? "",
            custo:          r.custo          ?? "",
            acao_tomada:    r.acao_tomada    ?? "",
            data_incidente: r.data_incidente ?? HOJE,
          });
        } else {
          // Modo criação — preenche defaults com primeiro item de cada lista
          setForm((prev) => ({
            ...prev,
            tipo:        tipos.length > 0 ? tipos[0].descricao : "",
            acao_tomada: acoes.length > 0 ? acoes[0].nome      : "",
          }));
        }
      } catch {
        setErro("Erro ao carregar dados.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [editando, perdaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.tipo)           return setErro("Tipo do incidente é obrigatório.");
    if (!form.nome_pessoa.trim()) return setErro("Nome da pessoa é obrigatório.");
    if (!form.area.trim())    return setErro("Área é obrigatória.");
    if (!form.acao_tomada)    return setErro("Ação tomada é obrigatória.");
    if (!form.data_incidente) return setErro("Data do incidente é obrigatória.");

    try {
      setSalvando(true);
      const res = editando
        ? await atualizarPerda(perdaId, form)
        : await criarPerda(form);

      if (res?.success) {
        onSucesso();
      } else {
        setErro(res?.message || "Erro ao salvar. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão com a API.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onFechar()} style={estiloOverlay}>
      <div style={estiloModal("580px")}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5" style={estiloHeader}>
          <div>
            <h2 className="text-base font-semibold text-white">
              {editando ? "Editar Registro de Perda" : "Novo Registro de Perda"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Preencha os dados do incidente
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
        {carregando ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} style={{ color: "#ff0571" }} className="animate-spin" />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Carregando...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">

            {erro && <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={estiloErro}>{erro}</div>}

            {/* Seção 1 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#ff0571" }}>
              Incidente
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Campo label="Tipo do Incidente" obrigatorio>
                <select name="tipo" value={form.tipo} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  <option value="">Selecione</option>
                  {tiposIncidente.map((t) => (
                    <option key={t.id} value={t.descricao} style={{ background: "#141414" }}>{t.descricao}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Data do Incidente" obrigatorio>
                <input name="data_incidente" type="date" value={form.data_incidente}
                  onChange={handleChange}
                  style={{ ...estiloInput, colorScheme: "dark" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Nome da Pessoa" obrigatorio>
                <input name="nome_pessoa" value={form.nome_pessoa} onChange={handleChange}
                  placeholder="Ex: João Silva"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Área / Setor" obrigatorio>
                <input name="area" value={form.area} onChange={handleChange}
                  placeholder="Ex: Financeiro"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
            </div>

            {/* Seção 2 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#ffa300" }}>
              Detalhes
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Campo label="Chamado / OS">
                <input name="chamado_os" value={form.chamado_os} onChange={handleChange}
                  placeholder="Ex: #12345"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Custo do Incidente (R$)">
                <input name="custo" type="number" min="0" step="0.01"
                  value={form.custo} onChange={handleChange} placeholder="0,00"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Periférico Envolvido">
                <select name="periferico" value={form.periferico} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  <option value="">Nenhum</option>
                  {perifericos.map((p) => (
                    <option key={p.id} value={p.descricao} style={{ background: "#141414" }}>
                      {p.descricao}{p.marca ? ` — ${p.marca}` : ""}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Ação Tomada" obrigatorio>
                <select name="acao_tomada" value={form.acao_tomada} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  <option value="">Selecione</option>
                  {acoesIncidente.map((a) => (
                    <option key={a.id} value={a.nome} style={{ background: "#141414" }}>{a.nome}</option>
                  ))}
                </select>
              </Campo>
            </div>

            {/* Seção 3 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#c2ff05" }}>
              Descrição
            </p>
            <div className="mb-6">
              <Campo label="Descrição do Ocorrido">
                <textarea name="descricao" value={form.descricao} onChange={handleChange}
                  placeholder="Descreva o que aconteceu..." rows={3}
                  style={{ ...estiloInput, resize: "vertical" }}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-5" style={estiloFooter}>
              <button type="button" onClick={onFechar}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={estiloBtnCancelar}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}>
                Cancelar
              </button>
              <button type="submit" disabled={salvando}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={estiloBtnSalvar(salvando)}>
                {salvando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {salvando ? "Salvando..." : editando ? "Salvar Alterações" : "Criar Registro"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default ModalRegistroPerda;