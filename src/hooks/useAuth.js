import { useEffect, useState, useCallback } from 'react';
import { fazerRequisicaoSupabase } from '../lib/supabase.js';
import { supabase } from '../lib/supabase.js'

export function useAuth(mostrarToast) {

  const [usuario, setUsuario] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {

    const salvo = localStorage.getItem('shakaUsuario');

    if (salvo) {

      const dados = JSON.parse(salvo);

      setUsuario(dados);
      setUsuarioId(dados.id);

    } else {

      const novoId = crypto.randomUUID();

      localStorage.setItem('shakaUserId', novoId);

      setUsuarioId(novoId);
    }

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
        });

        if (authError) {
          mostrarToast(`Erro: ${authError.message}`, 'erro');
          return false;
        }

        // Salvar no supabase
        if (authData.user) {
          const novoUser = {
            id: authData.user.id,
            nome,
            email,
            role: 'user'
          };

          const ok = await fazerRequisicaoSupabase('usuario', '', 'POST', novoUser);

          if (ok) {
            setUsuario(novoUser);
            setUsuarioId(novoUser.id);
            mostrarToast(`Bem-vindo, ${nome}! 🌊`, 'ok');
            return true;
          }
        }
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        mostrarToast('Email ou senha incorretos!', 'erro');
        return false;
      }

      if (data.user) {
        const perfis = await fazerRequisicaoSupabase(
          'usuario',
          `id=eq.${data.user.id}`
        );

        if (perfis && perfis.length > 0) {
          setUsuario(perfis[0]);
          setUsuarioId(perfis[0].id);
          mostrarToast(`Bem-vindo de volta, ${perfis[0].nome}! 🤙`, 'ok');
          return true;
        }
      }
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