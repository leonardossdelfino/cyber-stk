// src/components/Layout.jsx
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart } from "lucide-react";

function Layout() {
  return (
    <div className="flex min-h-screen bg-carbon">

      {/* ===== MENU LATERAL ===== */}
      <aside className="w-64 bg-carbon border-r border-carbon-600 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-carbon-600">
          <h1 className="text-xl font-bold text-white">💼 Cyber Finance</h1>
          <p className="text-xs text-carbon-800 mt-1">Sistema Financeiro</p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-flame text-carbon font-semibold"
                  : "text-carbon-800 hover:bg-carbon-600 hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/ordens"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-flame text-carbon font-semibold"
                  : "text-carbon-800 hover:bg-carbon-600 hover:text-white"
              }`
            }
          >
            <ShoppingCart size={18} />
            Ordens de Compra
          </NavLink>

        </nav>

        {/* Rodapé */}
        <div className="p-4 border-t border-carbon-600">
          <p className="text-xs text-carbon-700 text-center">v1.0.0</p>
        </div>

      </aside>

      {/* ===== CONTEÚDO ===== */}
      <main className="flex-1 overflow-auto bg-carbon">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;