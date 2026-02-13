// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard    from "./pages/Dashboard";
import ListagemOCs  from "./pages/ListagemOCs";
import Layout       from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* Listagem gerencia o modal internamente */}
          <Route path="ordens"    element={<ListagemOCs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;