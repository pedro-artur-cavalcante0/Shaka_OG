import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const naHome = location.pathname === '/';

  function irParaSecao(e, id) {
    if (naHome) {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    e.preventDefault();
    navigate('/');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80);
  }

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <div className="navbar-brand">
            <span className="brand-wave">~</span>
            <span className="brand-name">SHAKA</span>
          </div>
          <p>Picos, condições do mar, eventos e serviços do litoral cearense, num só lugar.</p>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Navegação</span>
          <a className="footer-link" href="#hero" onClick={(e) => irParaSecao(e, 'hero')}>Início</a>
          <a className="footer-link" href="#spots" onClick={(e) => irParaSecao(e, 'spots')}>Spots</a>
          <a className="footer-link" href="#servicos" onClick={(e) => irParaSecao(e, 'servicos')}>Serviços</a>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Legal</span>
          <Link className="footer-link" to="/termos">Termos de Uso</Link>
          <Link className="footer-link" to="/privacidade">Política de Privacidade</Link>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Suporte</span>
          <Link className="footer-link" to="/contato">Contato</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span><span className="brand-wave">~</span> SHAKA · Picos, Eventos & Serviços · Ceará, BR</span>
        <span>© {new Date().getFullYear()} Shaka. Projeto acadêmico.</span>
      </div>
    </footer>
  );
}
