// lib/resumoIA.js
// Mesma lógica de analisarComentariosLocal / contarOcorrenciasIA do script.js original.

function contarOcorrenciasIA(texto, palavras) {
  return palavras.reduce((total, p) => total + (texto.includes(p) ? 1 : 0), 0);
}

export function analisarComentariosLocal(comentarios, praia) {
  const textos = comentarios.map((c) => c.texto || '').filter((t) => t.trim() !== '');
  const textoGeral = textos.join(' ').toLowerCase();

  const palavrasPositivas = ['boa', 'bom', 'ótima', 'otima', 'excelente', 'maravilhosa', 'bonita', 'limpa', 'tranquila', 'segura', 'agradável', 'agradavel', 'recomendo', 'legal', 'perfeita', 'incrível', 'incrivel', 'top', 'linda', 'calma', 'organizada', 'gostei', 'vale a pena'];
  const palavrasNegativas = ['ruim', 'péssima', 'pessima', 'suja', 'lixo', 'perigosa', 'perigo', 'assalto', 'violenta', 'lotada', 'cheia', 'cara', 'problema', 'arriscado', 'corrente forte', 'poluída', 'poluida', 'mal cuidada', 'desorganizada', 'não recomendo', 'nao recomendo'];
  const palavrasSurf = ['onda', 'ondas', 'surf', 'surfar', 'surfista', 'mar', 'vento', 'corrente', 'pedra', 'pedras', 'forte', 'tubo', 'maré', 'mare'];
  const palavrasEstrutura = ['barraca', 'barracas', 'restaurante', 'estacionamento', 'banheiro', 'quiosque', 'serviço', 'servico', 'comida', 'atendimento', 'hotel', 'pousada', 'guarda-vidas', 'salva-vidas'];

  const positivos = contarOcorrenciasIA(textoGeral, palavrasPositivas);
  const negativos = contarOcorrenciasIA(textoGeral, palavrasNegativas);
  const termosSurf = contarOcorrenciasIA(textoGeral, palavrasSurf);
  const termosEstrutura = contarOcorrenciasIA(textoGeral, palavrasEstrutura);

  let sentimento_geral = 'neutro';
  if (textos.length < 2) sentimento_geral = 'sem dados suficientes';
  else if (positivos > negativos + 1) sentimento_geral = negativos > 0 ? 'positivo com ressalvas' : 'positivo';
  else if (negativos > positivos + 1) sentimento_geral = 'negativo';
  else if (positivos > 0 && negativos > 0) sentimento_geral = 'positivo com ressalvas';

  const pontos_positivos = [];
  if (positivos > 0) pontos_positivos.push('Os comentários apresentam percepções positivas sobre a praia.');
  if (termosSurf > 0) pontos_positivos.push('Há menções relacionadas ao mar, ondas ou prática de surf.');
  if (termosEstrutura > 0) pontos_positivos.push('Alguns comentários indicam presença de estrutura ou serviços próximos.');
  if (Number(praia.nivel_popularidade) >= 4) pontos_positivos.push('A praia possui alto nível de popularidade cadastrado no sistema.');
  if (pontos_positivos.length === 0) pontos_positivos.push('Ainda há poucas informações positivas identificadas automaticamente.');

  const pontos_negativos = [];
  if (negativos > 0) pontos_negativos.push('Foram identificadas ressalvas ou críticas nos comentários dos usuários.');
  if ((praia.perigos || '').trim() !== '') pontos_negativos.push(`Perigos cadastrados: ${praia.perigos}.`);
  if (Number(praia.nivel_dificuldade) >= 4) pontos_negativos.push('O nível de dificuldade cadastrado é elevado.');
  if (textoGeral.includes('corrente') || textoGeral.includes('pedra')) pontos_negativos.push('Existem menções a possíveis riscos naturais, como corrente ou pedras.');
  if (pontos_negativos.length === 0) pontos_negativos.push('Nenhum ponto negativo forte foi identificado automaticamente.');

  const dicas = [];
  if (Number(praia.nivel_dificuldade) >= 4) dicas.push('Recomendada maior cautela para iniciantes devido ao nível de dificuldade.');
  if ((praia.perigos || '').trim() !== '') dicas.push('Verifique os perigos informados antes de entrar no mar.');
  if (textoGeral.includes('lotada') || textoGeral.includes('cheia')) dicas.push('Evite horários de pico caso prefira uma experiência mais tranquila.');
  if (termosSurf > 0) dicas.push('Confira as condições do mar antes de surfar.');
  if (dicas.length === 0) dicas.push('Leia os comentários recentes para entender melhor as condições atuais da praia.');

  let resumo = `Com base em ${textos.length} comentário(s), a praia ${praia.nome} apresenta uma percepção geral `;
  if (sentimento_geral === 'positivo') resumo += 'positiva entre os usuários.';
  else if (sentimento_geral === 'negativo') resumo += 'negativa, com críticas relevantes nos comentários.';
  else if (sentimento_geral === 'positivo com ressalvas') resumo += 'positiva, mas com algumas ressalvas apontadas pelos usuários.';
  else if (sentimento_geral === 'sem dados suficientes') resumo += 'ainda limitada, pois há poucos comentários disponíveis.';
  else resumo += 'neutra ou mista, sem predominância clara.';
  if (termosSurf > 0) resumo += ' A análise identificou menções relacionadas ao mar, ondas ou surf.';
  if (termosEstrutura > 0) resumo += ' Também há indicações de estrutura ou serviços próximos.';
  if (negativos > 0) resumo += ' Alguns comentários indicam pontos de atenção antes da visita.';

  return { resumo, pontos_positivos, pontos_negativos, dicas, sentimento_geral };
}

export function resumoSemComentarios() {
  return {
    resumo: 'Ainda não há comentários suficientes para gerar uma análise automática desta praia.',
    pontos_positivos: [],
    pontos_negativos: [],
    dicas: ['Seja o primeiro a comentar para ajudar outros usuários do Shaka.'],
    sentimento_geral: 'sem dados suficientes',
  };
}

export const SENTIMENTO_CORES = {
  positivo: '#22c55e',
  'positivo com ressalvas': '#f59e0b',
  negativo: '#ef4444',
  neutro: '#94a3b8',
  'sem dados suficientes': '#94a3b8',
};
