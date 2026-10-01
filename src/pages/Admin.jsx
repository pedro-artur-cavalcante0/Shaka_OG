import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SERVICO_META } from '../components/ServicoCard.jsx';
import {
  listarSolicitacoes,
  aprovarSolicitacao,
  recusarSolicitacao,
} from '../lib/api.js';

const ABAS = [
  { tipo: 'servicos', label: 'Serviços' },
  { tipo: 'eventos', label: 'Eventos' },
];

const FILTROS = [
  { status: 'PENDENTE', label: 'Pendentes' },
  { status: 'APROVADA', label: 'Aprovadas' },
  { status: 'RECUSADA', label: 'Recusadas' },
  { status: '', label: 'Todas' },
];

const ANALISAVEIS = ['PENDENTE', 'EM_ANALISE'];

function formatarData(valor, comHora = false) {
  if (!valor) return '';
  const data = new Date(comHora ? valor : `${valor}T00:00:00`);
  return data.toLocaleString('pt-BR', comHora
    ? { dateStyle: 'short', timeStyle: 'short' }
    : { dateStyle: 'short' });
}

export default function Admin({ usuario, carregando, praias = [], mostrarToast }) {
  const [aba, setAba] = useState('servicos');
  const [filtro, setFiltro] = useState('PENDENTE');
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [acao, setAcao] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const ehAdmin = usuario?.role === 'admin';

  const carregar = useCallback(async () => {
    setCarregandoLista(true);
    const resposta = await listarSolicitacoes(aba, filtro);
    setCarregandoLista(false);

    if (resposta.ok) {
      setSolicitacoes(resposta.dados);
    } else {
      setSolicitacoes([]);
      mostrarToast(resposta.erro, 'erro');
    }
  }, [aba, filtro, mostrarToast]);

  useEffect(() => {
    if (ehAdmin) carregar();
  }, [ehAdmin, carregar]);

  if (carregando) return null;

  if (!ehAdmin) {
    return <Navigate to="/" replace />;
  }

  function nomePraia(id) {
    return praias.find((praia) => praia.id === id)?.nome || 'Praia não informada';
  }

  function abrirAcao(id, modo) {
    setAcao({ id, modo, tipoServico: '', observacao: '' });
  }

  async function confirmarAcao() {
    if (acao.modo === 'aprovar' && aba === 'servicos' && !acao.tipoServico) {
      mostrarToast('Escolha o tipo do serviço para aprovar.', 'erro');
      return;
    }

    setEnviando(true);
    const resposta = acao.modo === 'aprovar'
      ? await aprovarSolicitacao(aba, acao.id, aba === 'servicos' ? { tipo: acao.tipoServico } : {})
      : await recusarSolicitacao(aba, acao.id, acao.observacao.trim() || null);
    setEnviando(false);

    if (!resposta.ok) {
      mostrarToast(resposta.erro, 'erro');
      return;
    }

    mostrarToast(acao.modo === 'aprovar' ? 'Solicitação aprovada!' : 'Solicitação recusada.', 'ok');
    setAcao(null);
    carregar();
  }

  return (
    <section className="admin-page">
      <div className="admin-container">

        <header className="admin-header">
          <h1 className="admin-titulo">Painel do administrador</h1>
          <p className="admin-subtitulo">Analise as solicitações enviadas pelos usuários.</p>
        </header>

        <div className="admin-abas">
          {ABAS.map(({ tipo, label }) => (
            <button
              key={tipo}
              type="button"
              className={`admin-aba${aba === tipo ? ' ativa' : ''}`}
              onClick={() => { setAba(tipo); setAcao(null); }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-filtros">
          {FILTROS.map(({ status, label }) => (
            <button
              key={label}
              type="button"
              className={`admin-filtro${filtro === status ? ' ativo' : ''}`}
              onClick={() => { setFiltro(status); setAcao(null); }}
            >
              {label}
            </button>
          ))}
        </div>

        {carregandoLista ? (
          <p className="admin-vazio">Carregando solicitações...</p>
        ) : solicitacoes.length === 0 ? (
          <p className="admin-vazio">Nenhuma solicitação encontrada.</p>
        ) : (
          <ul className="admin-lista">
            {solicitacoes.map((item) => (
              <li key={item.id} className="admin-card">

                <div className="admin-card-topo">
                  <h3 className="admin-card-titulo">{item.titulo}</h3>
                  <span className={`admin-status admin-status--${item.status.toLowerCase()}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {item.descricao && <p className="admin-card-descricao">{item.descricao}</p>}

                <dl className="admin-card-info">
                  <div><dt>Praia</dt><dd>{nomePraia(item.id_praia)}</dd></div>
                  {item.data && <div><dt>Data do evento</dt><dd>{formatarData(item.data)}</dd></div>}
                  {item.whatsapp && <div><dt>WhatsApp</dt><dd>{item.whatsapp}</dd></div>}
                  {item.email && <div><dt>Email</dt><dd>{item.email}</dd></div>}
                  <div><dt>Enviada em</dt><dd>{formatarData(item.created_at, true)}</dd></div>
                  {item.analisado_em && <div><dt>Analisada em</dt><dd>{formatarData(item.analisado_em, true)}</dd></div>}
                  {item.observacao && <div><dt>Observação</dt><dd>{item.observacao}</dd></div>}
                </dl>

                {ANALISAVEIS.includes(item.status) && (
                  acao?.id === item.id ? (
                    <div className="admin-acao">

                      {acao.modo === 'aprovar' && aba === 'servicos' && (
                        <div className="form-group">
                          <label>Tipo do serviço</label>
                          <select
                            className="form-input"
                            value={acao.tipoServico}
                            onChange={(e) => setAcao({ ...acao, tipoServico: e.target.value })}
                          >
                            <option value="">Selecione...</option>
                            {Object.entries(SERVICO_META).map(([tipo, meta]) => (
                              <option key={tipo} value={tipo}>{meta.icone} {meta.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {acao.modo === 'recusar' && (
                        <div className="form-group">
                          <label>Motivo (opcional)</label>
                          <textarea
                            className="form-input"
                            rows={3}
                            value={acao.observacao}
                            onChange={(e) => setAcao({ ...acao, observacao: e.target.value })}
                          />
                        </div>
                      )}

                      {acao.modo === 'aprovar' && aba === 'eventos' && (
                        <p className="admin-confirmacao">O evento será publicado no site.</p>
                      )}

                      <div className="admin-botoes">
                        <button type="button" className="admin-btn admin-btn--cancelar" onClick={() => setAcao(null)} disabled={enviando}>
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className={`admin-btn admin-btn--${acao.modo}`}
                          onClick={confirmarAcao}
                          disabled={enviando}
                        >
                          {enviando ? 'Enviando...' : acao.modo === 'aprovar' ? 'Confirmar aprovação' : 'Confirmar recusa'}
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="admin-botoes">
                      <button type="button" className="admin-btn admin-btn--recusar" onClick={() => abrirAcao(item.id, 'recusar')}>
                        Recusar
                      </button>
                      <button type="button" className="admin-btn admin-btn--aprovar" onClick={() => abrirAcao(item.id, 'aprovar')}>
                        Aprovar
                      </button>
                    </div>
                  )
                )}

              </li>
            ))}
          </ul>
        )}

      </div>
    </section>
  );
}
