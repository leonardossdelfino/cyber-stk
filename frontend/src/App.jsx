// =============================================
// ARQUIVO: src/App.jsx
// FUNÇÃO: Roteamento principal da aplicação
// =============================================
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout               from "./components/Layout";
import Dashboard            from "./pages/Dashboard";
import ListagemOCs          from "./pages/ListagemOCs";
import Configuracoes        from "./pages/Configuracoes";
import ContasFixas          from "./pages/ContasFixas";
import ServicosContratados  from "./pages/ServicosContratados";
import CertificadosDigitais from "./pages/CertificadosDigitais";
import RegistrosPerdas      from "./pages/RegistrosPerdas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"              element={<Dashboard />} />
          <Route path="ordens"                 element={<ListagemOCs />} />
          <Route path="configuracoes"          element={<Configuracoes />} />
          <Route path="contas-fixas"           element={<ContasFixas />} />
          <Route path="servicos-contratados"   element={<ServicosContratados />} />
          <Route path="certificados-digitais"  element={<CertificadosDigitais />} />
          <Route path="registros-perdas"       element={<RegistrosPerdas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;