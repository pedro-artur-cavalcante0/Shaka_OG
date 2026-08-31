const SUPABASE_URL = 'https://lrzofimngusbcwlqbsts.supabase.co';

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyem9maW1uZ3VzYmN3bHFic3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Nzk4NjgsImV4cCI6MjA5MzA1NTg2OH0.SF21e1Sx_bueRV48exU08NGG2raNahY68nngPtWWLKU';


/* =========================================================
   REQUISIÇÃO PADRÃO AO SUPABASE
========================================================= */

export async function fazerRequisicaoSupabase(
  tabela,
  filtros = '',
  metodo = 'GET',
  corpo = null
) {
  let url = `${SUPABASE_URL}/rest/v1/${tabela}`;

  if (filtros) {
    url += `?${filtros}`;
  }

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  const opcoes = {
    method: metodo,
    headers
  };

  if (corpo) {
    opcoes.body = JSON.stringify(corpo);
  }

  try {
    const response = await fetch(url, opcoes);

    if (!response.ok) {
      const msg = await response.text();

      console.error(
        `Erro ${response.status} em [${metodo}] ${tabela}:`,
        msg
      );

      return null;
    }

    // PATCH/POST podem retornar resposta vazia
    if (response.status === 204) {
      return true;
    }

    const texto = await response.text();

    // Resposta vazia
    if (!texto) {
      return true;
    }

    try {
      return JSON.parse(texto);
    } catch (erro) {
      console.error(
        `Resposta inválida do Supabase em [${metodo}] ${tabela}:`,
        texto
      );

      return null;
    }

  } catch (erro) {
    console.error(`Erro ao acessar ${tabela}:`, erro);
    return null;
  }
}

/* =========================================================
   UPLOAD DA FOTO DO USUÁRIO
========================================================= */

export async function enviarFotoUsuario(usuarioId, arquivo) {

  const extensao = arquivo.name
    .split('.')
    .pop()
    .toLowerCase();

  const caminho = `${usuarioId}.${extensao}`;

  const url =
    `${SUPABASE_URL}/storage/v1/object/foto_usuario/${caminho}`;

  try {

    const response = await fetch(url, {
      method: 'POST',

      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': arquivo.type,
        'x-upsert': 'true'
      },

      body: arquivo
    });

    if (!response.ok) {

      const erro = await response.text();

      console.error(
        'Erro ao enviar foto:',
        erro
      );

      return null;
    }

    const urlPublica =
      `${SUPABASE_URL}/storage/v1/object/public/foto_usuario/${caminho}`;

    return urlPublica;

  } catch (erro) {

    console.error(
      'Erro ao enviar foto:',
      erro
    );

    return null;
  }
}