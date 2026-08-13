import { useEffect, useState } from 'react';

export default function Navbar({ usuario, onLoginClick, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  // equivalente ao addEventListener('scroll', ...) do script.js
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <a className="navbar-brand" href="#hero">
        <span className="brand-wave">~</span>
        <span className="brand-name">SHAKA</span>
      </a>

      <div className="navbar-links">
        <a href="#hero" className="nav-link">Início</a>
        <a href="#spots" className="nav-link">Spots</a>
        <a href="#servicos" className="nav-link">Serviços</a>
      </div>

      {usuario ? (
        <div className="usuario-info">
          <span>{usuario.nome}</span>
          <div className="usuario-avatar" onClick={onLogout}>
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
