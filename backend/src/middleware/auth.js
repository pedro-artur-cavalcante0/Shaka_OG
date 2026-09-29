import { supabaseAdmin } from '../config/supabaseClient.js';

function extrairToken(req) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  return tipo === 'Bearer' && token ? token : null;
}

async function usuarioDoToken(token) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: perfil } = await supabaseAdmin
    .from('usuario')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    email: data.user.email,
    nome: data.user.user_metadata?.nome,
    role: perfil?.role || 'user',
  };
}

export async function exigirAuth(req, res, next) {
  const token = extrairToken(req);
  if (!token) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  try {
    req.usuario = await usuarioDoToken(token);
  } catch (erro) {
    return next(erro);
  }
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }
  next();
}

export function exigirAdmin(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  next();
}

export async function autenticacaoOpcional(req, res, next) {
  const token = extrairToken(req);
  if (token) {
    try {
      req.usuario = await usuarioDoToken(token);
    } catch {
      req.usuario = null;
    }
  }
  next();
}
