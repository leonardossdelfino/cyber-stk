// =============================================
// ARQUIVO: src/components/Layout.jsx
// FUNÇÃO: Estrutura base de todas as páginas
// Contém o menu lateral e a área de conteúdo
// O <Outlet /> é onde cada página é renderizada
// =============================================

import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard, // ícone do dashboard
  ShoppingCart,    // ícone das ordens de compra
  PlusCircle,      // ícone de nova OC
} from "lucide-react";

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-950">

      {/* ===== MENU LATERAL ===== */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">

        {/* Logo / Nome do sistema */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">💼 Cyber Finance</h1>
          <p className="text-xs text-gray-400 mt-1">Sistema Financeiro</p>
        </div>

        {/* Links de navegação */}
        <nav className="flex-1 p-4 space-y-1">

          {/* NavLink aplica classe ativa automaticamente quando a rota bate */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"           // estilo quando ativo
                  : "text-gray-400 hover:bg-gray-800 hover:text-white" // estilo normal
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
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <PlusCircle size={18} />
            Nova OC
          </NavLink>

        </nav>

        {/* Rodapé do menu */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">v1.0.0</p>
        </div>

      </aside>

      {/* ===== ÁREA DE CONTEÚDO ===== */}
      {/* O Outlet renderiza a página correspondente à rota atual */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;