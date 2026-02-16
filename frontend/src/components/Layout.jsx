// =============================================
// ARQUIVO: src/components/Layout.jsx
// FUNÇÃO: Menu lateral + área de conteúdo principal
// =============================================
import { useState } from "react";
import { Outlet, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Settings,
  ChevronDown, ChevronUp, Users, Tag, CreditCard,
  CheckSquare, ClipboardList, Cpu, AlertTriangle,
  Receipt, FileText, ShieldCheck,
} from "lucide-react";
import { VERSAO } from "../config/versao";

// Itens do submenu de configurações
const ITENS_CONFIG = [
  { aba: "fornecedores",     icon: Users,         label: "Fornecedores"        },
  { aba: "categorias",       icon: Tag,           label: "Categorias"          },
  { aba: "formas_pagamento", icon: CreditCard,    label: "Formas de Pagamento" },
  { aba: "status_aprovacao", icon: CheckSquare,   label: "Status de Aprovação" },
  { aba: "status_oc",        icon: ClipboardList, label: "Status da OC"        },
  { aba: "perifericos",      icon: Cpu,           label: "Periféricos"         },
  { aba: "incidentes",       icon: AlertTriangle, label: "Incidentes"          },
];

// Estilo de item de navegação ativo/inativo
const estiloNavItem = (isActive) => isActive
  ? {
      background: "rgba(255, 5, 113, 0.12)",
      color:      "#ff0571",
      border:     "1px solid rgba(255, 5, 113, 0.25)",
      boxShadow:  "0 0 12px rgba(255, 5, 113, 0.10)",
    }
  : {
      color:  "rgba(255,255,255,0.45)",
      border: "1px solid transparent",
    };

function Layout() {
  const [configAberto, setConfigAberto] = useState(false);
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="flex min-h-screen" style={{ background: "#111111" }}>

      {/* ===== MENU LATERAL ===== */}
      <aside className="w-64 flex flex-col flex-shrink-0"
        style={{ background: "#111111", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Logo */}
        <div className="p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none"
              xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <circle cx="50" cy="50" r="46" stroke="#ff0571" strokeWidth="4" fill="none" />
              <line x1="4" y1="50" x2="96" y2="50" stroke="#ff0571" strokeWidth="4" />
              <circle cx="35" cy="35" r="10" stroke="#ff0571" strokeWidth="3.5" fill="none" />
              <circle cx="35" cy="35" r="4" fill="#ff0571" />
              <line x1="52" y1="28" x2="76" y2="28" stroke="#ff0571" strokeWidth="3" strokeLinecap="round" />
              <line x1="58" y1="20" x2="78" y2="20" stroke="#ff0571" strokeWidth="3" strokeLinecap="round" />
              <line x1="55" y1="36" x2="72" y2="36" stroke="#ff0571" strokeWidth="3" strokeLinecap="round" />
              <line x1="62" y1="44" x2="76" y2="44" stroke="#ff0571" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="62" x2="50" y2="62" stroke="#ff0571" strokeWidth="3" strokeLinecap="round" />
              <line x1="26" y1="70" x2="58" y2="70" stroke="#ff0571" strokeWidth="3" strokeLinecap="round" />
              <line x1="20" y1="78" x2="52" y2="78" stroke="#ff0571" strokeWidth="3" strokeLinecap="round" />
              <line x1="30" y1="86" x2="60" y2="86" stroke="#ff0571" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h1 className="text-lg font-bold tracking-wide">
              <span style={{ color: "#ff0571" }}>Cyber</span>
              <span className="text-white"> Finance</span>
            </h1>
          </div>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Sistema Financeiro
          </p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1">

          {/* Dashboard */}
          <NavLink to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={({ isActive }) => estiloNavItem(isActive)}>
            {({ isActive }) => (
              <>
                <LayoutDashboard size={18} style={{ color: isActive ? "#ff0571" : "rgba(255,255,255,0.35)" }} />
                Dashboard
              </>
            )}
          </NavLink>

          {/* Ordens de Compra */}
          <NavLink to="/ordens"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={({ isActive }) => estiloNavItem(isActive)}>
            {({ isActive }) => (
              <>
                <ShoppingCart size={18} style={{ color: isActive ? "#ff0571" : "rgba(255,255,255,0.35)" }} />
                Ordens de Compra
              </>
            )}
          </NavLink>

          {/* Contas Fixas */}
          <NavLink to="/contas-fixas"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={({ isActive }) => estiloNavItem(isActive)}>
            {({ isActive }) => (
              <>
                <Receipt size={18} style={{ color: isActive ? "#ff0571" : "rgba(255,255,255,0.35)" }} />
                Contas Fixas
              </>
            )}
          </NavLink>

          {/* Serviços Contratados */}
          <NavLink to="/servicos-contratados"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={({ isActive }) => estiloNavItem(isActive)}>
            {({ isActive }) => (
              <>
                <FileText size={18} style={{ color: isActive ? "#ff0571" : "rgba(255,255,255,0.35)" }} />
                Serviços Contratados
              </>
            )}
          </NavLink>

          {/* Certificados Digitais */}
          <NavLink to="/certificados-digitais"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={({ isActive }) => estiloNavItem(isActive)}>
            {({ isActive }) => (
              <>
                <ShieldCheck size={18} style={{ color: isActive ? "#ff0571" : "rgba(255,255,255,0.35)" }} />
                Certificados Digitais
              </>
            )}
          </NavLink>

          {/* Configurações — dropdown */}
          <div>
            <button onClick={() => setConfigAberto(!configAberto)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color:      configAberto ? "#ffa300" : "rgba(255,255,255,0.45)",
                border:     configAberto ? "1px solid rgba(255,163,0,0.25)" : "1px solid transparent",
                background: configAberto ? "rgba(255,163,0,0.08)" : "transparent",
              }}>
              <Settings size={18} style={{ color: configAberto ? "#ffa300" : "rgba(255,255,255,0.35)" }} />
              <span className="flex-1 text-left">Configurações</span>
              {configAberto
                ? <ChevronUp   size={14} style={{ color: "#ffa300" }} />
                : <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
              }
            </button>

            {configAberto && (
              <div className="ml-4 mt-1 space-y-1">
                {ITENS_CONFIG.map(({ aba, icon: Icon, label }) => {
                  const ativo = searchParams.get("aba") === aba;
                  return (
                    <button key={aba}
                      onClick={() => navigate(`/configuracoes?aba=${aba}`)}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{
                        color:      ativo ? "#ffa300" : "rgba(255,255,255,0.4)",
                        background: ativo ? "rgba(255,163,0,0.10)" : "transparent",
                        border:     ativo ? "1px solid rgba(255,163,0,0.20)" : "1px solid transparent",
                      }}
                      onMouseEnter={e => { if (!ativo) { e.currentTarget.style.color = "#ffa300"; e.currentTarget.style.background = "rgba(255,163,0,0.06)"; }}}
                      onMouseLeave={e => { if (!ativo) { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Rodapé */}
        <div className="p-4 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            v{VERSAO}
          </p>
        </div>
      </aside>

      {/* ===== CONTEÚDO ===== */}
      <main className="flex-1 overflow-auto" style={{ background: "#111111" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;