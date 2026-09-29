import { supabaseAdmin } from '../config/supabaseClient.js';

function paraPublico(usuario) {
  const { id, nome, email, foto, role } = usuario;
  return { id, nome, email, foto, role };
}

async function buscarPerfil(id) {
  return supabaseAdmin.from('usuario').select('*').eq('id', id).maybeSingle();
}

export async function eu(req, res) {
  let { data: usuario, error } = await buscarPerfil(req.usuario.id);

  if (!error && !usuario) {
    const { error: erroCriacao } = await supabaseAdmin.from('usuario').upsert(
      {
        id: req.usuario.id,
        nome: req.usuario.nome || req.usuario.email.split('@')[0],
        email: req.usuario.email,
        role: 'user',
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    ({ data: usuario, error } = erroCriacao ? { error: erroCriacao } : await buscarPerfil(req.usuario.id));
  }

  if (error || !usuario) {
    if (error) console.error(error);
    return res.status(500).json({ erro: 'Erro ao carregar perfil do usuário.' });
  }

  return res.json({ usuario: paraPublico(usuario) });
}
