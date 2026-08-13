const FEATURES = [
  {
    icone: '🗺️',
    titulo: 'Mapa interativo',
    desc: 'Veja todas as praias cadastradas no litoral cearense num mapa navegável, com popularidade e tipo de onda de cada ponto.',
  },
  {
    icone: '🌊',
    titulo: 'Condições em tempo real',
    desc: 'Vento, altura de onda, maré e um score de 0 a 10 pra saber se vale a pena entrar na água agora.',
  },
  {
    icone: '💬',
    titulo: 'Comunidade ativa',
    desc: 'Comentários e dicas de outros surfistas sobre cada praia, resumidos automaticamente por IA.',
  },
  {
    icone: '📅',
    titulo: 'Eventos locais',
    desc: 'Campeonatos, encontros e eventos de surf cadastrados por praia, direto na comunidade.',
  },
  {
    icone: '🏄',
    titulo: 'Diretório de serviços',
    desc: 'Aulas, aluguel de prancha, reparo, hospedagem e outros serviços pra quem tá de passagem.',
  },
  {
    icone: '⚠️',
    titulo: 'Alertas de segurança',
    desc: 'Perigos conhecidos de cada praia (correntes, pedras) ficam visíveis antes de você entrar no mar.',
  },
];

export default function FeaturesSection({ totalPraias, totalServicos }) {
  return (
    <section className="features-section" id="features">
      <div className="features-header">
        <span className="section-label">// COMO FUNCIONA</span>
        <h2 className="section-title">Tudo que você precisa, num só lugar</h2>
        <p className="section-desc">
          O Shaka reúne informação prática do litoral do Ceará — condições do mar,
          comunidade e serviços — pra você decidir onde e quando surfar.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.titulo}>
            <div className="feature-icon">{f.icone}</div>
            <h3>{f.titulo}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="stats-strip">
        <div className="stats-strip-item">
          <span className="stats-strip-number">{totalPraias > 0 ? totalPraias : '—'}</span>
          <span className="stats-strip-label">Praias cadastradas</span>
        </div>
        <div className="stats-strip-item">
          <span className="stats-strip-number">{totalServicos > 0 ? totalServicos : '—'}</span>
          <span className="stats-strip-label">Serviços listados</span>
        </div>
        <div className="stats-strip-item">
          <span className="stats-strip-number">CE</span>
          <span className="stats-strip-label">Litoral coberto</span>
        </div>
        <div className="stats-strip-item">
          <span className="stats-strip-number">24h</span>
          <span className="stats-strip-label">Clima atualizado</span>
        </div>
      </div>
    </section>
  );
}
