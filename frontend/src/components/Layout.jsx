// src/components/Layout.jsx
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, PlusCircle } from "lucide-react";

function Layout() {
  return (
    // bg-onyx = #0c090d em tudo
    <div className="flex min-h-screen bg-onyx">

      {/* ===== MENU LATERAL ===== */}
      <aside className="w-64 bg-onyx border-r border-onyx-600 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-onyx-600">
          <h1 className="text-xl font-bold text-white">💼 Cyber Finance</h1>
          <p className="text-xs text-onyx-900 mt-1">Sistema Financeiro</p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amaranth text-white"
                  : "text-onyx-900 hover:bg-onyx-600 hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/ordens"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amaranth text-white"
                  : "text-onyx-900 hover:bg-onyx-600 hover:text-white"
              }`
            }
          >
            <ShoppingCart size={18} />
            Ordens de Compra
          </NavLink>

          <NavLink
            to="/ordens/nova"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amaranth text-white"
                  : "text-onyx-900 hover:bg-onyx-600 hover:text-white"
              }`
            }
          >
            <PlusCircle size={18} />
            Nova OC
          </NavLink>

        </nav>

        {/* Rodapé */}
        <div className="p-4 border-t border-onyx-600">
          <p className="text-xs text-onyx-900 text-center">v1.0.0</p>
        </div>

      </aside>

      {/* ===== CONTEÚDO ===== */}
      <main className="flex-1 overflow-auto bg-onyx">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;