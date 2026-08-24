import { useEffect, useMemo, useRef, useState } from 'react';
import Map from './Map.jsx';
import BeachCard from './BeachCard.jsx';
import BeachDetailsPanel from './BeachDetailsPanel.jsx';
import { calcularDistanciaKm, obterLocalizacaoUsuario, RAIO_PADRAO_KM } from '../lib/location.js';

export default function SpotsSection({ praias, usuario, usuarioId, onExigirLogin, mostrarToast }) {
  const [busca, setBusca] = useState('');
  const [praiaSelecionada, setPraiaSelecionada] = useState(null);
  const painelRef = useRef(null);

  // Localização do usuário e estado do filtro por distância
  const [userLocation, setUserLocation] = useState(null);
  // 'carregando' | 'ok' | 'negado' | 'indisponivel'
  const [statusLocalizacao, setStatusLocalizacao] = useState('carregando');
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Pede a localização assim que a página carrega.
  useEffect(() => {
    let cancelado = false;
    obterLocalizacaoUsuario()
      .then((loc) => {
        if (cancelado) return;
        setUserLocation(loc);
        setStatusLocalizacao('ok');
      })
      .catch((err) => {
        if (cancelado) return;
        // Sem localização não dá pra calcular distância — em vez de travar a
        // experiência, cai automaticamente pro modo "mostrar todas".
        setStatusLocalizacao(err?.code === 1 ? 'negado' : 'indisponivel');
        setMostrarTodas(true);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Anexa a distância (em km) de cada praia até o usuário, quando conhecida
  const praiasComDistancia = useMemo(() => {
    if (!userLocation) return praias.map((p) => ({ ...p, distanciaKm: null }));
    return praias.map((p) => ({
      ...p,
      distanciaKm: calcularDistanciaKm(userLocation.latitude, userLocation.longitude, p.latitude, p.longitude),
    }));
  }, [praias, userLocation]);

  // Lista final exibida: busca > "mostrar todas" > raio padrão de 30km
  const praiasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    // Com busca ativa: procura em TODAS as praias, sem limite de distância —
    // a pesquisa nunca fica presa ao raio de 30km.
    if (termo) {
      return praiasComDistancia
        .filter(
          (p) =>
            p.nome.toLowerCase().includes(termo) ||
            (p.tipo_onda || '').toLowerCase().includes(termo) ||
            (p.perigos || '').toLowerCase().includes(termo)
        )
        .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
    }

    // Sem busca, com "mostrar todas" ativo (ou sem localização disponível):
    // lista completa, mais perto primeiro quando a distância é conhecida.
    if (mostrarTodas || !userLocation) {
      return [...praiasComDistancia].sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
    }

    // Modo padrão: só praias a até 30km, ordenadas da mais próxima pra mais distante.
    return praiasComDistancia
      .filter((p) => p.distanciaKm !== null && p.distanciaKm <= RAIO_PADRAO_KM)
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [praiasComDistancia, busca, mostrarTodas, userLocation]);

  // A praia selecionada (por qualquer mecanismo) precisa continuar acessível
  // no mapa mesmo que tenha ficado de fora do filtro de distância/busca.
  const praiasParaMapa = useMemo(() => {
    if (!praiaSelecionada) return praiasFiltradas;
    const jaIncluida = praiasFiltradas.some((p) => p.id === praiaSelecionada.id);
    if (jaIncluida) return praiasFiltradas;
    return [...praiasFiltradas, { ...praiaSelecionada, distanciaKm: praiaSelecionada.distanciaKm ?? null }];
  }, [praiasFiltradas, praiaSelecionada]);

  const carregandoLocalizacao = statusLocalizacao === 'carregando' && busca.trim() === '';
  const modoPadraoAtivo = !mostrarTodas && userLocation && busca.trim() === '';

  useEffect(() => {
    if (!praiaSelecionada || !painelRef.current) return;
    const timer = setTimeout(() => {
      painelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => clearTimeout(timer);
  }, [praiaSelecionada]);

  return (
    <section className="spots-section" id="spots">
      <div className="spots-header">
        <div className="spots-header-text">
          <span className="section-label">// SPOTS</span>
          <h2 className="section-title">Praias & Picos</h2>
          <p className="section-desc">
            {modoPadraoAtivo
              ? `Praias a até ${RAIO_PADRAO_KM}km de você, das mais próximas às mais distantes.`
              : 'Encontre o melhor pico para surfar ou explorar.'}
          </p>
        </div>
        <div className="spots-search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="search-input"
            type="search"
            placeholder="Buscar praia, tipo ou perigo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="spots-body">
        <div className="spots-map-wrap">
          <Map praias={praiasParaMapa} onSelecionarPraia={setPraiaSelecionada} praiaFoco={praiaSelecionada} />
        </div>

        <div className="sidebar">
          <div>
            {statusLocalizacao === 'negado' && busca.trim() === '' && (
              <p className="spots-localizacao-aviso">
                Não conseguimos acessar sua localização, então estamos mostrando todas as praias.
              </p>
            )}
            {statusLocalizacao === 'indisponivel' && busca.trim() === '' && (
              <p className="spots-localizacao-aviso">
                Seu navegador não suporta localização automática — mostrando todas as praias.
              </p>
            )}

            {carregandoLocalizacao ? (
              <p className="spots-localizacao-carregando">
                <span className="loading-spinner" /> Buscando praias perto de você...
              </p>
            ) : praiasFiltradas.length === 0 ? (
              <p style={{ color: 'var(--text-3)', padding: 16, fontSize: '.9rem' }}>
                {busca.trim()
                  ? 'Nenhuma praia encontrada.'
                  : `Nenhuma praia num raio de ${RAIO_PADRAO_KM}km. Tente "mostrar todas as praias" abaixo.`}
              </p>
            ) : (
              praiasFiltradas.map((p) => <BeachCard key={p.id} praia={p} onClick={setPraiaSelecionada} />)
            )}

            {!carregandoLocalizacao && userLocation && busca.trim() === '' && (
              <button
                className="spots-toggle-distancia"
                onClick={() => setMostrarTodas((v) => !v)}
              >
                {mostrarTodas ? `← Mostrar praias próximas (até ${RAIO_PADRAO_KM}km)` : 'Mostrar todas as praias →'}
              </button>
            )}
          </div>

          {praiaSelecionada && (
            <div ref={painelRef}>
              <BeachDetailsPanel
                praia={praiaSelecionada}
                usuario={usuario}
                usuarioId={usuarioId}
                onFechar={() => setPraiaSelecionada(null)}
                onExigirLogin={onExigirLogin}
                mostrarToast={mostrarToast}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}