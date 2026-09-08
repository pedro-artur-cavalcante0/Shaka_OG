import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { fazerRequisicaoSupabase } from './lib/supabase.js';
import { useToast } from './hooks/useToast.js';
import { useAuth } from './hooks/useAuth.js';

import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Termos from './pages/Termos.jsx';
import Privacidade from './pages/Privacidade.jsx';
import Contato from './pages/Contato.jsx';
import Perfil from './pages/Profile.jsx';

export default function App() {
  const { toast, mostrarToast } = useToast();
 const {usuario, usuarioId, autenticar, logout, atualizarUsuario} = useAuth(mostrarToast);

  const [praias, setPraias] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [modalLoginAberto, setModalLoginAberto] = useState(false);
  const [modalServicoAberto, setModalServicoAberto] = useState(false);

  const carregarServicos = useCallback(async () => {
    const data = await fazerRequisicaoSupabase(
      'servico',
      'order=id.desc'
    );

    setServicos(data || []);
  }, []);

  useEffect(() => {
    fazerRequisicaoSupabase(
      'praia',
      'order=nivel_popularidade.desc'
    ).then((data) => {
      if (data) setPraias(data);
    });

    carregarServicos();
  }, [carregarServicos]);

  const layoutProps = {
    usuario,
    toast,
    modalLoginAberto,
    modalServicoAberto,

    onLoginClick: () => setModalLoginAberto(true),

    onLogout: logout,

    onFecharLogin: () => setModalLoginAberto(false),

    onFecharServico: () => setModalServicoAberto(false),

    autenticar,

    onServicoCriado: carregarServicos,

    mostrarToast,
  };

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <Layout {...layoutProps}>
              <Home
                praias={praias}
                servicos={servicos}
                usuario={usuario}
                usuarioId={usuarioId}
                onExigirLogin={() => setModalLoginAberto(true)}
                onNovoServico={() => setModalServicoAberto(true)}
                mostrarToast={mostrarToast}
              />
            </Layout>
          }
        />

    <Route
  path="/profile"
  element={
    <Layout {...layoutProps}>
      <Perfil
        usuario={usuario}
        onLogout={logout}
        mostrarToast={mostrarToast}
        atualizarUsuario={atualizarUsuario}
      />
    </Layout>
  }
/>

        <Route
          path="/termos"
          element={
            <Layout {...layoutProps}>
              <Termos />
            </Layout>
          }
        />

        <Route
          path="/privacidade"
          element={
            <Layout {...layoutProps}>
              <Privacidade />
            </Layout>
          }
        />

        <Route
          path="/contato"
          element={
            <Layout {...layoutProps}>
              <Contato />
            </Layout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}