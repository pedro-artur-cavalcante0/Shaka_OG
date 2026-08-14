import { useState } from 'react';

export default function AuthModal({ aberto, onFechar, autenticar }) {
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function resetar() {
    setNome('');
    setEmail('');
    setSenha('');
    setModo('login');
  }

  function fechar() {
    resetar();
    onFechar();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await autenticar({ modo, nome, email, senha });
    if (ok) fechar();
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal">
        <div className="modal-header">
          <h3>{modo === 'login' ? 'Login' : 'Cadastro'}</h3>
          <button className="modal-fechar" onClick={fechar}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome de usuário</label>
            <input
              className="form-input"
              type="text"
              placeholder="seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          {modo === 'cadastro' && (
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Senha</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary-full">
            {modo === 'login' ? 'Login' : 'Cadastrar'}
          </button>

          <button
            type="button"
            className="btn-link"
            onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}
          >
            {modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
