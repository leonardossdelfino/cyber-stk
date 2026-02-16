// =============================================
// ARQUIVO: src/components/InputFornecedor.jsx
// FUNÇÃO: Input com autocomplete de fornecedores
// Compartilhado entre ModalOC e ModalContaFixa
//
// Props:
//   value       — string, valor atual do input
//   onChange    — função chamada com o novo valor
//   fornecedores — array opcional; se omitido, busca do banco automaticamente
// =============================================

import { useState, useEffect, useRef } from "react";
import { listarFornecedores } from "../services/api";
import { estiloInput, aoFocar, aoDesfocar } from "../styles/inputStyles";

function InputFornecedor({ value, onChange, fornecedores: fornecedoresProp }) {
  const [fornecedores, setFornecedores] = useState(fornecedoresProp ?? []);
  const [sugestoes, setSugestoes]       = useState([]);
  const [aberto, setAberto]             = useState(false);
  const wrapperRef                      = useRef(null);

  // Se não recebeu fornecedores via prop, busca do banco
  useEffect(() => {
    if (!fornecedoresProp) {
      listarFornecedores().then(setFornecedores).catch(() => {});
    }
  }, [fornecedoresProp]);

  // Sincroniza quando a prop muda (ex: ModalOC carrega depois do mount)
  useEffect(() => {
    if (fornecedoresProp) {
      setFornecedores(fornecedoresProp);
    }
  }, [fornecedoresProp]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    onChange(val);
    if (val.length > 0) {
      const filtrados = fornecedores.filter((f) =>
        f.razao_social.toLowerCase().includes(val.toLowerCase())
      );
      setSugestoes(filtrados);
      setAberto(filtrados.length > 0);
    } else {
      setSugestoes(fornecedores);
      setAberto(true);
    }
  };

  const handleFocus = (e) => {
    aoFocar(e);
    setSugestoes(fornecedores);
    setAberto(true);
  };

  const selecionar = (nome) => {
    onChange(nome);
    setAberto(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={handleFocus}
        onBlur={aoDesfocar}
        placeholder="Digite ou selecione o fornecedor"
        style={estiloInput}
        autoComplete="off"
      />
      {aberto && sugestoes.length > 0 && (
        <div
          style={{
            position:       "absolute",
            top:            "calc(100% + 4px)",
            left:           0,
            right:          0,
            zIndex:         100,
            background:     "rgba(14, 14, 14, 0.98)",
            border:         "1px solid rgba(255,5,113,0.20)",
            borderRadius:   "8px",
            backdropFilter: "blur(24px)",
            boxShadow:      "0 8px 32px rgba(0,0,0,0.70)",
            maxHeight:      "180px",
            overflowY:      "auto",
          }}
        >
          {sugestoes.map((f) => (
            <button
              key={f.id}
              type="button"
              onMouseDown={() => selecionar(f.razao_social)}
              className="w-full text-left px-4 py-2.5 text-sm transition-all duration-100"
              style={{ color: "rgba(255,255,255,0.75)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,5,113,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {f.razao_social}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default InputFornecedor;