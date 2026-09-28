import { supabaseAdmin } from '../config/supabaseClient.js';

const STATUS = ['PENDENTE', 'EM_ANALISE', 'APROVADA', 'RECUSADA', 'CANCELADA'];
const ANALISAVEIS = ['PENDENTE', 'EM_ANALISE'];

const SOLICITACOES = {
  servicos: {
    tabela: 'solicitacao_servico',
    destino: 'servico',
    colunaDestino: 'id_servico',
    montarRegistro(solicitacao, body) {
      if (!body.tipo) return { erro: 'Informe o tipo do serviço para aprovar.' };
      const contato = [solicitacao.whatsapp, solicitacao.email].filter(Boolean).join(' / ');
      return {
        registro: {
          nome: solicitacao.titulo,
          tipo: body.tipo,
          descricao: solicitacao.descricao,
          contato: contato || null,
          id_praia: solicitacao.id_praia,
        },
      };
    },
  },
  eventos: {
    tabela: 'solicitacao_evento',
    destino: 'evento',
    colunaDestino: 'id_evento',
    montarRegistro(solicitacao) {
      return {
        registro: {
          titulo: solicitacao.titulo,
          descricao: solicitacao.descricao,
          data: solicitacao.data,
          id_praia: solicitacao.id_praia,
        },
      };
    },
  },
};

function configDoTipo(req, res) {
  const config = SOLICITACOES[req.params.tipo];
  if (!config) res.status(404).json({ erro: 'Tipo de solicitação inválido.' });
  return config;
}

async function buscarPendente(config, id, res) {
  const { data: solicitacao, error } = await supabaseAdmin
    .from(config.tabela)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar solicitação.' });
    return null;
  }
  if (!solicitacao) {
    res.status(404).json({ erro: 'Solicitação não encontrada.' });
    return null;
  }
  if (!ANALISAVEIS.includes(solicitacao.status)) {
    res.status(409).json({ erro: `Solicitação já foi analisada (${solicitacao.status}).` });
    return null;
  }
  return solicitacao;
}

async function registrarAnalise(config, id, campos, req) {
  const agora = new Date().toISOString();
  return supabaseAdmin
    .from(config.tabela)
    .update({ ...campos, id_usuario_analise: req.usuario.id, analisado_em: agora, updated_at: agora })
    .eq('id', id)
    .in('status', ANALISAVEIS)
    .select()
    .maybeSingle();
}

export async function listarSolicitacoes(req, res) {
  const config = configDoTipo(req, res);
  if (!config) return;

  const { status } = req.query;
  if (status && !STATUS.includes(status)) {
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS.join(', ')}.` });
  }

  let consulta = supabaseAdmin
    .from(config.tabela)
    .select('*')
    .order('created_at', { ascending: false });
  if (status) consulta = consulta.eq('status', status);

  const { data, error } = await consulta;
  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar solicitações.' });
  }
  res.json(data);
}

export async function aprovarSolicitacao(req, res) {
  const config = configDoTipo(req, res);
  if (!config) return;

  const solicitacao = await buscarPendente(config, req.params.id, res);
  if (!solicitacao) return;

  const { registro, erro } = config.montarRegistro(solicitacao, req.body || {});
  if (erro) return res.status(400).json({ erro });

  const { data: criado, error: erroCriacao } = await supabaseAdmin
    .from(config.destino)
    .insert(registro)
    .select()
    .single();

  if (erroCriacao) {
    console.error(erroCriacao);
    return res.status(500).json({ erro: 'Erro ao criar registro aprovado.' });
  }

  const { data: atualizada, error: erroAnalise } = await registrarAnalise(
    config,
    solicitacao.id,
    { status: 'APROVADA', [config.colunaDestino]: criado.id, observacao: req.body?.observacao || null },
    req
  );

  if (erroAnalise || !atualizada) {
    await supabaseAdmin.from(config.destino).delete().eq('id', criado.id);
    if (erroAnalise) console.error(erroAnalise);
    return erroAnalise
      ? res.status(500).json({ erro: 'Erro ao registrar aprovação.' })
      : res.status(409).json({ erro: 'Solicitação já foi analisada.' });
  }

  res.json({ solicitacao: atualizada, [config.destino]: criado });
}

export async function recusarSolicitacao(req, res) {
  const config = configDoTipo(req, res);
  if (!config) return;

  const solicitacao = await buscarPendente(config, req.params.id, res);
  if (!solicitacao) return;

  const { data: atualizada, error } = await registrarAnalise(
    config,
    solicitacao.id,
    { status: 'RECUSADA', observacao: req.body?.observacao || null },
    req
  );

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao registrar recusa.' });
  }
  if (!atualizada) return res.status(409).json({ erro: 'Solicitação já foi analisada.' });

  res.json({ solicitacao: atualizada });
}
