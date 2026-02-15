// =============================================
// ARQUIVO: src/App.jsx
// FUNÇÃO: Roteamento principal da aplicação
// =============================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout        from "./components/Layout";
import Dashboard     from "./pages/Dashboard";
import ListagemOCs   from "./pages/ListagemOCs";
import Configuracoes from "./pages/Configuracoes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="ordens"        element={<ListagemOCs />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;