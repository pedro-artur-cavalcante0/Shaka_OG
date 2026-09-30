import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js'
import { buscarPerfil } from '../lib/api.js';

export function useAuth(mostrarToast) {

  const [usuario, setUsuario] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {

    localStorage.removeItem('shakaUsuario');

    async function restaurarSessao() {
      const { data } = await supabase.auth.getSession();
      const perfil = data.session && await buscarPerfil(data.session.access_token);

      if (perfil) {
        setUsuario(perfil);
        setUsuarioId(perfil.id);
        return;
      }

      const novoId = crypto.randomUUID();

      localStorage.setItem('shakaUserId', novoId);

      setUsuarioId(novoId);
    }

    restaurarSessao();

  }, []);


  const atualizarUsuario = useCallback((dadosAtualizados) => {

    setUsuario((usuarioAtual) => {

      if (!usuarioAtual) {
        return null;
      }

      const usuarioNovo = {
        ...usuarioAtual,
        ...dadosAtualizados
      };

      localStorage.setItem(
        'shakaUsuario',
        JSON.stringify(usuarioNovo)
      );

      return usuarioNovo;

    });

  }, []);

const autenticar = useCallback(
    async ({ modo, nome, email, senha }) => {
      if (!email || !senha) {
        mostrarToast('Preencha email e senha!', 'erro');
        return false;
      }

      if (modo === 'cadastro') {
        if (!nome) {
          mostrarToast('O nome é obrigatório para cadastro!', 'erro');
          return false;
        }

        // Criar usuário no Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome } },
        });

        if (authError) {
          mostrarToast(`Erro: ${authError.message}`, 'erro');
          return false;
        }

        if (!authData.session) {
          mostrarToast('Cadastro feito! Confirme pelo link enviado ao seu email para entrar. 📩', 'ok');
          return true;
        }

        // Salvar no supabase
        const novoUser = await buscarPerfil(authData.session.access_token);

        if (novoUser) {
          setUsuario(novoUser);
          setUsuarioId(novoUser.id);
          mostrarToast(`Bem-vindo, ${novoUser.nome}! 🌊`, 'ok');
          return true;
        }

        mostrarToast('Erro ao criar seu perfil. Tente novamente!', 'erro');
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        const mensagem = error.code === 'email_not_confirmed'
          ? 'Confirme seu email antes de entrar!'
          : 'Email ou senha incorretos!';
        mostrarToast(mensagem, 'erro');
        return false;
      }

      const perfil = await buscarPerfil(data.session.access_token);

      if (perfil) {
        setUsuario(perfil);
        setUsuarioId(perfil.id);
        mostrarToast(`Bem-vindo de volta, ${perfil.nome}! 🤙`, 'ok');
        return true;
      }

      await supabase.auth.signOut();
      mostrarToast('Não foi possível carregar seu perfil. Tente novamente!', 'erro');
      return false;
    },
    [mostrarToast]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    
    setUsuario(null);
    setUsuarioId(null);
    localStorage.removeItem('shakaUsuario'); // Por segurança

    mostrarToast('Até logo! 🌊', 'ok');
  }, [mostrarToast]);


  return {
    usuario,
    usuarioId,
    autenticar,
    logout,
    atualizarUsuario
  };
}