// lib/supabase.js
// Mesma lógica da função fazerRequisicaoSupabase original,
// só que agora exportada como módulo em vez de função global.

const SUPABASE_URL = 'https://lrzofimngusbcwlqbsts.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyem9maW1uZ3VzYmN3bHFic3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Nzk4NjgsImV4cCI6MjA5MzA1NTg2OH0.SF21e1Sx_bueRV48exU08NGG2raNahY68nngPtWWLKU';

export async function fazerRequisicaoSupabase(tabela, filtros = '', metodo = 'GET', corpo = null) {
  let url = `${SUPABASE_URL}/rest/v1/${tabela}`;
  if (filtros) url += `?${filtros}`;

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: metodo === 'POST' ? 'return=representation' : '',
  };

  const opcoes = { method: metodo, headers };
  if (corpo) opcoes.body = JSON.stringify(corpo);

  try {
    const response = await fetch(url, opcoes);
    if (!response.ok) {
      const msg = await response.text();
      console.error(`Erro ${response.status} em [${metodo}] ${tabela}:`, msg);
      return null;
    }
    if (metodo === 'POST') return true;
    return await response.json();
  } catch (err) {
    console.error(`Erro ao acessar ${tabela}:`, err);
    return null;
  }
}
