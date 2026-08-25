// controllers/auth.controller.js
// Substitui a lógica que hoje vive em src/hooks/useAuth.js no front. A
// diferença essencial: senha nunca é comparada nem guardada em texto puro.
//
// Requer que a tabela `usuario` no Supabase tenha uma coluna `senha_hash`
// (texto) em vez de (ou além de) `senha`. Ver backend/README.md para o SQL
// de migração.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { env } from '../config/env.js';

const SALT_ROUNDS = 10;

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email }, env.jwtSecret, {
    expiresIn: '7d',
  });
}

function paraPublico(usuario) {

  const { id, nome, email } = usuario;
  return { id, nome, email };
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

  if (erroBusca) return res.status(500).json({ erro: 'Erro ao consultar usuário.' });
  if (existente) return res.status(409).json({ erro: 'Usuário ou email já cadastrado.' });

  const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

  const { data: novoUsuario, error: erroInsercao } = await supabaseAdmin
    .from('usuario')
    .insert({ nome, email, senha_hash })
    .select()
    .single();

  if (erroInsercao) return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });

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

  if (error) return res.status(500).json({ erro: 'Erro ao consultar usuário.' });
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash || '');
  if (!senhaConfere) return res.status(401).json({ erro: 'Senha incorreta.' });

  const token = gerarToken(usuario);
  return res.json({ token, usuario: paraPublico(usuario) });
}
