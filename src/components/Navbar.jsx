import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ usuario, onLoginClick, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const naHome = location.pathname === '/';

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para rolar suavemente para uma seção da página se estiver em uma pagina diferente
  function irParaSecao(e, id) {
    if (naHome) return;
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <Link className="navbar-brand" to="/">
        <span className="brand-wave">~</span>
        <span className="brand-name">SHAKA</span>
      </Link>

      <div className="navbar-links">
        <a href="#hero" className="nav-link" onClick={(e) => irParaSecao(e, 'hero')}>Início</a>
        <a href="#spots" className="nav-link" onClick={(e) => irParaSecao(e, 'spots')}>Spots</a>
        <a href="#servicos" className="nav-link" onClick={(e) => irParaSecao(e, 'servicos')}>Serviços</a>
      </div>

      {usuario ? (
        <div className="usuario-info">
          <span>{usuario.nome}</span>
          <div className="usuario-avatar" onClick={onLogout} title="Sair">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
        </div>
      ) : (
        <button className="btn-login" onClick={onLoginClick}>
          Login
        </button>
      )}
    </nav>
  );
}
