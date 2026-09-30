import { supabaseAdmin } from '../config/supabaseClient.js';

export async function listarServicos(req, res) {
  const { data, error } = await supabaseAdmin
    .from('servico')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar serviços.' });
  }
  res.json(data);
}

export async function criarServico(req, res) {
  const { nome, tipo, descricao, contato, id_praia } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'Nome e tipo são obrigatórios.' });
  }

  const { data, error } = await supabaseAdmin
    .from('servico')
    .insert({
      nome,
      tipo,
      descricao: descricao || null,
      contato: contato || null,
      id_praia: id_praia || null,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao cadastrar serviço.' });
  }
  res.status(201).json(data);
}
