import { useMemo } from 'react';

// Bolhas de espuma do mar subindo no fundo do Hero — identidade de praia/surf.
function gerarBolhas(qtd = 14) {
  return Array.from({ length: qtd }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${58 + Math.random() * 37}%`, // nasce perto da linha das ondas
    dur: `${5 + Math.random() * 6}s`,
    delay: `${Math.random() * 6}s`,
    size: `${4 + Math.random() * 7}px`,
    wobble: `${6 + Math.random() * 14}px`,
    clara: Math.random() > 0.6,
  }));
}

// Pontinhos de luz reluzindo na crista da onda (sol batendo na água)
function gerarBrilhos(qtd = 9) {
  return Array.from({ length: qtd }).map((_, i) => ({
    id: i,
    left: `${4 + Math.random() * 92}%`,
    top: `${64 + Math.random() * 14}%`,
    dur: `${2.5 + Math.random() * 2.5}s`,
    delay: `${Math.random() * 4}s`,
    size: `${2 + Math.random() * 3}px`,
  }));
}

export default function Hero() {
  const bolhas = useMemo(() => gerarBolhas(), []);
  const brilhos = useMemo(() => gerarBrilhos(), []);

  function scrollParaSpots() {
    document.getElementById('spots')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        {/* Camadas de onda com parallax — mais ao fundo = mais lenta, mais suave e mais escura */}
        
        <div className="ocean-layer ocean-layer--mid" />
        <div className="light-sweep" />
        <div className="ocean-layer ocean-layer--front" />

        {/* Brilhos de luz refletindo na crista das ondas */}
        <div className="hero-glints" aria-hidden="true">
          {brilhos.map((g) => (
            <span
              key={g.id}
              className="glint"
              style={{
                left: g.left,
                top: g.top,
                width: g.size,
                height: g.size,
                '--dur': g.dur,
                '--delay': g.delay,
              }}
            />
          ))}
        </div>

        {/* Bolhas de espuma subindo */}
        <div className="hero-particles">
          {bolhas.map((b) => (
            <div
              key={b.id}
              className={`bolha${b.clara ? ' bolha--clara' : ''}`}
              style={{
                left: b.left,
                top: b.top,
                '--dur': b.dur,
                '--delay': b.delay,
                '--wobble': b.wobble,
                width: b.size,
                height: b.size,
              }}
            />
          ))}
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Ceará · Brasil
        </div>

        <h1 className="hero-title">
          <span className="hero-title-line hero-title-line--1">ENCONTRE</span>
          <span className="hero-title-line hero-title-line--2">
            SEU <em>PICO</em>
          </span>
          <span className="hero-title-line hero-title-line--3">PERFEITO</span>
        </h1>

        <p className="hero-subtitle">
          Praias, ondas, eventos e serviços — tudo que o surfista precisa numa plataforma só.
        </p>

        <div className="hero-actions">
          <a href="#spots" className="btn-primary">
            <span>Explorar Spots</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
          <a href="#servicos" className="btn-ghost">Ver Serviços</a>
        </div>

        {/* Área de estatísticas */}
        <div className="hero-stats">
          <div className="hero-stat">
            {/* Popular com dados reais dps */}
            <span className="hero-stat-number">20+</span>
            <span className="hero-stat-label">Spots</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">5★</span>
            <span className="hero-stat-label">Avaliações</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">CE</span>
            <span className="hero-stat-label">Litoral</span>
          </div>
        </div>
      </div>
    </section>
  );
}