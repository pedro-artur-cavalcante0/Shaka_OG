import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fazerRequisicaoSupabase,
  enviarFotoUsuario
} from '../lib/supabase.js';

export default function Perfil({ usuario, onLogout, mostrarToast, atualizarUsuario }) {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [foto, setFoto] = useState('');
  const [preview, setPreview] = useState('');

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) {
      navigate('/');
      return;
    }

    setNome(usuario.nome || '');
    setEmail(usuario.email || '');
    setFoto(usuario.foto || '');
    setPreview(usuario.foto || '');
  }, [usuario, navigate]);

 async function selecionarFoto(e) {
  const arquivo = e.target.files?.[0];

  if (!arquivo) return;

  if (!arquivo.type.startsWith('image/')) {
    mostrarToast('Selecione uma imagem válida.');
    return;
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    mostrarToast('A foto deve ter no máximo 5 MB.');
    return;
  }

  mostrarToast('Enviando foto...');

  const urlFoto = await enviarFotoUsuario(
    usuario.id,
    arquivo
  );

  if (!urlFoto) {
    mostrarToast('Não foi possível enviar a foto.');
    return;
  }

  setFoto(urlFoto);
  setPreview(urlFoto);

  mostrarToast('Foto enviada com sucesso!');
}
  async function salvarPerfil(e) {
    e.preventDefault();

    if (!usuario || !usuario.id) {
      mostrarToast('Usuário não encontrado.');
      return;
    }

    if (!nome.trim() || !email.trim()) {
      mostrarToast('Preencha nome e e-mail.');
      return;
    }

    setSalvando(true);

    try {
      const dados = {
        nome: nome.trim(),
        email: email.trim(),
        foto: foto
      };

      if (senha.trim() !== '') {
        dados.senha = senha;
      }

      const resultado = await fazerRequisicaoSupabase(
        'usuario',
        `id=eq.${usuario.id}`,
        'PATCH',
        dados
      );

      if (resultado === null) {
        throw new Error('Erro ao atualizar perfil.');
      }
      atualizarUsuario(dados);
      setSenha('');

      mostrarToast('Perfil atualizado com sucesso!');

    } catch (erro) {
      console.error(erro);
      mostrarToast('Não foi possível atualizar o perfil.');

    } finally {
      setSalvando(false);
    }
  }

  function sair() {
    onLogout();
    navigate('/');
  }

  if (!usuario) {
    return null;
  }

  return (
    <main className="perfil-page">

      <div className="perfil-bg">
        <div className="perfil-glow perfil-glow--1"></div>
        <div className="perfil-glow perfil-glow--2"></div>

        <div className="perfil-wave perfil-wave--back"></div>
        <div className="perfil-wave perfil-wave--front"></div>
      </div>

      <section className="perfil-content">

        <button
          type="button"
          className="perfil-back"
          onClick={() => navigate(-1)}
        >
          <span>←</span>
          Voltar
        </button>

        <div className="perfil-heading">

          <span className="perfil-label">
            <span className="perfil-label-dot"></span>
            CONTA SHAKA
          </span>

          <h1>
            Meu <em>perfil</em>
          </h1>

          <p>
            Gerencie suas informações e personalize sua experiência no Shaka.
          </p>

        </div>

        <div className="perfil-layout">

          {/* FOTO */}

          <div className="perfil-card perfil-card--foto">

            <div className="perfil-card-label">
              FOTO DE PERFIL
            </div>

            <div className="perfil-avatar-wrapper">

              {preview ? (
                <img
                  src={preview}
                  alt="Foto de perfil"
                  className="perfil-avatar"
                />
              ) : (
                <div className="perfil-avatar perfil-avatar--empty">
                  {nome
                    ? nome.charAt(0).toUpperCase()
                    : '?'}
                </div>
              )}

              <label
                className="perfil-photo-button"
                title="Alterar foto"
              >
                <span>📷</span>
                Alterar foto

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={selecionarFoto}
                  hidden
                />
              </label>

            </div>

            <p className="perfil-photo-help">
              JPG, PNG ou WEBP · Máximo 5 MB
            </p>

          </div>


          {/* DADOS */}

          <div className="perfil-card perfil-card--dados">

            <div className="perfil-card-label">
              INFORMAÇÕES DA CONTA
            </div>

            <form onSubmit={salvarPerfil}>

              <div className="perfil-field">

                <label htmlFor="perfil-nome">
                  Nome
                </label>

                <input
                  id="perfil-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                />

              </div>

              <div className="perfil-field">

                <label htmlFor="perfil-email">
                  E-mail
                </label>

                <input
                  id="perfil-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />

              </div>

              <div className="perfil-field">

                <label htmlFor="perfil-senha">
                  Nova senha
                </label>

                <input
                  id="perfil-senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Deixe vazio para manter a atual"
                />

                <span className="perfil-field-help">
                  Só preencha caso queira alterar sua senha.
                </span>

              </div>

              <button
                type="submit"
                className="perfil-save"
                disabled={salvando}
              >
                {salvando ? (
                  <>
                    <span className="perfil-spinner"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    Salvar alterações
                    <span>→</span>
                  </>
                )}
              </button>

            </form>

          </div>

        </div>


        {/* CONTA */}

        <div className="perfil-account">

          <div>
            <span className="perfil-account-title">
              Sua conta
            </span>

            <span className="perfil-account-description">
              Entrou no Shaka como {usuario.nome}.
            </span>
          </div>

          <button
            type="button"
            className="perfil-logout"
            onClick={sair}
          >
            Sair da conta
          </button>

        </div>

      </section>

    </main>
  );
}