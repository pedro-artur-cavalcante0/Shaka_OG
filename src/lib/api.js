import { supabase } from './supabase.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function buscarPerfil(token) {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error('Erro ao carregar perfil:', await response.text());
      return null;
    }

    const { usuario } = await response.json();
    return usuario;
  } catch (erro) {
    console.error('Erro ao acessar o backend:', erro);
    return null;
  }
}

async function requisicaoAutenticada(caminho, { metodo = 'GET', corpo } = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return { ok: false, erro: 'Sessão expirada. Faça login novamente.' };
  }

  try {
    const response = await fetch(`${API_URL}/api${caminho}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(corpo ? { 'Content-Type': 'application/json' } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });

    const dados = await response.json().catch(() => null);

    if (!response.ok) {
      return { ok: false, erro: dados?.erro || 'Erro ao comunicar com o servidor.' };
    }

    return { ok: true, dados };
  } catch (erro) {
    console.error('Erro ao acessar o backend:', erro);
    return { ok: false, erro: 'Servidor indisponível. Tente novamente.' };
  }
}

export function listarSolicitacoes(tipo, status) {
  const filtro = status ? `?status=${encodeURIComponent(status)}` : '';
  return requisicaoAutenticada(`/admin/solicitacoes/${tipo}${filtro}`);
}

export function aprovarSolicitacao(tipo, id, dados = {}) {
  return requisicaoAutenticada(`/admin/solicitacoes/${tipo}/${id}/aprovar`, {
    metodo: 'PATCH',
    corpo: dados,
  });
}

export function recusarSolicitacao(tipo, id, observacao) {
  return requisicaoAutenticada(`/admin/solicitacoes/${tipo}/${id}/recusar`, {
    metodo: 'PATCH',
    corpo: { observacao },
  });
}
