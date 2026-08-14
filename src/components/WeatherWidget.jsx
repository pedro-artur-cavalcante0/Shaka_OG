export default function WeatherWidget({ carregando, clima }) {
  if (carregando) {
    return (
      <div className="clima-painel">
        <div className="clima-loading">
          <span className="loading-spinner" /> Carregando condições...
        </div>
      </div>
    );
  }

  if (!clima || clima.erro) {
    return (
      <div className="clima-painel">
        <div className="clima-erro">Não foi possível carregar as condições climáticas.</div>
      </div>
    );
  }

  const fontOnda = clima.estimado ? ' (est.)' : '';

  return (
    <div className="clima-painel">
      <div className="clima-conteudo">
        <div className="clima-principal">
          <div className="clima-temp-wrap">
            <span className="clima-icone-grande">{clima.emoji}</span>
            <div>
              <span className="clima-temp">{clima.temp}°C</span>
              <span className="clima-desc">{clima.descClima}</span>
            </div>
          </div>
          <div className="clima-atualizado">Atualizado {clima.hora}</div>
        </div>

        <div className="clima-grid">
          <div className="clima-item">
            <span className="clima-item-label">Vento</span>
            <span className="clima-item-val">{clima.ventoKmh} km/h</span>
            <span className="clima-item-sub">{clima.dirVentoTexto}</span>
          </div>
          <div className="clima-item">
            <span className="clima-item-label">Rajada</span>
            <span className="clima-item-val">{clima.rajadaKmh} km/h</span>
            <span className="clima-item-sub">máx.</span>
          </div>
          <div className="clima-item">
            <span className="clima-item-label">Onda</span>
            <span className="clima-item-val">{clima.alturaOnda.toFixed(1)} m{fontOnda}</span>
            <span className="clima-item-sub">{clima.periodoOnda}s</span>
          </div>
          <div className="clima-item">
            <span className="clima-item-label">Maré</span>
            <span className="clima-item-val">{clima.swellH.toFixed(1)} m</span>
            <span className="clima-item-sub">{clima.swellH >= 1 ? 'Maré alta' : 'Maré baixa'}</span>
          </div>
          <div className="clima-item">
            <span className="clima-item-label">Umidade</span>
            <span className="clima-item-val">{clima.umidade}%</span>
            <span className="clima-item-sub">relativa</span>
          </div>
          <div className="clima-item">
            <span className="clima-item-label">UV</span>
            <span className="clima-item-val">{clima.uvIndex.toFixed(1)}</span>
            <span className="clima-item-sub">{clima.uvLabel}</span>
          </div>
        </div>

        <div className="clima-score-wrap">
          <div className="clima-score-label">
            <span>Score para surf</span>
            <span className="clima-score-num">{clima.score}/10</span>
          </div>
          <div className="clima-score-bar">
            <div className="clima-score-fill" style={{ width: `${clima.score * 10}%`, background: clima.scoreColor }} />
          </div>
          <span className="clima-score-desc">{clima.scoreDesc}</span>
        </div>
      </div>
    </div>
  );
}
