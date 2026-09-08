import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AuthModal from './AuthModal.jsx';
import ServicoModal from './ServicoModal.jsx';
import Toast from './Toast.jsx';

export default function Layout({
  children,
  usuario,
  toast,
  modalLoginAberto,
  modalServicoAberto,
  onLoginClick,
  onLogout,
  onFecharLogin,
  onFecharServico,
  autenticar,
  onServicoCriado,
  mostrarToast,
}) {
  return (
    <>
      <Navbar usuario={usuario} onLoginClick={onLoginClick} onLogout={onLogout} />

      {children}

      <Footer />

      <AuthModal aberto={modalLoginAberto} onFechar={onFecharLogin} autenticar={autenticar} />

      <ServicoModal
        aberto={modalServicoAberto}
        onFechar={onFecharServico}
        onServicoCriado={onServicoCriado}
        mostrarToast={mostrarToast}
      />

      <Toast toast={toast} />
    </>
  );
}
