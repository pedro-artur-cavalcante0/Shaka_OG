// controllers/praias.controller.js
import { supabaseAdmin } from '../config/supabaseClient.js';

export async function listarPraias(req, res) {
  const { data, error } = await supabaseAdmin
    .from('praia')
    .select('*')
    .order('nivel_popularidade', { ascending: false });

  if (error) return res.status(500).json({ erro: 'Erro ao buscar praias.' });
  res.json(data);
}

export async function buscarPraia(req, res) {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin.from('praia').select('*').eq('id', id).maybeSingle();

  if (error) return res.status(500).json({ erro: 'Erro ao buscar praia.' });
  if (!data) return res.status(404).json({ erro: 'Praia não encontrada.' });
  res.json(data);
}

export async function buscarAnalisePraia(req, res) {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('analisePraia')
    .select('*')
    .eq('id_praia', id)
    .maybeSingle();

  if (error) return res.status(500).json({ erro: 'Erro ao buscar análise da praia.' });
  res.json(data || null);
}
