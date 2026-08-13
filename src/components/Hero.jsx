import { useMemo } from 'react';

// equivalente ao <script> que gerava as 28 partículas no HTML original
function gerarParticulas(qtd = 28) {
  return Array.from({ length: qtd }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${20 + Math.random() * 70}%`,
    dur: `${4 + Math.random() * 6}s`,
    delay: `${Math.random() * 6}s`,
    size: `${1 + Math.random() * 2.5}px`,
  }));
}

export default function Hero() {
  // useMemo garante que as partículas só são geradas uma vez (não a cada render)
  const particulas = useMemo(() => gerarParticulas(), []);

  function scrollParaSpots() {
    document.getElementById('spots')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-wave hero-wave--1" />
        <div className="hero-wave hero-wave--2" />
        <div className="hero-wave hero-wave--3" />
        <div className="hero-particles">
          {particulas.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                '--dur': p.dur,
                '--delay': p.delay,
                width: p.size,
                height: p.size,
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

        <div className="hero-stats">
          <div className="hero-stat">
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

      <div className="hero-scroll-hint" onClick={scrollParaSpots}>
        <span>role para explorar</span>
        <div className="hero-scroll-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
