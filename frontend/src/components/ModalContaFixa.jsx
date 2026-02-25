// =============================================
// ARQUIVO: src/components/ModalContaFixa.jsx
// =============================================

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import {
  buscarContaFixa, criarContaFixa,
  atualizarContaFixa, listarConfiguracao,
} from "../services/api";
import InputFornecedor from "./InputFornecedor";
import Campo from "./CampoFormulario";
import { estiloInput, aoFocar, aoDesfocar } from "../styles/inputStyles";
import {
  estiloOverlay, estiloModal, estiloHeader, estiloFooter,
  estiloBtnFechar, estiloBtnFecharHover,
  estiloBtnCancelar, estiloBtnSalvar, estiloErro,
} from "../styles/modalStyles";

const STATUS_OPCOES = ["Ativa", "Inativa", "Cancelada"];

const FORM_INICIAL = {
  nome: "", fornecedor: "", valor: "", dia_vencimento: "",
  dia_fechamento: "", forma_pagamento: "", categoria: "",
  status: "Ativa", observacoes: "",
};

function ModalContaFixa({ contaId, onFechar, onSalvo }) {
  const [form,           setForm]           = useState(FORM_INICIAL);
  const [categorias,     setCategorias]     = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
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

        const [cats, formas] = await Promise.all([
          listarConfiguracao("categorias"),
          listarConfiguracao("formas_pagamento"),
        ]);

        setCategorias(cats);
        setFormasPagamento(formas);

        if (contaId) {
          // Modo edição — contas_fixas.php retorna { success, data }
          const res = await buscarContaFixa(contaId);
          if (!res?.success) {
            setErro("Conta não encontrada.");
            return;
          }
          const conta = res.data;
          setForm({
            nome:            conta.nome,
            fornecedor:      conta.fornecedor,
            valor:           conta.valor,
            dia_vencimento:  conta.dia_vencimento,
            dia_fechamento:  conta.dia_fechamento ?? "",
            forma_pagamento: conta.forma_pagamento,
            categoria:       conta.categoria,
            status:          conta.status,
            observacoes:     conta.observacoes ?? "",
          });
        } else {
          // Modo criação — preenche defaults com primeiro item de cada lista
          setForm((prev) => ({
            ...prev,
            categoria:       cats.length  > 0 ? cats[0].nome   : "",
            forma_pagamento: formas.length > 0 ? formas[0].nome : "",
          }));
        }
      } catch {
        setErro("Erro ao carregar dados.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [contaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim())                        return setErro("Nome é obrigatório.");
    if (!form.fornecedor.trim())                  return setErro("Fornecedor é obrigatório.");
    if (!form.valor || isNaN(Number(form.valor))) return setErro("Valor inválido.");
    if (Number(form.valor) < 0)                   return setErro("Valor não pode ser negativo.");
    if (!form.dia_vencimento)                     return setErro("Dia de vencimento é obrigatório.");
    if (!form.categoria)                          return setErro("Categoria é obrigatória.");
    if (!form.forma_pagamento)                    return setErro("Forma de pagamento é obrigatória.");

    try {
      setSalvando(true);
      const res = contaId
        ? await atualizarContaFixa(contaId, form)
        : await criarContaFixa(form);

      if (res?.success) {
        onSalvo();
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
      <div style={estiloModal("640px")}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5" style={estiloHeader}>
          <div>
            <h2 className="text-base font-semibold text-white">
              {contaId ? "Editar Conta Fixa" : "Nova Conta Fixa"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Preencha os dados da conta recorrente
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
              Identificação
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Campo label="Nome da Conta" obrigatorio>
                <input name="nome" value={form.nome} onChange={handleChange}
                  placeholder="Ex: Internet Vivo" style={estiloInput}
                  onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Fornecedor" obrigatorio>
                <InputFornecedor
                  value={form.fornecedor}
                  onChange={(val) => { setForm((prev) => ({ ...prev, fornecedor: val })); setErro(""); }}
                />
              </Campo>
              <Campo label="Categoria" obrigatorio>
                <select name="categoria" value={form.categoria} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nome} style={{ background: "#141414" }}>{cat.nome}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Valor Mensal (R$)" obrigatorio>
                <input name="valor" type="number" step="0.01" min="0"
                  value={form.valor} onChange={handleChange} placeholder="0.00"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
            </div>

            {/* Seção 2 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#ffa300" }}>
              Datas e Pagamento
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Campo label="Dia de Vencimento" obrigatorio>
                <input name="dia_vencimento" type="number" min="1" max="31"
                  value={form.dia_vencimento} onChange={handleChange} placeholder="Ex: 10"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Dia de Fechamento">
                <input name="dia_fechamento" type="number" min="1" max="31"
                  value={form.dia_fechamento} onChange={handleChange} placeholder="Ex: 5 (opcional)"
                  style={estiloInput} onFocus={aoFocar} onBlur={aoDesfocar} />
              </Campo>
              <Campo label="Forma de Pagamento" obrigatorio>
                <select name="forma_pagamento" value={form.forma_pagamento} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  {formasPagamento.map((f) => (
                    <option key={f.id} value={f.nome} style={{ background: "#141414" }}>{f.nome}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Status">
                <select name="status" value={form.status} onChange={handleChange}
                  style={{ ...estiloInput, cursor: "pointer" }} onFocus={aoFocar} onBlur={aoDesfocar}>
                  {STATUS_OPCOES.map((s) => (
                    <option key={s} value={s} style={{ background: "#141414" }}>{s}</option>
                  ))}
                </select>
              </Campo>
            </div>

            {/* Seção 3 */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#c2ff05" }}>
              Observações
            </p>
            <div className="mb-6">
              <Campo label="Observações">
                <textarea name="observacoes" value={form.observacoes} onChange={handleChange}
                  placeholder="Informações adicionais..." rows={3}
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
                {salvando ? "Salvando..." : contaId ? "Salvar Alterações" : "Criar Conta"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default ModalContaFixa;