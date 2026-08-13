import { useCallback, useEffect, useState } from 'react';
import { fazerRequisicaoSupabase } from './lib/supabase.js';
import { useToast } from './hooks/useToast.js';
import { useAuth } from './hooks/useAuth.js';

import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import SpotsSection from './components/SpotsSection.jsx';
import ServicosSection from './components/ServicosSection.jsx';
import AuthModal from './components/AuthModal.jsx';
import ServicoModal from './components/ServicoModal.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const { toast, mostrarToast } = useToast();
  const { usuario, usuarioId, autenticar, logout } = useAuth(mostrarToast);

  const [praias, setPraias] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [modalLoginAberto, setModalLoginAberto] = useState(false);
  const [modalServicoAberto, setModalServicoAberto] = useState(false);

  const carregarServicos = useCallback(async () => {
    const data = await fazerRequisicaoSupabase('servico', 'order=id.desc');
    setServicos(data || []);
  }, []);

  // equivalente ao Promise.all([carregarPraias(), carregarServicos()]) do iniciarApp()
  useEffect(() => {
    fazerRequisicaoSupabase('praia', 'order=nivel_popularidade.desc').then((data) => {
      if (data) setPraias(data);
    });
    carregarServicos();
  }, [carregarServicos]);

  return (
    <>
      <Navbar usuario={usuario} onLoginClick={() => setModalLoginAberto(true)} onLogout={logout} />

      <Hero />

      <SpotsSection
        praias={praias}
        usuario={usuario}
        usuarioId={usuarioId}
        onExigirLogin={() => setModalLoginAberto(true)}
        mostrarToast={mostrarToast}
      />

      <ServicosSection
        servicos={servicos}
        usuario={usuario}
        onNovoServico={() => setModalServicoAberto(true)}
        onExigirLogin={() => setModalLoginAberto(true)}
      />

      <AuthModal aberto={modalLoginAberto} onFechar={() => setModalLoginAberto(false)} autenticar={autenticar} />

      <ServicoModal
        aberto={modalServicoAberto}
        onFechar={() => setModalServicoAberto(false)}
        onServicoCriado={carregarServicos}
        mostrarToast={mostrarToast}
      />

      <Toast toast={toast} />

      <footer className="footer">
        <span className="brand-wave">~</span>
        <span className="footer-text">SHAKA · Picos, Eventos & Serviços · Ceará, BR</span>
      </footer>
    </>
  );
}
