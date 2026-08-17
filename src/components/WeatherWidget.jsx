function GraficoMare({ mare, mareAlta, mareBaixa, estimado }) {
  if (!mare || mare.length < 2) {
    return (
      <div className="clima-mare-indisponivel">
        Dados de maré indisponíveis.
      </div>
    );
  }

  const W = 640;
  const H = 220;

  const padLeft = 42;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 32;

  const graphW = W - padLeft - padRight;
  const graphH = H - padTop - padBottom;

  const alturas = mare.map(p => Number(p.altura) || 0);

  let min = Math.min(...alturas);
  let max = Math.max(...alturas);

  // Adiciona margem visual
  const margem = Math.max((max - min) * 0.18, 0.15);

  min -= margem;
  max += margem;

  const range = max - min || 1;

  const x = i =>
    padLeft +
    (i / (mare.length - 1)) * graphW;

  const y = valor =>
    padTop +
    graphH -
    ((valor - min) / range) * graphH;

  // ------------------------------------------------------------
  // Linha suave
  // ------------------------------------------------------------

  const pontos = mare.map((p, i) => ({
    x: x(i),
    y: y(Number(p.altura) || 0),
    altura: Number(p.altura) || 0,
    hora: p.hora,
  }));

  const linha = pontos
    .map((p, i) => {
      if (i === 0) {
        return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }

      const anterior = pontos[i - 1];

      const cx = (anterior.x + p.x) / 2;

      return `
        C
        ${cx.toFixed(1)} ${anterior.y.toFixed(1)},
        ${cx.toFixed(1)} ${p.y.toFixed(1)},
        ${p.x.toFixed(1)} ${p.y.toFixed(1)}
      `;
    })
    .join(' ');

  const area =
    `${linha}
     L ${pontos[pontos.length - 1].x.toFixed(1)} ${padTop + graphH}
     L ${pontos[0].x.toFixed(1)} ${padTop + graphH}
     Z`;

  // ------------------------------------------------------------
  // Agora
  // ------------------------------------------------------------

  const agora = new Date();

  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  let idxAgora = mare.findIndex(
    p => p.horaIdx === horaAtual
  );

  if (idxAgora < 0) {
    idxAgora = Math.min(
      mare.length - 1,
      Math.max(0, horaAtual)
    );
  }

  const pontoAgora = pontos[idxAgora];

  // ------------------------------------------------------------
  // Encontrar alta e baixa
  // ------------------------------------------------------------

  const idxAlta = mareAlta
    ? mare.findIndex(
        p =>
          p.hora === mareAlta.hora &&
          Number(p.altura) === Number(mareAlta.altura)
      )
    : -1;

  const idxBaixa = mareBaixa
    ? mare.findIndex(
        p =>
          p.hora === mareBaixa.hora &&
          Number(p.altura) === Number(mareBaixa.altura)
      )
    : -1;

  // ------------------------------------------------------------
  // Linhas de referência
  // ------------------------------------------------------------

  const nivelZero = y(0);

  // horários inferiores
  const quantidadeLabels = Math.min(6, mare.length);

  const indicesLabels = [];

  for (let i = 0; i < quantidadeLabels; i++) {
    const indice = Math.round(
      i * ((mare.length - 1) / (quantidadeLabels - 1 || 1))
    );

    indicesLabels.push(indice);
  }

  return (
    <div className="clima-mare-chart">

      <div className="clima-mare-header">
        <div>
          <span className="clima-mare-title">
            Nível da maré
          </span>

          <span className="clima-mare-unit">
            metros
          </span>
        </div>

        {estimado && (
          <span className="clima-mare-estimado">
            ESTIMADA
          </span>
        )}
      </div>

      <div className="clima-mare-svg-wrap">
       <svg
  viewBox={`0 0 ${W} ${H}`}
  width="100%"
  height="220"
  preserveAspectRatio="xMidYMid meet"
>
          <defs>

            <linearGradient
              id="mareGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#2dd4bf"
                stopOpacity="0.32"
              />

              <stop
                offset="100%"
                stopColor="#2dd4bf"
                stopOpacity="0.015"
              />
            </linearGradient>

            <filter
              id="mareGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                stdDeviation="2"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid horizontal */}

          <line
            x1={padLeft}
            y1={y(max)}
            x2={W - padRight}
            y2={y(max)}
            stroke="rgba(148,163,184,0.10)"
          />

          <line
            x1={padLeft}
            y1={nivelZero}
            x2={W - padRight}
            y2={nivelZero}
            stroke="rgba(148,163,184,0.18)"
            strokeDasharray="4 5"
          />

          <line
            x1={padLeft}
            y1={y(min)}
            x2={W - padRight}
            y2={y(min)}
            stroke="rgba(148,163,184,0.10)"
          />

          {/* Área */}

          <path
            d={area}
            fill="url(#mareGradient)"
            stroke="none"
          />

          {/* Linha principal */}

          <path
            d={linha}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#mareGlow)"
          />

          {/* Marcador de maré alta */}

          {idxAlta >= 0 && (
            <>
              <line
                x1={pontos[idxAlta].x}
                y1={pontos[idxAlta].y}
                x2={pontos[idxAlta].x}
                y2={padTop + graphH}
                stroke="rgba(45,212,191,0.20)"
                strokeDasharray="3 4"
              />

              <circle
                cx={pontos[idxAlta].x}
                cy={pontos[idxAlta].y}
                r="5"
                fill="#0f172a"
                stroke="#2dd4bf"
                strokeWidth="3"
              />

              <text
                x={pontos[idxAlta].x}
                y={Math.max(13, pontos[idxAlta].y - 12)}
                textAnchor="middle"
                fill="#5eead4"
                fontSize="10"
                fontWeight="700"
              >
                ALTA
              </text>
            </>
          )}

          {/* Marcador de maré baixa */}

          {idxBaixa >= 0 && (
            <>
              <line
                x1={pontos[idxBaixa].x}
                y1={pontos[idxBaixa].y}
                x2={pontos[idxBaixa].x}
                y2={padTop + graphH}
                stroke="rgba(148,163,184,0.15)"
                strokeDasharray="3 4"
              />

              <circle
                cx={pontos[idxBaixa].x}
                cy={pontos[idxBaixa].y}
                r="5"
                fill="#0f172a"
                stroke="#94a3b8"
                strokeWidth="3"
              />

              <text
                x={pontos[idxBaixa].x}
                y={pontos[idxBaixa].y + 20}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="10"
                fontWeight="700"
              >
                BAIXA
              </text>
            </>
          )}

          {/* AGORA */}

          {pontoAgora && (
            <>
              <line
                x1={pontoAgora.x}
                y1={padTop}
                x2={pontoAgora.x}
                y2={padTop + graphH}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              <circle
                cx={pontoAgora.x}
                cy={pontoAgora.y}
                r="6"
                fill="#2dd4bf"
                stroke="#0f172a"
                strokeWidth="3"
              />

              <circle
                cx={pontoAgora.x}
                cy={pontoAgora.y}
                r="9"
                fill="none"
                stroke="#2dd4bf"
                strokeOpacity="0.25"
                strokeWidth="2"
              />

              <text
                x={pontoAgora.x}
                y="12"
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="10"
                fontWeight="700"
              >
                AGORA
              </text>
            </>
          )}

          {/* Horários */}

          {indicesLabels.map((indice, i) => {
            const p = pontos[indice];

            return (
              <text
                key={i}
                x={p.x}
                y={H - 7}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
              >
                {mare[indice].hora}
              </text>
            );
          })}

          {/* Valores laterais */}

          <text
            x="4"
            y={y(max) + 4}
            fill="#64748b"
            fontSize="10"
          >
            {max.toFixed(1)}
          </text>

          <text
            x="4"
            y={nivelZero + 4}
            fill="#64748b"
            fontSize="10"
          >
            0.0
          </text>

          <text
            x="4"
            y={y(min) + 4}
            fill="#64748b"
            fontSize="10"
          >
            {min.toFixed(1)}
          </text>

          {/* Pontos invisíveis para tooltip */}

          {pontos.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="8"
              fill="transparent"
            >
              <title>
                {p.hora} • {p.altura.toFixed(2)} m
              </title>
            </circle>
          ))}
        </svg>
      </div>

      {/* Cards de alta / baixa */}

     <div className="clima-mare-extremos">

        {mareAlta && (
    <div className="clima-mare-extremo clima-mare-alta">

      <div className="clima-mare-extremo-icon">
        ↑
      </div>

      <div className="clima-mare-extremo-content">
        <span>MARÉ ALTA</span>

        <strong>
          {Math.abs(mareAlta.altura).toFixed(1)} m
        </strong>

        <small>
          {mareAlta.hora}
        </small>
      </div>

    </div>
  )}


        {mareBaixa && (
    <div className="clima-mare-extremo clima-mare-baixa">

      <div className="clima-mare-extremo-icon">
        ↓
      </div>

      <div className="clima-mare-extremo-content">
        <span>MARÉ BAIXA</span>

        <strong>
          {Math.abs(mareBaixa.altura).toFixed(1)} m
        </strong>

        <small>
          {mareBaixa.hora}
        </small>
      </div>

    </div>
  )}
      </div>

    </div>
  );
}

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

        <div className="clima-secao">
          <span className="clima-secao-titulo">Maré do dia</span>
          <GraficoMare
            mare={clima.mare}
            mareAlta={clima.mareAlta}
            mareBaixa={clima.mareBaixa}
            estimado={clima.mareEstimada}
          />
        </div>

    {clima.melhorPeriodo && (
  <div className="clima-melhor-periodo">

    <div className="clima-melhor-header">

      <div className="clima-melhor-title-wrap">

        <div className="clima-melhor-icon">
          🏄
        </div>

        <div>
          <span className="clima-melhor-overline">
            MELHOR JANELA
          </span>

          <span className="clima-melhor-title">
            Hora mais favorável para surfar
          </span>
        </div>

      </div>

      <div className="clima-melhor-score">
        <strong>
          {clima.melhorPeriodo.score.toFixed(1)}
        </strong>

        <span>/10</span>
      </div>

    </div>


    <div className="clima-melhor-horario">

      <div className="clima-hora">
        {clima.melhorPeriodo.inicio}
      </div>

      <div className="clima-horario-linha">
        <div className="clima-horario-ponto" />
        <div className="clima-horario-traco" />
        <div className="clima-horario-ponto" />
      </div>

      <div className="clima-hora">
        {clima.melhorPeriodo.fim}
      </div>

    </div>


    <div className="clima-melhor-bottom">

      <span className="clima-melhor-status">
        {clima.melhorPeriodo.desc}
      </span>

      <span className="clima-melhor-info">
        Janela de {(
          parseInt(clima.melhorPeriodo.fim) -
          parseInt(clima.melhorPeriodo.inicio)
        )} horas
      </span>

    </div>

  </div>
)}

        <div className="clima-score-wrap">
          <div className="clima-score-label">
            <span>Score para surf agora</span>
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