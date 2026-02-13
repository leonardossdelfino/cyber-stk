// =============================================
// ARQUIVO: src/components/Layout.jsx
// FUNÇÃO: Menu lateral + área de conteúdo principal
// Paleta v3 — fundo #111111 (void) em tudo
// =============================================

import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart } from "lucide-react";

function Layout() {
  return (
    <div className="flex min-h-screen bg-void">

      {/* ===== MENU LATERAL ===== */}
      <aside
        className="w-64 flex flex-col flex-shrink-0"
        style={{
          background: "#111111",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >

        {/* ── Logo ── */}
        <div
          className="p-6"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
        >
          {/* Nome com destaque pink */}
          <h1 className="text-lg font-bold tracking-wide">
            <span style={{ color: "#ff0571" }}>Cyber</span>
            <span className="text-white"> Finance</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Sistema Financeiro
          </p>
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 p-4 space-y-1">

          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={({ isActive }) =>
              isActive
                ? {
                    background: "rgba(255, 5, 113, 0.12)",
                    color: "#ff0571",
                    border: "1px solid rgba(255, 5, 113, 0.25)",
                    // leve glow no item ativo
                    boxShadow: "0 0 12px rgba(255, 5, 113, 0.10)",
                  }
                : {
                    color: "rgba(255,255,255,0.45)",
                    border: "1px solid transparent",
                  }
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard
                  size={18}
                  style={{ color: isActive ? "#ff0571" : "rgba(255,255,255,0.35)" }}
                />
                Dashboard
              </>
            )}
          </NavLink>

          {/* Ordens de Compra */}
          <NavLink
            to="/ordens"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={({ isActive }) =>
              isActive
                ? {
                    background: "rgba(255, 5, 113, 0.12)",
                    color: "#ff0571",
                    border: "1px solid rgba(255, 5, 113, 0.25)",
                    boxShadow: "0 0 12px rgba(255, 5, 113, 0.10)",
                  }
                : {
                    color: "rgba(255,255,255,0.45)",
                    border: "1px solid transparent",
                  }
            }
          >
            {({ isActive }) => (
              <>
                <ShoppingCart
                  size={18}
                  style={{ color: isActive ? "#ff0571" : "rgba(255,255,255,0.35)" }}
                />
                Ordens de Compra
              </>
            )}
          </NavLink>

        </nav>

        {/* ── Rodapé do menu ── */}
        <div
          className="p-4 text-center"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            v0.1.0
          </p>
        </div>

      </aside>

      {/* ===== ÁREA DE CONTEÚDO ===== */}
      <main className="flex-1 overflow-auto bg-void">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;