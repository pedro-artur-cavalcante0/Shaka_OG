import { useEffect, useState } from 'react';
import { fazerRequisicaoSupabase } from '../lib/supabase.js';
import { carregarClima } from '../lib/weather.js';
import { analisarComentariosLocal, resumoSemComentarios, SENTIMENTO_CORES } from '../lib/resumoIA.js';
import WeatherWidget from './WeatherWidget.jsx';

function Estrelas({ valor }) {
  let s = '';
  for (let i = 0; i < 5; i++) s += i < valor ? '★' : '☆';
  return <span className="rating">{s}</span>;
}

export default function BeachDetailsPanel({ praia, usuario, usuarioId, onFechar, onExigirLogin, mostrarToast }) {
  const [climaCarregando, setClimaCarregando] = useState(true);
  const [clima, setClima] = useState(null);
  const [analise, setAnalise] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [resumoIA, setResumoIA] = useState(null);
  const [gerandoResumo, setGerandoResumo] = useState(false);

  const [formEventoAberto, setFormEventoAberto] = useState(false);
  const [eventoTitulo, setEventoTitulo] = useState('');
  const [eventoDescricao, setEventoDescricao] = useState('');
  const [eventoData, setEventoData] = useState('');

  // Atualiza clima, análise, eventos e comentários quando a praia muda
  useEffect(() => {
    if (!praia) return;

    setResumoIA(null);
    setFormEventoAberto(false);
    setClimaCarregando(true);

    carregarClima(praia.latitude, praia.longitude).then((dados) => {
      setClima(dados);
      setClimaCarregando(false);
    });

    fazerRequisicaoSupabase('analisePraia', `id_praia=eq.${praia.id}`).then((data) => {
      setAnalise(data && data.length > 0 ? data[0] : null);
    });

    carregarEventos();
    carregarComentarios();
    // Gerar resumo IA localmente com base nos comentários
  }, [praia?.id]);

  async function carregarEventos() {
    const data = await fazerRequisicaoSupabase('evento', `id_praia=eq.${praia.id}&order=data.asc`);
    setEventos(data || []);
  }

  async function carregarComentarios() {
    const data = await fazerRequisicaoSupabase('comentario', `id_praia=eq.${praia.id}&order=data.desc`);
    setComentarios(data || []);
  }

  async function criarEvento() {
    if (!eventoTitulo.trim() || !eventoData) {
      mostrarToast('Preencha título e data!', 'erro');
      return;
    }
    const novoEvento = { titulo: eventoTitulo.trim(), descricao: eventoDescricao.trim(), data: eventoData, id_praia: praia.id };
    let ok = await fazerRequisicaoSupabase('evento', '', 'POST', novoEvento);
    if (!ok) ok = await fazerRequisicaoSupabase('Evento', '', 'POST', novoEvento);

    if (ok) {
      mostrarToast('Evento criado! 📅', 'ok');
      setFormEventoAberto(false);
      setEventoTitulo('');
      setEventoDescricao('');
      setEventoData('');
      await carregarEventos();
    } else {
      mostrarToast('Erro ao criar evento.', 'erro');
    }
  }

  function abrirFormEvento() {
    if (!usuario) {
      mostrarToast('Faça login para adicionar eventos!', 'erro');
      onExigirLogin();
      return;
    }
    setFormEventoAberto(true);
  }

  async function enviarComentario() {
    const texto = comentarioTexto.trim();
    if (!texto) {
      mostrarToast('Digite uma mensagem antes de enviar.', 'erro');
      return;
    }
    const ok = await fazerRequisicaoSupabase('comentario', '', 'POST', {
      texto,
      tipo: 'avaliacao',
      id_praia: praia.id,
      id_usuario: usuarioId,
      data: new Date().toISOString(),
    });
    if (ok) {
      setComentarioTexto('');
      mostrarToast('Comentário enviado! 🤙', 'ok');
      await carregarComentarios();
    } else {
      mostrarToast('Não foi possível enviar o comentário.', 'erro');
    }
  }

  async function gerarResumo() {
    setGerandoResumo(true);
    if (!comentarios || comentarios.length === 0) {
      setResumoIA(resumoSemComentarios());
    } else {
      setResumoIA(analisarComentariosLocal(comentarios, praia));
    }
    setGerandoResumo(false);
  }

  if (!praia) return null;

  return (
    <div className="painel-detalhes">
      <div className="painel-titulo">
        <div>
          <h3>{praia.nome}</h3>
          <span className="badge">{praia.tipo_onda || 'Tipo não informado'}</span>
        </div>
        <button className="painel-fechar" onClick={onFechar}>✕</button>
      </div>

      <div className="praia-dados">
        <div className="info-card"><strong>Popularidade</strong><Estrelas valor={praia.nivel_popularidade} /></div>
        <div className="info-card"><strong>Dificuldade</strong><Estrelas valor={praia.nivel_dificuldade} /></div>
        <div className="info-card"><strong>Latitude</strong>{praia.latitude.toFixed(5)}</div>
        <div className="info-card"><strong>Longitude</strong>{praia.longitude.toFixed(5)}</div>
      </div>

      <WeatherWidget carregando={climaCarregando} clima={clima} />

      <div className="info-secao">
        <h4>⚠ Perigos</h4>
        <p>{praia.perigos || 'Nenhum perigo listado.'}</p>
      </div>

      <div className="info-secao">
        <h4>🌊 Análise da Praia</h4>
        {analise ? (
          <>
            <div className="info-card"><strong>Pedras</strong>{analise.pedras ? 'Sim' : 'Não'}</div>
            <div className="info-card"><strong>Corrente forte</strong>{analise.corrente_forte ? 'Sim' : 'Não'}</div>
            <div className="info-card"><strong>Ondas fortes</strong>{analise.ondas_fortes ? 'Sim' : 'Não'}</div>
          </>
        ) : (
          <div className="info-card">Nenhuma análise disponível.</div>
        )}
      </div>

      <div className="info-secao">
        <h4>📅 Eventos</h4>
        {eventos.length === 0 ? (
          <div className="info-card">Nenhum evento cadastrado.</div>
        ) : (
          eventos.map((e) => (
            <div className="info-card" key={e.id}>
              <strong>{e.titulo}</strong>
              <p style={{ marginTop: 4 }}>{e.descricao || 'Sem descrição'}</p>
              <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>
                {new Date(e.data).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ))
        )}

        {!formEventoAberto ? (
          <button className="btn-add-item" onClick={abrirFormEvento}>+ Adicionar Evento</button>
        ) : (
          <div className="form-inline">
            <input className="form-input" placeholder="Título do evento" value={eventoTitulo} onChange={(e) => setEventoTitulo(e.target.value)} />
            <textarea className="form-textarea" placeholder="Descrição" value={eventoDescricao} onChange={(e) => setEventoDescricao(e.target.value)} />
            <input className="form-input" type="date" value={eventoData} onChange={(e) => setEventoData(e.target.value)} />
            <div className="form-actions">
              <button className="btn-primary-sm" onClick={criarEvento}>Criar</button>
              <button className="btn-ghost-sm" onClick={() => setFormEventoAberto(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <div className="info-secao">
        <h4>🤖 Resumo da IA</h4>
        {!resumoIA ? (
          <div className="info-card">Selecione uma praia para ver o resumo inteligente.</div>
        ) : (
          <>
            <div className="info-card">
              <strong>Resumo geral</strong>
              <p style={{ marginTop: 6, lineHeight: 1.6 }}>{resumoIA.resumo}</p>
            </div>
            <div className="info-card">
              <strong>✅ Pontos positivos</strong>
              <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.8 }}>
                {resumoIA.pontos_positivos.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="info-card">
              <strong>⚠️ Pontos negativos</strong>
              <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.8 }}>
                {resumoIA.pontos_negativos.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="info-card">
              <strong>💡 Dicas</strong>
              <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.8 }}>
                {resumoIA.dicas.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="info-card" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>Sentimento geral:</strong>
              <span style={{ color: SENTIMENTO_CORES[resumoIA.sentimento_geral] || '#94a3b8', fontWeight: 600 }}>
                {resumoIA.sentimento_geral}
              </span>
            </div>
          </>
        )}
        <button className="btn-ia" disabled={gerandoResumo} onClick={gerarResumo}>
          {gerandoResumo ? 'Gerando...' : 'Gerar resumo por IA'}
        </button>
      </div>

      <div className="info-secao">
        <h4>💬 Comentários</h4>
        {comentarios.length === 0 ? (
          <div className="info-card">Seja o primeiro a comentar.</div>
        ) : (
          comentarios.map((c) => (
            <div className="comentario-item" key={c.id}>
              <span>{c.tipo || 'Comentário'} · {new Date(c.data).toLocaleString('pt-BR')}</span>
              <p>{c.texto}</p>
            </div>
          ))
        )}
        <textarea
          className="form-textarea"
          placeholder="Deixe sua dica ou alerta..."
          value={comentarioTexto}
          onChange={(e) => setComentarioTexto(e.target.value)}
        />
        <button className="btn-send" onClick={enviarComentario}>Enviar comentário</button>
      </div>
    </div>
  );
}
