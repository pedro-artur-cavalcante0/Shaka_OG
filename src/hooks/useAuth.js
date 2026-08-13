import { useEffect, useState, useCallback } from 'react';
import { fazerRequisicaoSupabase } from '../lib/supabase.js';

export function useAuth(mostrarToast) {
  const [usuario, setUsuario] = useState(null); // objeto do usuário logado, ou null
  const [usuarioId, setUsuarioId] = useState(null); // id anônimo ou do usuário logado

  // equivalente ao verificarUsuarioLogado() do script.js, rodando uma vez ao montar
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

  const autenticar = useCallback(
    async ({ modo, nome, email, senha }) => {
      if (!nome || !senha) {
        mostrarToast('Preencha todos os campos!', 'erro');
        return false;
      }

      if (modo === 'cadastro') {
        if (!email) {
          mostrarToast('Email é obrigatório para cadastro!', 'erro');
          return false;
        }
        const novoUser = { id: crypto.randomUUID(), nome, email, senha };
        let ok = await fazerRequisicaoSupabase('usuario', '', 'POST', novoUser);
        if (!ok) ok = await fazerRequisicaoSupabase('Usuario', '', 'POST', novoUser);
        if (ok) {
          setUsuario(novoUser);
          setUsuarioId(novoUser.id);
          localStorage.setItem('shakaUsuario', JSON.stringify(novoUser));
          mostrarToast(`Bem-vindo, ${nome}! 🌊`, 'ok');
          return true;
        }
        mostrarToast('Erro ao cadastrar. Tente novamente!', 'erro');
        return false;
      }

      // modo === 'login'
      let usuarios = await fazerRequisicaoSupabase('usuario', `nome=eq.${encodeURIComponent(nome)}`);
      if (!usuarios) usuarios = await fazerRequisicaoSupabase('Usuario', `nome=eq.${encodeURIComponent(nome)}`);
      if (usuarios && usuarios.length > 0) {
        const user = usuarios[0];
        if (user.senha === senha) {
          setUsuario(user);
          setUsuarioId(user.id);
          localStorage.setItem('shakaUsuario', JSON.stringify(user));
          mostrarToast(`Bem-vindo de volta, ${nome}! 🤙`, 'ok');
          return true;
        }
        mostrarToast('Senha incorreta!', 'erro');
        return false;
      }
      mostrarToast('Usuário não encontrado! Cadastre-se primeiro.', 'erro');
      return false;
    },
    [mostrarToast]
  );

  const logout = useCallback(() => {
    const novoId = crypto.randomUUID();
    setUsuario(null);
    setUsuarioId(novoId);
    localStorage.removeItem('shakaUsuario');
    localStorage.setItem('shakaUserId', novoId);
    mostrarToast('Até logo! 🌊', 'ok');
  }, [mostrarToast]);

  return { usuario, usuarioId, autenticar, logout };
}
