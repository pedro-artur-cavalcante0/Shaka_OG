
// substitui a lógica que hoje vive em src/hooks/useAuth.js no front. A
// diferença essencial: senha nunca é comparada nem guardada em texto puro.
//


import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { env } from '../config/env.js';

const SALT_ROUNDS = 10;

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
}

function paraPublico(usuario) {
  const { id, nome, email, role } = usuario;
  return { id, nome, email, role };
}

export async function registrar(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
  }

  const { data: existente, error: erroBusca } = await supabaseAdmin
    .from('usuario')
    .select('id')
    .or(`email.eq.${email},nome.eq.${nome}`)
    .maybeSingle();

  if (erroBusca) {
    console.error(erroBusca);
    return res.status(500).json({ erro: 'Erro ao consultar usuário.' });
  }
  if (existente) return res.status(409).json({ erro: 'Usuário ou email já cadastrado.' });

  const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

  const { data: novoUsuario, error: erroInsercao } = await supabaseAdmin
    .from('usuario')
    .insert({ id: crypto.randomUUID(), nome, email, senha_hash, role: 'user' })
    .select()
    .single();

  if (erroInsercao) {
    console.error(erroInsercao);
    return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }

  const token = gerarToken(novoUsuario);
  return res.status(201).json({ token, usuario: paraPublico(novoUsuario) });
}

export async function login(req, res) {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({ erro: 'Nome e senha são obrigatórios.' });
  }

  const { data: usuario, error } = await supabaseAdmin
    .from('usuario')
    .select('*')
    .eq('nome', nome)
    .maybeSingle();

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao consultar usuário.' });
  }
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash || '');
  if (!senhaConfere) return res.status(401).json({ erro: 'Senha incorreta.' });

  const token = gerarToken(usuario);
  return res.json({ token, usuario: paraPublico(usuario) });
}
