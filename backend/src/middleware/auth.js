

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

function extrairToken(req) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  return tipo === 'Bearer' && token ? token : null;
}

export function exigirAuth(req, res, next) {
  const token = extrairToken(req);
  if (!token) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }
  try {
    req.usuario = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }
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

export function autenticacaoOpcional(req, res, next) {
  const token = extrairToken(req);
  if (token) {
    try {
      req.usuario = jwt.verify(token, env.jwtSecret);
    } catch {
      // token inválido: segue como anônimo em vez de quebrar a requisição
    }
  }
  next();
}
