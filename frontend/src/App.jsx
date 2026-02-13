// =============================================
// ARQUIVO: src/App.jsx
// FUNÇÃO: Componente raiz — define as rotas da aplicação
// Cada rota aponta para uma página diferente
// =============================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importação das páginas (vamos criar em seguida)
import Dashboard from "./pages/Dashboard";
import ListagemOCs from "./pages/ListagemOCs";
import FormularioOC from "./pages/FormularioOC";

// Importação do layout base (menu lateral + estrutura)
import Layout from "./components/Layout";

function App() {
  return (
    // BrowserRouter habilita a navegação por URL no React
    <BrowserRouter>
      <Routes>

        {/* Todas as rotas ficam dentro do Layout (menu + estrutura) */}
        <Route path="/" element={<Layout />}>

          {/* Rota raiz redireciona para o dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard — página inicial com indicadores */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Listagem de todas as OCs */}
          <Route path="ordens" element={<ListagemOCs />} />

          {/* Formulário para criar nova OC */}
          <Route path="ordens/nova" element={<FormularioOC />} />

          {/* Formulário para editar OC existente — :id é o ID da OC */}
          <Route path="ordens/:id" element={<FormularioOC />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;