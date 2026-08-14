import { useMemo, useState } from 'react';
import Map from './Map.jsx';
import BeachCard from './BeachCard.jsx';
import BeachDetailsPanel from './BeachDetailsPanel.jsx';

export default function SpotsSection({ praias, usuario, usuarioId, onExigirLogin, mostrarToast }) {
  const [busca, setBusca] = useState('');
  const [praiaSelecionada, setPraiaSelecionada] = useState(null);

  // equivalente a filtrarPraias() do script.js
  const praiasFiltradas = useMemo(() => {
    const t = busca.toLowerCase().trim();
    if (!t) return praias;
    return praias.filter(
      (p) =>
        p.nome.toLowerCase().includes(t) ||
        (p.tipo_onda || '').toLowerCase().includes(t) ||
        (p.perigos || '').toLowerCase().includes(t)
    );
  }, [praias, busca]);

  return (
    <section className="spots-section" id="spots">
      <div className="spots-header">
        <div className="spots-header-text">
          <span className="section-label">// SPOTS</span>
          <h2 className="section-title">Praias & Picos</h2>
          <p className="section-desc">Encontre o melhor pico para surfar ou explorar.</p>
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
          <Map praias={praiasFiltradas} onSelecionarPraia={setPraiaSelecionada} praiaFoco={praiaSelecionada} />
        </div>

        <div className="sidebar">
          <div>
            {praiasFiltradas.length === 0 ? (
              <p style={{ color: 'var(--text-3)', padding: 16, fontSize: '.9rem' }}>Nenhuma praia encontrada.</p>
            ) : (
              praiasFiltradas.map((p) => <BeachCard key={p.id} praia={p} onClick={setPraiaSelecionada} />)
            )}
          </div>

          {praiaSelecionada && (
            <BeachDetailsPanel
              praia={praiaSelecionada}
              usuario={usuario}
              usuarioId={usuarioId}
              onFechar={() => setPraiaSelecionada(null)}
              onExigirLogin={onExigirLogin}
              mostrarToast={mostrarToast}
            />
          )}
        </div>
      </div>
    </section>
  );
}
